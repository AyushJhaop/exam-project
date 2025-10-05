const express = require('express');
const Lead = require('../models/Lead');
const { LeadQualificationEngine } = require('../algorithms/priorityQueue');

const router = express.Router();
const qualificationEngine = new LeadQualificationEngine();

// Create new lead
router.post('/', async (req, res) => {
  try {
    const leadData = req.body;
    
    // Create lead in database
    const lead = new Lead(leadData);
    await lead.save();

    // Add to qualification engine
    const qualifiedLead = qualificationEngine.addLead(lead.toObject());

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead: qualifiedLead,
      queueStatus: qualificationEngine.getQueueStatus()
    });

  } catch (error) {
    console.error('Create lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create lead',
      error: error.message
    });
  }
});

// Get all leads with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.stage) filter.stage = req.query.stage;
    if (req.query.leadType) filter.leadType = req.query.leadType;
    if (req.query.source) filter.source = req.query.source;

    const leads = await Lead.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('assignedTo', 'firstName lastName email');

    const total = await Lead.countDocuments(filter);

    res.json({
      success: true,
      leads,
      pagination: {
        current: page,
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads',
      error: error.message
    });
  }
});

// Get next qualified lead from priority queue
router.get('/next-qualified', (req, res) => {
  try {
    const nextLead = qualificationEngine.getNextLead();
    
    if (!nextLead) {
      return res.json({
        success: true,
        message: 'No leads in queue',
        lead: null
      });
    }

    res.json({
      success: true,
      lead: nextLead,
      queueStatus: qualificationEngine.getQueueStatus()
    });

  } catch (error) {
    console.error('Get next lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get next lead',
      error: error.message
    });
  }
});

// Get lead qualification queue status
router.get('/queue-status', (req, res) => {
  try {
    const status = qualificationEngine.getQueueStatus();
    
    res.json({
      success: true,
      queueStatus: status
    });

  } catch (error) {
    console.error('Get queue status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get queue status',
      error: error.message
    });
  }
});

// Update lead stage (move through funnel)
router.patch('/:leadId/stage', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { stage, notes } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Update stage
    const previousStage = lead.stage;
    lead.stage = stage;

    // Add note if provided
    if (notes) {
      lead.notes.push({
        content: `Stage changed from ${previousStage} to ${stage}: ${notes}`,
        createdAt: new Date()
      });
    }

    // If converted, mark as converted
    if (stage === 'converted') {
      lead.converted = true;
      lead.conversionDate = new Date();
    }

    await lead.save();

    res.json({
      success: true,
      message: 'Lead stage updated successfully',
      lead
    });

  } catch (error) {
    console.error('Update lead stage error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead stage',
      error: error.message
    });
  }
});

// Add interaction to lead
router.post('/:leadId/interactions', async (req, res) => {
  try {
    const { leadId } = req.params;
    const { type, outcome, nextFollowUp } = req.body;

    const lead = await Lead.findById(leadId);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    // Add interaction
    lead.interactions.push({
      type,
      date: new Date(),
      outcome,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : undefined
    });

    await lead.save();

    res.json({
      success: true,
      message: 'Interaction added successfully',
      lead
    });

  } catch (error) {
    console.error('Add interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add interaction',
      error: error.message
    });
  }
});

// Get lead analytics
router.get('/analytics', async (req, res) => {
  try {
    const analytics = await Lead.aggregate([
      // Stage distribution
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          stageDistribution: {
            $push: {
              stage: '$_id',
              count: '$count'
            }
          },
          totalLeads: { $sum: '$count' }
        }
      }
    ]);

    // Conversion funnel
    const funnelData = await Lead.aggregate([
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 }
        }
      }
    ]);

    // Lead source analysis
    const sourceAnalysis = await Lead.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 },
          converted: {
            $sum: { $cond: ['$converted', 1, 0] }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $multiply: [
              { $divide: ['$converted', '$count'] },
              100
            ]
          }
        }
      }
    ]);

    // Time-based metrics
    const timeMetrics = await Lead.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          count: { $sum: 1 },
          converted: {
            $sum: { $cond: ['$converted', 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      analytics: {
        stageDistribution: analytics[0]?.stageDistribution || [],
        totalLeads: analytics[0]?.totalLeads || 0,
        funnelData,
        sourceAnalysis,
        timeMetrics,
        queueStatus: qualificationEngine.getQueueStatus()
      }
    });

  } catch (error) {
    console.error('Get lead analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead analytics',
      error: error.message
    });
  }
});

