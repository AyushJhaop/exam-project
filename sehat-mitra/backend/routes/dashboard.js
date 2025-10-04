const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const Lead = require('../models/Lead');
const { SlidingWindowAnalyzer } = require('../algorithms/slidingWindow');
const auth = require('../middleware/auth');

const router = express.Router();
const slidingWindow = new SlidingWindowAnalyzer();

// Apply authentication middleware
router.use(auth);

// Get comprehensive dashboard metrics
router.get('/overview', async (req, res) => {
  try {
    const { timeRange = '7' } = req.query; // days
    const days = parseInt(timeRange);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Basic metrics
    const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });
    const totalPatients = await User.countDocuments({ role: 'patient' });
    const totalDoctors = await User.countDocuments({ role: 'doctor' });
    
    // Appointment metrics
    const totalAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startDate }
    });
    
    const completedAppointments = await Appointment.countDocuments({
      createdAt: { $gte: startDate },
      status: 'completed'
    });

    // Revenue metrics
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          status: 'completed',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fee' },
          avgAppointmentValue: { $avg: '$fee' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Lead conversion metrics
    const leadMetrics = await Lead.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          convertedLeads: {
            $sum: { $cond: ['$converted', 1, 0] }
          }
        }
      }
    ]);

    // Appointment status distribution
    const appointmentStatus = await Appointment.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, avgAppointmentValue: 0, count: 0 };
    const leads = leadMetrics[0] || { totalLeads: 0, convertedLeads: 0 };

    res.json({
      success: true,
      overview: {
        users: {
          total: totalUsers,
          patients: totalPatients,
          doctors: totalDoctors,
          newUsers: await User.countDocuments({
            createdAt: { $gte: startDate }
          })
        },
        appointments: {
          total: totalAppointments,
          completed: completedAppointments,
          completionRate: totalAppointments > 0 ? 
            ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0,
          statusDistribution: appointmentStatus
        },
        revenue: {
          total: revenue.totalRevenue,
          average: revenue.avgAppointmentValue.toFixed(2),
          appointmentCount: revenue.count
        },
        leads: {
          total: leads.totalLeads,
          converted: leads.convertedLeads,
          conversionRate: leads.totalLeads > 0 ? 
            ((leads.convertedLeads / leads.totalLeads) * 100).toFixed(2) : 0
        },
        timeRange: `${days} days`
      }
    });

  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard overview',
      error: error.message
    });
  }
});

// Get RFM (Recency, Frequency, Monetary) segmentation
router.get('/rfm-analysis', async (req, res) => {
  try {
    const rfmAnalysis = await User.aggregate([
      {
        $match: { role: 'patient' }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patient',
          as: 'appointments'
        }
      },
      {
        $addFields: {
          // Recency: Days since last appointment
          recency: {
            $cond: {
              if: { $gt: [{ $size: '$appointments' }, 0] },
              then: {
                $divide: [
                  { $subtract: [new Date(), { $max: '$appointments.appointmentDate' }] },
                  1000 * 60 * 60 * 24
                ]
              },
              else: 999
            }
          },
          // Frequency: Number of appointments
          frequency: { $size: '$appointments' },
          // Monetary: Total spent
          monetary: {
            $sum: {
              $map: {
                input: {
                  $filter: {
                    input: '$appointments',
                    cond: { $eq: ['$$this.status', 'completed'] }
                  }
                },
                as: 'apt',
                in: '$$apt.fee'
              }
            }
          }
        }
      },
      {
        $addFields: {
          // RFM Scores (1-5 scale)
          recencyScore: {
            $cond: [
              { $lte: ['$recency', 7] }, 5,
              { $cond: [
                { $lte: ['$recency', 14] }, 4,
                { $cond: [
                  { $lte: ['$recency', 30] }, 3,
                  { $cond: [
                    { $lte: ['$recency', 60] }, 2,
                    1
                  ]}
                ]}
              ]}
            ]
          },
          frequencyScore: {
            $cond: [
              { $gte: ['$frequency', 10] }, 5,
              { $cond: [
                { $gte: ['$frequency', 5] }, 4,
                { $cond: [
                  { $gte: ['$frequency', 3] }, 3,
                  { $cond: [
                    { $gte: ['$frequency', 1] }, 2,
                    1
                  ]}
                ]}
              ]}
            ]
          },
          monetaryScore: {
            $cond: [
              { $gte: ['$monetary', 5000] }, 5,
              { $cond: [
                { $gte: ['$monetary', 2500] }, 4,
                { $cond: [
                  { $gte: ['$monetary', 1000] }, 3,
                  { $cond: [
                    { $gte: ['$monetary', 500] }, 2,
                    1
                  ]}
                ]}
              ]}
            ]
          }
        }
      },
      {
        $addFields: {
          rfmSegment: {
            $switch: {
              branches: [
                {
                  case: { 
                    $and: [
                      { $gte: ['$recencyScore', 4] },
                      { $gte: ['$frequencyScore', 4] },
                      { $gte: ['$monetaryScore', 4] }
                    ]
                  },
                  then: 'Champions'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$recencyScore', 3] },
                      { $gte: ['$frequencyScore', 3] },
                      { $gte: ['$monetaryScore', 3] }
                    ]
                  },
                  then: 'Loyal Customers'
                },
                {
                  case: {
                    $and: [
                      { $gte: ['$recencyScore', 4] },
                      { $lte: ['$frequencyScore', 2] }
                    ]
                  },
                  then: 'New Customers'
                },
                {
                  case: {
                    $and: [
                      { $lte: ['$recencyScore', 2] },
                      { $gte: ['$frequencyScore', 3] }
                    ]
                  },
                  then: 'At Risk'
                },
                {
                  case: {
                    $and: [
                      { $lte: ['$recencyScore', 2] },
                      { $lte: ['$frequencyScore', 2] }
                    ]
                  },
                  then: 'Lost Customers'
                }
              ],
              default: 'Potential Loyalists'
            }
          }
        }
      },
      {
        $group: {
          _id: '$rfmSegment',
          count: { $sum: 1 },
          avgRecency: { $avg: '$recency' },
          avgFrequency: { $avg: '$frequency' },
          avgMonetary: { $avg: '$monetary' },
          totalValue: { $sum: '$monetary' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      rfmAnalysis
    });

  } catch (error) {
    console.error('RFM analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform RFM analysis',
      error: error.message
    });
  }
});

