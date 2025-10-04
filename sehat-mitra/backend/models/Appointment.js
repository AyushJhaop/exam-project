const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  appointmentDate: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    default: 30 // minutes
  },
  type: {
    type: String,
    enum: ['video_consultation', 'phone_consultation', 'in_person'],
    default: 'video_consultation'
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  reason: {
    type: String,
    required: true
  },
  symptoms: [String],
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'emergency'],
    default: 'medium'
  },
  fee: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentId: String,
  prescription: {
    medications: [{
      name: String,
      dosage: String,
      frequency: String,
      duration: String,
      instructions: String
    }],
    tests: [String],
    followUpDate: Date,
    notes: String
  },
  meetingLink: String,
  recordings: [String],
  notes: [{
    content: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now }
  }],
  rating: {
    patientRating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: Date
    },
    doctorRating: {
      score: { type: Number, min: 1, max: 5 },
      review: String,
      createdAt: Date
    }
  },
  // Business metrics
  leadTime: Number, // days from booking to appointment
  waitTime: Number, // minutes waited for doctor
  sessionDuration: Number, // actual consultation duration in minutes
  followUpRequired: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient querying and matching algorithms
appointmentSchema.index({ doctor: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ urgency: 1, appointmentDate: 1 });
appointmentSchema.index({ 'doctor': 1, 'status': 1, 'appointmentDate': 1 });

// Compound index for appointment conflicts
appointmentSchema.index({ 
  doctor: 1, 
  appointmentDate: 1, 
  startTime: 1, 
  endTime: 1,
  status: 1 
});

appointmentSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Appointment', appointmentSchema);
