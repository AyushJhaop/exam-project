const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profile: {
    avatar: String,
    dateOfBirth: Date,
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: { type: String, default: 'India' }
    },
    emergencyContact: {
      name: String,
      phone: String,
      relation: String
    }
  },
  // Patient-specific fields
  patientInfo: {
    medicalHistory: [String],
    allergies: [String],
    currentMedications: [String],
    bloodGroup: String,
    height: Number,
    weight: Number,
    insuranceInfo: {
      provider: String,
      policyNumber: String
    }
  },
  // Doctor-specific fields
  doctorInfo: {
    specialization: [String],
    licenseNumber: String,
    qualification: [String],
    experience: Number,
    consultationFee: Number,
    availableSlots: [{
      day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
      startTime: String,
      endTime: String,
      duration: { type: Number, default: 30 } // minutes
    }],
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 }
    },
    verified: {
      type: Boolean,
      default: false
    },
    // Doctor's daily schedule
    schedule: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  // Customer journey tracking
  customerJourney: {
    acquisitionDate: { type: Date, default: Date.now },
    acquisitionSource: String,
    firstAppointment: Date,
    lastActivity: Date,
    totalAppointments: { type: Number, default: 0 },
    totalSpent: { type: Number, default: 0 },
    loyaltyScore: { type: Number, default: 0 },
    npsScore: Number,
    rfmSegment: String, // Recency, Frequency, Monetary
    clv: Number // Customer Lifetime Value
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

// Indexes for efficient querying
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'doctorInfo.specialization': 1 });
userSchema.index({ 'doctorInfo.rating.average': -1 });
userSchema.index({ 'customerJourney.loyaltyScore': -1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Update timestamp
userSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

// Compare password method
userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