// Bulk process leads (for demonstration)
router.post('/bulk-process', async (req, res) => {
  try {
    const leads = await Lead.find({ stage: 'prospect' }).limit(50);
    
    const processed = qualificationEngine.processLeads(leads.map(lead => lead.toObject()));

    res.json({
      success: true,
      message: 'Leads processed successfully',
      processedCount: processed.length,
      processed,
      queueStatus: qualificationEngine.getQueueStatus()
    });

  } catch (error) {
    console.error('Bulk process leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process leads',
      error: error.message
    });
  }
});

// Convert lead to user account
router.post('/:id/convert', async (req, res) => {
  try {
    const { id } = req.params;
    const lead = await Lead.findById(id);
    
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    if (lead.converted) {
      return res.status(400).json({
        success: false,
        message: 'Lead already converted'
      });
    }

    // Update lead status
    lead.converted = true;
    lead.conversionDate = new Date();
    lead.stage = 'converted';
    await lead.save();

    // Remove from priority queue
    qualificationEngine.rescoreLeads();

    res.json({
      success: true,
      message: 'Lead converted successfully',
      lead,
      registrationData: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        role: lead.leadType,
        specialization: lead.specialization
      }
    });

  } catch (error) {
    console.error('Convert lead error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead',
      error: error.message
    });
  }
});

// Add interaction to lead
router.post('/:id/interaction', async (req, res) => {
  try {
    const { id } = req.params;
    const { type, outcome, nextFollowUp } = req.body;

    const lead = await Lead.findById(id);
    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      });
    }

    const interaction = {
      type,
      date: new Date(),
      outcome,
      nextFollowUp: nextFollowUp ? new Date(nextFollowUp) : null
    };

    lead.interactions.push(interaction);
    
    // Update lead priority based on interaction
    const updatedLead = qualificationEngine.addLead(lead.toObject());
    lead.priority = updatedLead.priority;
    
    await lead.save();

    res.json({
      success: true,
      message: 'Interaction logged successfully',
      lead
    });

  } catch (error) {
    console.error('Add interaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to log interaction',
      error: error.message
    });
  }
});

// Get lead statistics
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      todayLeads,
      monthlyLeads,
      totalLeads,
      convertedLeads,
      pendingFollowUp
    ] = await Promise.all([
      Lead.countDocuments({ createdAt: { $gte: todayStart } }),
      Lead.countDocuments({ createdAt: { $gte: monthStart } }),
      Lead.countDocuments({}),
      Lead.countDocuments({ converted: true }),
      Lead.countDocuments({ 
        stage: 'prospect',
        'interactions.nextFollowUp': { $lte: now }
      })
    ]);

    const conversionRate = totalLeads > 0 ? 
      ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    const stats = {
      todayLeads,
      monthlyLeads,
      totalLeads,
      convertedLeads,
      pendingFollowUp,
      conversionRate: parseFloat(conversionRate),
      queueStatus: qualificationEngine.getQueueStatus()
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get lead stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead statistics',
      error: error.message
    });
  }
});

// Get leads due for follow-up
router.get('/follow-up-due', async (req, res) => {
  try {
    const now = new Date();
    
    const leadsdue = await Lead.find({
      stage: 'prospect',
      $or: [
        { 'interactions.nextFollowUp': { $lte: now } },
        { 
          interactions: { $size: 0 },
          createdAt: { $lte: new Date(now.getTime() - 24 * 60 * 60 * 1000) }
        }
      ]
    })
    .populate('assignedTo', 'firstName lastName email')
    .sort({ priority: -1, createdAt: 1 })
    .limit(50);

    res.json({
      success: true,
      leads: leadsdue,
      count: leadsdue.length
    });

  } catch (error) {
    console.error('Get follow-up due leads error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get follow-up due leads',
      error: error.message
    });
  }
});

module.exports = router;
