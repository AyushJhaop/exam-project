const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');
const { AppointmentPatternAnalyzer } = require('../algorithms/slidingWindow');

const router = express.Router();

// Apply authentication middleware
router.use(auth);

// Get doctor profile
router.get('/profile', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const doctor = await User.findById(req.user.userId).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      doctor
    });

  } catch (error) {
    console.error('Get doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor profile',
      error: error.message
    });
  }
});

// Update doctor profile
router.put('/profile', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'profile', 'doctorInfo'
    ];

    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const doctor = await User.findByIdAndUpdate(
      req.user.userId,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      doctor
    });

  } catch (error) {
    console.error('Update doctor profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update doctor profile',
      error: error.message
    });
  }
});

// Update availability schedule
router.put('/availability', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { availableSlots } = req.body;

    if (!Array.isArray(availableSlots)) {
      return res.status(400).json({
        success: false,
        message: 'Available slots must be an array'
      });
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'doctorInfo.availableSlots': availableSlots,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      availableSlots: doctor.doctorInfo.availableSlots
    });

  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update availability',
      error: error.message
    });
  }
});

// Get doctor dashboard
router.get('/dashboard', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const doctorId = req.user.userId;

    // Get appointment statistics
    const appointmentStats = await Appointment.aggregate([
      { $match: { doctor: require('mongoose').Types.ObjectId(doctorId) } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalAppointments = appointmentStats.reduce((sum, stat) => sum + stat.count, 0);
    const completedAppointments = appointmentStats.find(stat => stat._id === 'completed')?.count || 0;

    // Get today's appointments
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const todayAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startOfDay, $lt: endOfDay }
    }).populate('patient', 'firstName lastName profile')
      .sort({ startTime: 1 });

    // Get upcoming appointments
    const upcomingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    }).populate('patient', 'firstName lastName profile')
      .sort({ appointmentDate: 1, startTime: 1 })
      .limit(10);

    // Get revenue metrics
    const revenueData = await Appointment.aggregate([
      {
        $match: {
          doctor: require('mongoose').Types.ObjectId(doctorId),
          status: 'completed',
          paymentStatus: 'paid'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$fee' },
          avgRevenue: { $avg: '$fee' },
          count: { $sum: 1 }
        }
      }
    ]);

    const revenue = revenueData[0] || { totalRevenue: 0, avgRevenue: 0, count: 0 };

    // Get rating information
    const doctor = await User.findById(doctorId)
      .select('doctorInfo.rating firstName lastName');

    // Get recent patient reviews
    const recentReviews = await Appointment.find({
      doctor: doctorId,
      'rating.patientRating': { $exists: true }
    }).populate('patient', 'firstName lastName')
      .sort({ 'rating.patientRating.createdAt': -1 })
      .limit(5)
      .select('rating.patientRating patient appointmentDate');

    res.json({
      success: true,
      dashboard: {
        appointmentStats: {
          total: totalAppointments,
          completed: completedAppointments,
          completionRate: totalAppointments > 0 ? 
            ((completedAppointments / totalAppointments) * 100).toFixed(1) : 0,
          statusBreakdown: appointmentStats
        },
        todayAppointments: {
          count: todayAppointments.length,
          appointments: todayAppointments
        },
        upcomingAppointments,
        revenue: {
          total: revenue.totalRevenue,
          average: revenue.avgRevenue.toFixed(2),
          completedAppointments: revenue.count
        },
        rating: doctor.doctorInfo.rating,
        recentReviews
      }
    });

  } catch (error) {
    console.error('Get doctor dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor dashboard',
      error: error.message
    });
  }
});

