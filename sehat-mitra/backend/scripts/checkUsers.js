const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function checkUsers() {
  try {
    const users = await User.find({ 
      email: { $in: ['patient@example.com', 'doctor@example.com', 'admin@example.com'] } 
    }).select('firstName lastName email role');
    
    console.log('Found users:', users.length);
    users.forEach(user => {
      console.log(`- ${user.email} (${user.role}): ${user.firstName} ${user.lastName}`);
    });

    // Test password for patient
    const patient = await User.findOne({ email: 'patient@example.com' });
    if (patient) {
      const isValidPassword = await bcrypt.compare('password123', patient.password);
      console.log(`Password valid for patient: ${isValidPassword}`);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkUsers();