// Get Customer Lifetime Value (CLV) analysis
router.get('/clv-analysis', async (req, res) => {
  try {
    const clvAnalysis = await User.aggregate([
      {
        $match: { role: 'patient' }
      },
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patient',
          as: 'appointments'
        }
      },
      {
        $addFields: {
          completedAppointments: {
            $filter: {
              input: '$appointments',
              cond: { $eq: ['$$this.status', 'completed'] }
            }
          }
        }
      },
      {
        $addFields: {
          totalSpent: { $sum: '$completedAppointments.fee' },
          appointmentCount: { $size: '$completedAppointments' },
          customerLifespanDays: {
            $cond: {
              if: { $gt: [{ $size: '$completedAppointments' }, 1] },
              then: {
                $divide: [
                  {
                    $subtract: [
                      { $max: '$completedAppointments.appointmentDate' },
                      { $min: '$completedAppointments.appointmentDate' }
                    ]
                  },
                  1000 * 60 * 60 * 24
                ]
              },
              else: 1
            }
          }
        }
      },
      {
        $addFields: {
          avgOrderValue: {
            $cond: {
              if: { $gt: ['$appointmentCount', 0] },
              then: { $divide: ['$totalSpent', '$appointmentCount'] },
              else: 0
            }
          },
          purchaseFrequency: {
            $cond: {
              if: { $gt: ['$customerLifespanDays', 0] },
              then: { $divide: ['$appointmentCount', '$customerLifespanDays'] },
              else: 0
            }
          }
        }
      },
      {
        $addFields: {
          clv: {
            $multiply: [
              '$avgOrderValue',
              '$purchaseFrequency',
              365 // Annualized
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          totalCustomers: { $sum: 1 },
          avgCLV: { $avg: '$clv' },
          totalCLV: { $sum: '$clv' },
          avgOrderValue: { $avg: '$avgOrderValue' },
          avgLifespanDays: { $avg: '$customerLifespanDays' },
          highValueCustomers: {
            $sum: { $cond: [{ $gte: ['$clv', 2000] }, 1, 0] }
          },
          clvDistribution: {
            $push: {
              customerId: '$_id',
              clv: '$clv',
              totalSpent: '$totalSpent',
              appointmentCount: '$appointmentCount'
            }
          }
        }
      }
    ]);

    const result = clvAnalysis[0] || {
      totalCustomers: 0,
      avgCLV: 0,
      totalCLV: 0,
      avgOrderValue: 0,
      avgLifespanDays: 0,
      highValueCustomers: 0,
      clvDistribution: []
    };

    // CLV segments
    const clvSegments = result.clvDistribution.reduce((acc, customer) => {
      let segment;
      if (customer.clv >= 5000) segment = 'High Value';
      else if (customer.clv >= 2000) segment = 'Medium Value';
      else if (customer.clv >= 500) segment = 'Low Value';
      else segment = 'New/Inactive';

      acc[segment] = (acc[segment] || 0) + 1;
      return acc;
    }, {});

    res.json({
      success: true,
      clvAnalysis: {
        ...result,
        clvSegments,
        clvDistribution: result.clvDistribution.slice(0, 100) // Limit for performance
      }
    });

  } catch (error) {
    console.error('CLV analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform CLV analysis',
      error: error.message
    });
  }
});