// Get doctor's appointment analytics
router.get('/analytics', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const doctorId = req.user.userId;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get doctor's appointments for pattern analysis
    const appointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: { $gte: startDate }
    }).sort({ appointmentDate: 1 });

    // Initialize pattern analyzer
    const patternAnalyzer = new AppointmentPatternAnalyzer();
    patternAnalyzer.setAppointments(appointments);

    // Get peak hours analysis
    const peakHours = patternAnalyzer.findPeakHours();

    // Get appointment clusters (busy periods)
    const appointmentClusters = patternAnalyzer.findAppointmentClusters();

    // Get workload balance
    const workloadBalance = patternAnalyzer.analyzeWorkloadBalance()
      .find(doc => doc.doctorId === doctorId);

    // Monthly trend analysis
    const monthlyTrend = await Appointment.aggregate([
      {
        $match: {
          doctor: require('mongoose').Types.ObjectId(doctorId),
          appointmentDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$appointmentDate' },
            month: { $month: '$appointmentDate' }
          },
          totalAppointments: { $sum: 1 },
          completedAppointments: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          totalRevenue: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fee', 0] }
          },
          avgRating: {
            $avg: { $cond: [{ $exists: ['$rating.patientRating.score'] }, '$rating.patientRating.score', null] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Patient demographics
    const patientDemographics = await Appointment.aggregate([
      {
        $match: {
          doctor: require('mongoose').Types.ObjectId(doctorId),
          appointmentDate: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $unwind: '$patientInfo'
      },
      {
        $group: {
          _id: '$patientInfo.profile.gender',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      analytics: {
        timeRange: `${days} days`,
        peakHours,
        appointmentClusters: appointmentClusters.slice(0, 5), // Top 5 busiest periods
        workloadBalance,
        monthlyTrend,
        patientDemographics,
        totalAnalyzedAppointments: appointments.length
      }
    });

  } catch (error) {
    console.error('Get doctor analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor analytics',
      error: error.message
    });
  }
});

// Get all doctors (for admin/patient use)
router.get('/list', async (req, res) => {
  try {
    const { 
      specialization, 
      verified, 
      page = 1, 
      limit = 10,
      sortBy = 'rating'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { 
      role: 'doctor', 
      isActive: true 
    };

    if (specialization) {
      filter['doctorInfo.specialization'] = specialization;
    }

    if (verified !== undefined) {
      filter['doctorInfo.verified'] = verified === 'true';
    }

    let sortOptions = {};
    switch (sortBy) {
      case 'rating':
        sortOptions = { 'doctorInfo.rating.average': -1 };
        break;
      case 'experience':
        sortOptions = { 'doctorInfo.experience': -1 };
        break;
      case 'fee':
        sortOptions = { 'doctorInfo.consultationFee': 1 };
        break;
      default:
        sortOptions = { 'doctorInfo.rating.average': -1 };
    }

    const doctors = await User.find(filter)
      .select('firstName lastName doctorInfo profile createdAt')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get doctors list error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctors list',
      error: error.message
    });
  }
});

// Update consultation fee
router.put('/consultation-fee', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { consultationFee } = req.body;

    if (!consultationFee || consultationFee < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid consultation fee is required'
      });
    }

    const doctor = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'doctorInfo.consultationFee': parseFloat(consultationFee),
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('doctorInfo.consultationFee');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    res.json({
      success: true,
      message: 'Consultation fee updated successfully',
      consultationFee: doctor.doctorInfo.consultationFee
    });

  } catch (error) {
    console.error('Update consultation fee error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update consultation fee',
      error: error.message
    });
  }
});

// Get doctor statistics
router.get('/statistics', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const doctorId = req.user.userId;

    // Get comprehensive statistics
    const stats = await Appointment.aggregate([
      { $match: { doctor: require('mongoose').Types.ObjectId(doctorId) } },
      {
        $facet: {
          statusStats: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          monthlyStats: [
            {
              $group: {
                _id: {
                  year: { $year: '$appointmentDate' },
                  month: { $month: '$appointmentDate' }
                },
                appointments: { $sum: 1 },
                revenue: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$fee', 0] } }
              }
            },
            { $sort: { '_id.year': -1, '_id.month': -1 } },
            { $limit: 12 }
          ],
          averageRating: [
            { $match: { 'rating.patientRating.score': { $exists: true } } },
            { $group: { _id: null, avgRating: { $avg: '$rating.patientRating.score' } } }
          ],
          patientRetention: [
            { $group: { _id: '$patient', appointments: { $sum: 1 } } },
            {
              $group: {
                _id: null,
                totalPatients: { $sum: 1 },
                returningPatients: { $sum: { $cond: [{ $gt: ['$appointments', 1] }, 1, 0] } }
              }
            }
          ]
        }
      }
    ]);

    const result = stats[0];
    const retention = result.patientRetention[0] || { totalPatients: 0, returningPatients: 0 };

    res.json({
      success: true,
      statistics: {
        statusDistribution: result.statusStats,
        monthlyTrend: result.monthlyStats.reverse(),
        averageRating: result.averageRating[0]?.avgRating?.toFixed(2) || '0',
        patientRetention: {
          ...retention,
          retentionRate: retention.totalPatients > 0 ? 
            ((retention.returningPatients / retention.totalPatients) * 100).toFixed(2) : 0
        }
      }
    });

  } catch (error) {
    console.error('Get doctor statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor statistics',
      error: error.message
    });
  }
});

// Schedule Management Routes

