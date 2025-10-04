const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware
router.use(auth);

// Get patient profile
router.get('/profile', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    const patient = await User.findById(req.user.userId).select('-password');
    
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      patient
    });

  } catch (error) {
    console.error('Get patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient profile',
      error: error.message
    });
  }
});

// Update patient profile
router.put('/profile', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    const updates = req.body;
    const allowedUpdates = [
      'firstName', 'lastName', 'phone', 'profile', 'patientInfo'
    ];

    // Filter allowed updates
    const filteredUpdates = {};
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        filteredUpdates[key] = updates[key];
      }
    });

    const patient = await User.findByIdAndUpdate(
      req.user.userId,
      { ...filteredUpdates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      patient
    });

  } catch (error) {
    console.error('Update patient profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update patient profile',
      error: error.message
    });
  }
});

// Get patient's medical history
router.get('/medical-history', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    const patient = await User.findById(req.user.userId)
      .select('patientInfo.medicalHistory patientInfo.allergies patientInfo.currentMedications');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      medicalHistory: patient.patientInfo || {}
    });

  } catch (error) {
    console.error('Get medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get medical history',
      error: error.message
    });
  }
});

// Update medical history
router.put('/medical-history', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    const { medicalHistory, allergies, currentMedications, bloodGroup, height, weight } = req.body;

    const patient = await User.findByIdAndUpdate(
      req.user.userId,
      {
        $set: {
          'patientInfo.medicalHistory': medicalHistory,
          'patientInfo.allergies': allergies,
          'patientInfo.currentMedications': currentMedications,
          'patientInfo.bloodGroup': bloodGroup,
          'patientInfo.height': height,
          'patientInfo.weight': weight,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient not found'
      });
    }

    res.json({
      success: true,
      message: 'Medical history updated successfully',
      patientInfo: patient.patientInfo
    });

  } catch (error) {
    console.error('Update medical history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update medical history',
      error: error.message
    });
  }
});

// Get patient dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    // Return minimal dashboard data for now
    const dashboard = {
      appointmentStats: {
        total: 0,
        completed: 0,
        completionRate: 0,
        statusBreakdown: []
      },
      upcomingAppointments: [],
      recentPrescriptions: [],
      loyaltyMetrics: {
        totalSpent: 0,
        loyaltyScore: 0
      },
      memberSince: new Date()
    };

    res.json({
      success: true,
      dashboard
    });

  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get patient dashboard',
      error: error.message
    });
  }
});

// Search doctors
router.get('/search-doctors', async (req, res) => {
  try {
    const { 
      specialization, 
      minRating = 0, 
      maxFee, 
      availability,
      page = 1, 
      limit = 10 
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = { 
      role: 'doctor', 
      isActive: true 
    };

    if (specialization) {
      filter['doctorInfo.specialization'] = specialization;
    }

    if (minRating > 0) {
      filter['doctorInfo.rating.average'] = { $gte: parseFloat(minRating) };
    }

    if (maxFee) {
      filter['doctorInfo.consultationFee'] = { $lte: parseFloat(maxFee) };
    }

    const doctors = await User.find(filter)
      .select('firstName lastName doctorInfo profile')
      .sort({ 'doctorInfo.rating.average': -1, 'doctorInfo.experience': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    // Get unique specializations for filters
    const specializations = await User.distinct('doctorInfo.specialization', { role: 'doctor' });

    res.json({
      success: true,
      doctors,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      },
      filters: {
        availableSpecializations: specializations.filter(Boolean)
      }
    });

  } catch (error) {
    console.error('Search doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search doctors',
      error: error.message
    });
  }
});

// Get doctor details
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    }).select('-password');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    // Get doctor's recent reviews
    const Appointment = require('../models/Appointment');
    const reviews = await Appointment.find({
      doctor: doctorId,
      'rating.patientRating': { $exists: true }
    }).populate('patient', 'firstName lastName')
      .sort({ 'rating.patientRating.createdAt': -1 })
      .limit(10)
      .select('rating.patientRating patient appointmentDate');

    res.json({
      success: true,
      doctor,
      reviews
    });

  } catch (error) {
    console.error('Get doctor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor details',
      error: error.message
    });
  }
});

