const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const testPatient = {
  firstName: 'John',
  lastName: 'Doe',
  email: 'patient@test.com',
  phone: '+91-9876543218',
  password: 'patient123',
  role: 'patient',
  profile: {
    gender: 'male',
    dateOfBirth: new Date('1990-01-01'),
    address: {
      street: '123 Test Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    }
  },
  patientInfo: {
    bloodGroup: 'O+',
    height: 175,
    weight: 70,
    allergies: ['Penicillin'],
    medicalHistory: ['Hypertension']
  }
};

async function createTestPatient() {
  try {
    // Check if patient already exists
    const existingPatient = await User.findOne({ email: testPatient.email });
    if (existingPatient) {
      console.log('Test patient already exists');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(testPatient.password, 10);
    
    const patient = new User({
      ...testPatient,
      password: hashedPassword,
      customerJourney: {
        acquisitionDate: new Date(),
        acquisitionSource: 'test_seed',
        lastActivity: new Date()
      }
    });

    await patient.save();
    console.log('Test patient created successfully!');
    console.log(`Email: ${testPatient.email}`);
    console.log(`Password: ${testPatient.password}`);

  } catch (error) {
    console.error('Error creating test patient:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
createTestPatient();