// Get doctor's schedule for a specific date
router.get('/schedule', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { date } = req.query;
    const doctor = await User.findById(req.user.userId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get schedule for the date
    const schedule = doctor.doctorInfo?.schedule || {};
    const daySchedule = date ? schedule[date] : schedule;

    res.json({
      success: true,
      schedule: daySchedule
    });

  } catch (error) {
    console.error('Get schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get schedule',
      error: error.message
    });
  }
});

// Add/Update schedule slot
router.post('/schedule', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { date, startTime, endTime, type, maxAppointments, notes } = req.body;

    if (!date || !startTime || !endTime || !type) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time, end time, and type are required'
      });
    }

    const doctor = await User.findById(req.user.userId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Initialize schedule if it doesn't exist
    if (!doctor.doctorInfo) {
      doctor.doctorInfo = {};
    }
    if (!doctor.doctorInfo.schedule) {
      doctor.doctorInfo.schedule = {};
    }
    if (!doctor.doctorInfo.schedule[date]) {
      doctor.doctorInfo.schedule[date] = [];
    }

    // Create new time slot
    const newSlot = {
      _id: new Date().getTime().toString(), // Simple ID generation
      startTime,
      endTime,
      type,
      maxAppointments: maxAppointments || 1,
      notes: notes || '',
      createdAt: new Date()
    };

    doctor.doctorInfo.schedule[date].push(newSlot);
    
    await doctor.save();

    res.json({
      success: true,
      message: 'Schedule slot added successfully',
      slot: newSlot
    });

  } catch (error) {
    console.error('Add schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add schedule slot',
      error: error.message
    });
  }
});

// Update schedule slot
router.put('/schedule/:slotId', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { slotId } = req.params;
    const { date, startTime, endTime, type, maxAppointments, notes } = req.body;

    const doctor = await User.findById(req.user.userId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Find and update the slot
    let slotFound = false;
    if (doctor.doctorInfo?.schedule?.[date]) {
      const slotIndex = doctor.doctorInfo.schedule[date].findIndex(
        slot => slot._id === slotId
      );
      
      if (slotIndex !== -1) {
        doctor.doctorInfo.schedule[date][slotIndex] = {
          ...doctor.doctorInfo.schedule[date][slotIndex],
          startTime: startTime || doctor.doctorInfo.schedule[date][slotIndex].startTime,
          endTime: endTime || doctor.doctorInfo.schedule[date][slotIndex].endTime,
          type: type || doctor.doctorInfo.schedule[date][slotIndex].type,
          maxAppointments: maxAppointments || doctor.doctorInfo.schedule[date][slotIndex].maxAppointments,
          notes: notes || doctor.doctorInfo.schedule[date][slotIndex].notes,
          updatedAt: new Date()
        };
        slotFound = true;
      }
    }

    if (!slotFound) {
      return res.status(404).json({
        success: false,
        message: 'Schedule slot not found'
      });
    }

    await doctor.save();

    res.json({
      success: true,
      message: 'Schedule slot updated successfully'
    });

  } catch (error) {
    console.error('Update schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update schedule slot',
      error: error.message
    });
  }
});

// Delete schedule slot
router.delete('/schedule/:slotId', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { slotId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const doctor = await User.findById(req.user.userId);
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Find and remove the slot
    let slotFound = false;
    if (doctor.doctorInfo?.schedule?.[date]) {
      const slotIndex = doctor.doctorInfo.schedule[date].findIndex(
        slot => slot._id === slotId
      );
      
      if (slotIndex !== -1) {
        doctor.doctorInfo.schedule[date].splice(slotIndex, 1);
        slotFound = true;
      }
    }

    if (!slotFound) {
      return res.status(404).json({
        success: false,
        message: 'Schedule slot not found'
      });
    }

    await doctor.save();

    res.json({
      success: true,
      message: 'Schedule slot deleted successfully'
    });

  } catch (error) {
    console.error('Delete schedule slot error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule slot',
      error: error.message
    });
  }
});

// Get doctor's appointments for a specific date
router.get('/appointments', async (req, res) => {
  try {
    if (req.user.role !== 'doctor') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only doctors can access this route.'
      });
    }

    const { date } = req.query;
    
    let query = { doctor: req.user.userId };
    if (date) {
      query.date = date;
    }

    const appointments = await Appointment.find(query)
      .populate('patient', 'name email phone profileImage')
      .sort({ date: -1, time: 1 });

    res.json({
      success: true,
      appointments
    });

  } catch (error) {
    console.error('Get doctor appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
});

module.exports = router;
