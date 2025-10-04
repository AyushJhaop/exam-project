const express = require('express');
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const { AppointmentMatcher } = require('../algorithms/appointmentMatcher');
const auth = require('../middleware/auth');

const router = express.Router();
const appointmentMatcher = new AppointmentMatcher();

// Apply authentication middleware to all routes
router.use(auth);

// Book appointment with intelligent matching
router.post('/book', async (req, res) => {
  try {
    const {
      specialization,
      appointmentDate,
      startTime,
      reason,
      symptoms,
      urgency,
      preferredDoctorId
    } = req.body;

    const patientId = req.user.userId;

    // Get available doctors
    const availableDoctors = await User.find({
      role: 'doctor',
      isActive: true,
      'doctorInfo.specialization': specialization
    });

    let selectedDoctor;

    if (preferredDoctorId) {
      selectedDoctor = availableDoctors.find(doc => doc._id.toString() === preferredDoctorId);
    } else {
      // Use intelligent matching
      const appointmentRequest = {
        specialization,
        preferredTime: new Date(`${appointmentDate}T${startTime}`),
        urgency,
        symptoms
      };

      const matches = appointmentMatcher.findBestMatches(appointmentRequest, availableDoctors);
      selectedDoctor = matches[0]?.doctor;
    }

    if (!selectedDoctor) {
      return res.status(404).json({
        success: false,
        message: 'No available doctors found for the specified criteria'
      });
    }

    // Check for conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctor: selectedDoctor._id,
      appointmentDate: new Date(appointmentDate),
      $or: [
        {
          $and: [
            { startTime: { $lte: startTime } },
            { endTime: { $gt: startTime } }
          ]
        }
      ],
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'Time slot not available'
      });
    }

    // Calculate end time (default 30 minutes)
    const duration = selectedDoctor.doctorInfo?.availableSlots?.[0]?.duration || 30;
    const [hours, minutes] = startTime.split(':').map(Number);
    const endTimeMinutes = hours * 60 + minutes + duration;
    const endHours = Math.floor(endTimeMinutes / 60);
    const endMins = endTimeMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;

    // Create appointment
    const appointment = new Appointment({
      patient: patientId,
      doctor: selectedDoctor._id,
      appointmentDate: new Date(appointmentDate),
      startTime,
      endTime,
      duration,
      reason,
      symptoms: symptoms || [],
      urgency: urgency || 'medium',
      fee: selectedDoctor.doctorInfo.consultationFee || 500,
      meetingLink: `https://meet.sehatmitra.com/room/${Date.now()}`
    });

    await appointment.save();

    // Update patient's appointment count
    await User.findByIdAndUpdate(patientId, {
      $inc: { 'customerJourney.totalAppointments': 1 },
      $set: { 'customerJourney.lastActivity': new Date() }
    });

    // Populate appointment data
    await appointment.populate([
      { path: 'patient', select: 'firstName lastName email phone' },
      { path: 'doctor', select: 'firstName lastName email doctorInfo.specialization' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment
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

// Get available time slots for a doctor
router.get('/available-slots/:doctorId', async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query;

    const doctor = await User.findById(doctorId);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    const slots = appointmentMatcher.findOptimalSlots(doctorId, date);

    // Get existing appointments for the date
    const existingAppointments = await Appointment.find({
      doctor: doctorId,
      appointmentDate: new Date(date),
      status: { $nin: ['cancelled'] }
    });

    // Mark slots as unavailable if booked
    const availableSlots = slots.map(slot => {
      const isBooked = existingAppointments.some(apt => 
        apt.startTime === slot.startTime
      );
      return {
        ...slot,
        available: !isBooked
      };
    }).filter(slot => slot.available);

    res.json({
      success: true,
      doctorId,
      date,
      availableSlots
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get available slots',
      error: error.message
    });
  }
});

// Get user's appointments
router.get('/my-appointments', async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (req.user.role === 'patient') {
      filter.patient = userId;
    } else if (req.user.role === 'doctor') {
      filter.doctor = userId;
    }

    if (status) {
      filter.status = status;
    }

    const skip = (page - 1) * limit;

    const appointments = await Appointment.find(filter)
      .sort({ appointmentDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('patient', 'firstName lastName email phone')
      .populate('doctor', 'firstName lastName email doctorInfo.specialization');

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
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get appointments',
      error: error.message
    });
  }
});

