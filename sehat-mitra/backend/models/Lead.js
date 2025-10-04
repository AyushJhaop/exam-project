const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
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
  phone: {
    type: String,
    required: true
  },
  leadType: {
    type: String,
    enum: ['patient', 'doctor'],
    required: true
  },
  specialization: {
    type: String,
    required: function() { return this.leadType === 'doctor'; }
  },
  medicalCondition: {
    type: String,
    required: function() { return this.leadType === 'patient'; }
  },
  source: {
    type: String,
    enum: ['website', 'referral', 'social_media', 'advertisement'],
    default: 'website'
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  stage: {
    type: String,
    enum: ['prospect', 'qualified', 'converted', 'lost'],
    default: 'prospect'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: [{
    content: String,
    createdAt: { type: Date, default: Date.now },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  }],
  interactions: [{
    type: { type: String, enum: ['call', 'email', 'meeting'] },
    date: Date,
    outcome: String,
    nextFollowUp: Date
  }],
  converted: {
    type: Boolean,
    default: false
  },
  conversionDate: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient querying
leadSchema.index({ email: 1 });
leadSchema.index({ stage: 1, priority: -1 });
leadSchema.index({ leadType: 1, specialization: 1 });
leadSchema.index({ createdAt: -1 });

leadSchema.pre('save', function() {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model('Lead', leadSchema);