// Book appointment
router.post('/appointments/book', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can book appointments.'
      });
    }

    const { doctorId, date, time, symptoms, urgency, notes } = req.body;

    // Validate required fields
    if (!doctorId || !date || !time) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, date, and time are required'
      });
    }

    // Check if doctor exists
    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const Appointment = require('../models/Appointment');

    // Check if slot is available
    const existingAppointment = await Appointment.findOne({
      doctor: doctorId,
      appointmentDate: new Date(date),
      startTime: time,
      status: { $nin: ['cancelled', 'no_show'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked'
      });
    }

    // Create appointment with correct field mapping
    const appointmentData = {
      patient: req.user.userId,
      doctor: doctorId,
      appointmentDate: new Date(date),
      startTime: time,
      endTime: calculateEndTime(time, 30), // 30 minutes default
      reason: symptoms || 'General consultation', // Map symptoms to reason (required field)
      symptoms: symptoms ? [symptoms] : [], // Convert to array
      urgency: mapUrgencyLevel(urgency), // Map urgency to valid enum values
      fee: doctor.doctorInfo?.consultationFee || 500, // Required fee field
      status: 'scheduled'
    };

    // Add notes if provided (must be array of objects)
    if (notes) {
      appointmentData.notes = [{ 
        content: notes, 
        createdBy: req.user.userId,
        createdAt: new Date()
      }];
    }

    const appointment = new Appointment(appointmentData);

    await appointment.save();

    // Update customer journey
    await User.findByIdAndUpdate(req.user.userId, {
      $inc: { 'customerJourney.totalAppointments': 1 },
      $set: { 'customerJourney.lastActivity': new Date() }
    });

    // Populate appointment details
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('doctor', 'firstName lastName doctorInfo profile')
      .populate('patient', 'firstName lastName profile');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: populatedAppointment
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to book appointment',
      error: error.message
    });
  }
});

// Get patient appointments
router.get('/appointments', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    const filter = { patient: req.user.userId };
    if (status) {
      filter.status = status;
    }

    const Appointment = require('../models/Appointment');
    const appointments = await Appointment.find(filter)
      .populate('doctor', 'firstName lastName doctorInfo profile')
      .sort({ appointmentDate: -1, startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(filter);

    res.json({
      success: true,
      appointments,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
});

// Get doctor availability
router.get('/doctors/:doctorId/availability', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date is required'
      });
    }

    const doctor = await User.findOne({
      _id: doctorId,
      role: 'doctor',
      isActive: true
    });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const requestedDate = new Date(date);
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const dayName = dayNames[requestedDate.getDay()];

    // Get doctor's available slots for the day
    const daySlot = doctor.doctorInfo.availableSlots?.find(slot => slot.day === dayName);
    
    if (!daySlot) {
      return res.json({
        success: true,
        slots: []
      });
    }

    // Generate time slots
    const slots = generateTimeSlots(daySlot.startTime, daySlot.endTime, daySlot.duration || 30);

    // Get booked appointments for the date
    const Appointment = require('../models/Appointment');
    const bookedAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: requestedDate,
      status: { $nin: ['cancelled', 'no_show'] }
    }).select('startTime');

    const bookedTimes = new Set(bookedAppointments.map(apt => apt.startTime));

    // Filter available slots
    const availableSlots = slots.filter(slot => !bookedTimes.has(slot));

    res.json({
      success: true,
      slots: availableSlots,
      doctorSchedule: daySlot
    });

  } catch (error) {
    console.error('Get doctor availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor availability',
      error: error.message
    });
  }
});

// Get patient dashboard stats
router.get('/dashboard', async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only patients can access this route.'
      });
    }

    // Return minimal dashboard data for now
    const dashboard = {
      appointmentStats: {
        total: 0,
        completed: 0,
        completionRate: 0,
        statusBreakdown: []
      },
      upcomingAppointments: [],
      recentPrescriptions: [],
      loyaltyMetrics: {
        totalSpent: 0,
        loyaltyScore: 0
      },
      memberSince: new Date()
    };

    res.json({
      success: true,
      dashboard
    });

  } catch (error) {
    console.error('Get patient dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get dashboard data',
      error: error.message
    });
  }
});

// Helper functions
function calculateEndTime(startTime, durationMinutes) {
  const [hours, minutes] = startTime.split(':').map(Number);
  const endDate = new Date();
  endDate.setHours(hours, minutes + durationMinutes, 0, 0);
  return endDate.toTimeString().slice(0, 5);
}

function generateTimeSlots(startTime, endTime, duration) {
  const slots = [];
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMin = startMin;
  
  while (currentHour < endHour || (currentHour === endHour && currentMin < endMin)) {
    const timeString = `${currentHour.toString().padStart(2, '0')}:${currentMin.toString().padStart(2, '0')}`;
    slots.push(timeString);
    
    currentMin += duration;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }
  
  return slots;
}

function mapUrgencyLevel(urgency) {
  const urgencyMap = {
    'routine': 'low',
    'urgent': 'high',
    'emergency': 'emergency'
  };
  return urgencyMap[urgency] || 'medium';
}

module.exports = router;