// Get NPS (Net Promoter Score) analysis
router.get('/nps-analysis', async (req, res) => {
  try {
    const npsData = await Appointment.aggregate([
      {
        $match: {
          'rating.patientRating.score': { $exists: true }
        }
      },
      {
        $addFields: {
          npsCategory: {
            $switch: {
              branches: [
                { case: { $gte: ['$rating.patientRating.score', 4] }, then: 'Promoter' },
                { case: { $gte: ['$rating.patientRating.score', 3] }, then: 'Passive' }
              ],
              default: 'Detractor'
            }
          }
        }
      },
      {
        $group: {
          _id: '$npsCategory',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating.patientRating.score' }
        }
      }
    ]);

    const totalResponses = npsData.reduce((sum, category) => sum + category.count, 0);
    const promoters = npsData.find(cat => cat._id === 'Promoter')?.count || 0;
    const detractors = npsData.find(cat => cat._id === 'Detractor')?.count || 0;
    
    const npsScore = totalResponses > 0 ? 
      Math.round(((promoters - detractors) / totalResponses) * 100) : 0;

    // Monthly NPS trend
    const monthlyNPS = await Appointment.aggregate([
      {
        $match: {
          'rating.patientRating.score': { $exists: true },
          appointmentDate: {
            $gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) // Last 6 months
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          promoters: {
            $sum: { $cond: [{ $gte: ['$rating.patientRating.score', 4] }, 1, 0] }
          },
          detractors: {
            $sum: { $cond: [{ $lt: ['$rating.patientRating.score', 3] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      },
      {
        $addFields: {
          nps: {
            $multiply: [
              { $divide: [{ $subtract: ['$promoters', '$detractors'] }, '$total'] },
              100
            ]
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      npsAnalysis: {
        currentNPS: npsScore,
        totalResponses,
        distribution: npsData,
        monthlyTrend: monthlyNPS,
        interpretation: {
          score: npsScore,
          category: npsScore >= 70 ? 'Excellent' : 
                   npsScore >= 50 ? 'Great' :
                   npsScore >= 30 ? 'Good' :
                   npsScore >= 0 ? 'Needs Improvement' : 'Critical'
        }
      }
    });

  } catch (error) {
    console.error('NPS analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform NPS analysis',
      error: error.message
    });
  }
});

// Get appointment analytics with sliding window
router.get('/appointment-analytics', async (req, res) => {
  try {
    const { days = 7 } = req.query;
    
    // Get recent appointments for sliding window analysis
    const recentAppointments = await Appointment.find({
      createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
    }).populate('doctor', 'firstName lastName doctorInfo.specialization');

    // Initialize sliding window analyzer
    const analyzer = new SlidingWindowAnalyzer(parseInt(days));
    
    // Add appointments to analyzer
    recentAppointments.forEach(apt => {
      analyzer.addAppointment(apt.toObject());
    });

    // Get metrics
    const appointmentMetrics = analyzer.getAppointmentMetrics();
    const revenueMetrics = analyzer.getRevenueMetrics();
    const acquisitionMetrics = analyzer.getPatientAcquisitionMetrics();
    const utilizationMetrics = analyzer.getDoctorUtilizationMetrics();

    // Specialization-wise analytics
    const specializationAnalytics = await Appointment.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: '$doctorInfo.doctorInfo.specialization'
      },
      {
        $group: {
          _id: '$doctorInfo.doctorInfo.specialization',
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fee', 0] }
          },
          avgFee: { $avg: '$fee' }
        }
      },
      {
        $sort: { totalAppointments: -1 }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        timeWindow: `${days} days`,
        appointments: appointmentMetrics,
        revenue: revenueMetrics,
        patientAcquisition: acquisitionMetrics,
        doctorUtilization: utilizationMetrics,
        specializationBreakdown: specializationAnalytics
      }
    });

  } catch (error) {
    console.error('Appointment analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointment analytics',
      error: error.message
    });
  }
});

// Get real-time dashboard data
router.get('/real-time', async (req, res) => {
  try {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    // Today's appointments
    const todayAppointments = await Appointment.find({
      appointmentDate: { $gte: today, $lt: tomorrow }
    }).populate('patient doctor', 'firstName lastName');

    // Ongoing appointments
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeStr = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;

    const ongoingAppointments = todayAppointments.filter(apt => {
      return apt.startTime <= currentTimeStr && apt.endTime > currentTimeStr && 
             apt.status === 'confirmed';
    });

    // Upcoming appointments (next 2 hours)
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const upcomingAppointments = await Appointment.find({
      appointmentDate: { $gte: now, $lte: twoHoursLater },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patient doctor', 'firstName lastName');

    // Recent activities
    const recentActivities = await Appointment.find({
      updatedAt: { $gte: new Date(now.getTime() - 60 * 60 * 1000) } // Last hour
    }).sort({ updatedAt: -1 }).limit(10)
      .populate('patient doctor', 'firstName lastName');

    res.json({
      success: true,
      realTimeData: {
        currentTime: now,
        todayStats: {
          totalAppointments: todayAppointments.length,
          ongoing: ongoingAppointments.length,
          upcoming: upcomingAppointments.length,
          completed: todayAppointments.filter(apt => apt.status === 'completed').length
        },
        ongoingAppointments,
        upcomingAppointments,
        recentActivities
      }
    });

  } catch (error) {
    console.error('Real-time dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time dashboard data',
      error: error.message
    });
  }
});

module.exports = router;