// Update appointment status
router.patch('/:appointmentId/status', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { status, notes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check authorization
    const userId = req.user.userId;
    const isPatient = appointment.patient.toString() === userId;
    const isDoctor = appointment.doctor.toString() === userId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this appointment'
      });
    }

    // Update status
    appointment.status = status;

    // Add note if provided
    if (notes) {
      appointment.notes.push({
        content: notes,
        createdBy: userId,
        createdAt: new Date()
      });
    }

    // Update customer journey metrics
    if (status === 'completed') {
      await User.findByIdAndUpdate(appointment.patient, {
        $inc: { 
          'customerJourney.totalSpent': appointment.fee,
          'customerJourney.loyaltyScore': 1
        }
      });
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment status updated successfully',
      appointment
    });

  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update appointment status',
      error: error.message
    });
  }
});

// Add prescription to appointment
router.post('/:appointmentId/prescription', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { medications, tests, followUpDate, notes } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user is the doctor for this appointment
    if (appointment.doctor.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the assigned doctor can add prescription'
      });
    }

    // Add prescription
    appointment.prescription = {
      medications: medications || [],
      tests: tests || [],
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      notes: notes || ''
    };

    if (followUpDate) {
      appointment.followUpRequired = true;
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Prescription added successfully',
      appointment
    });

  } catch (error) {
    console.error('Add prescription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add prescription',
      error: error.message
    });
  }
});

// Rate appointment
router.post('/:appointmentId/rate', async (req, res) => {
  try {
    const { appointmentId } = req.params;
    const { rating, review } = req.body;

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    const userId = req.user.userId;
    const isPatient = appointment.patient.toString() === userId;
    const isDoctor = appointment.doctor.toString() === userId;

    if (!isPatient && !isDoctor) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to rate this appointment'
      });
    }

    // Add rating
    if (isPatient) {
      appointment.rating.patientRating = {
        score: rating,
        review: review || '',
        createdAt: new Date()
      };

      // Update doctor's overall rating
      const doctor = await User.findById(appointment.doctor);
      const currentRating = doctor.doctorInfo.rating.average;
      const currentCount = doctor.doctorInfo.rating.count;
      
      const newAverage = ((currentRating * currentCount) + rating) / (currentCount + 1);
      
      await User.findByIdAndUpdate(appointment.doctor, {
        'doctorInfo.rating.average': newAverage,
        'doctorInfo.rating.count': currentCount + 1
      });
    } else {
      appointment.rating.doctorRating = {
        score: rating,
        review: review || '',
        createdAt: new Date()
      };
    }

    await appointment.save();

    res.json({
      success: true,
      message: 'Rating added successfully',
      appointment
    });

  } catch (error) {
    console.error('Rate appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to rate appointment',
      error: error.message
    });
  }
});

// Get doctor recommendations
router.post('/recommend-doctors', async (req, res) => {
  try {
    const appointmentRequest = req.body;
    
    // Get available doctors based on specialization
    const availableDoctors = await User.find({
      role: 'doctor',
      isActive: true,
      'doctorInfo.specialization': appointmentRequest.specialization
    });

    if (availableDoctors.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No doctors found for the specified specialization'
      });
    }

    // Get recommendations using matching algorithm
    const recommendations = appointmentMatcher.findBestMatches(appointmentRequest, availableDoctors);

    res.json({
      success: true,
      recommendations: recommendations.map(rec => ({
        doctor: {
          id: rec.doctor._id,
          firstName: rec.doctor.firstName,
          lastName: rec.doctor.lastName,
          specialization: rec.doctor.doctorInfo.specialization,
          experience: rec.doctor.doctorInfo.experience,
          rating: rec.doctor.doctorInfo.rating,
          consultationFee: rec.doctor.doctorInfo.consultationFee
        },
        matchScore: rec.score
      }))
    });

  } catch (error) {
    console.error('Get doctor recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get doctor recommendations',
      error: error.message
    });
  }
});

module.exports = router;
