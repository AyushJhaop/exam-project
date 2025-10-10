const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createSimpleTestUsers() {
  try {
    console.log('🧪 Creating simple test users...');

    // Delete existing test users
    await User.deleteMany({ 
      email: { $in: ['patient@example.com', 'doctor@example.com', 'admin@example.com'] } 
    });

    // Create test users (password will be hashed by pre-save hook)
    const testUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        email: 'patient@example.com',
        password: 'password123',  // This will be hashed by the pre-save hook
        phone: '+1-555-0123',
        role: 'patient',
        patientInfo: {
          medicalHistory: ['Diabetes Type 2', 'Hypertension'],
          allergies: ['Peanuts', 'Shellfish']
        }
      },
      {
        firstName: 'Dr. Sarah',
        lastName: 'Smith',
        email: 'doctor@example.com',
        password: 'password123',  // This will be hashed by the pre-save hook
        phone: '+1-555-0125',
        role: 'doctor',
        doctorInfo: {
          specialization: ['Cardiology'],
          experience: 10,
          consultationFee: 500,
          licenseNumber: 'MD12345',
          rating: {
            average: 4.8,
            count: 150
          }
        }
      },
      {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@example.com',
        password: 'password123',  // This will be hashed by the pre-save hook
        phone: '+1-555-0126',
        role: 'admin'
      }
    ];

    const createdUsers = await User.create(testUsers);
    console.log('✅ Test users created successfully!');

    // Create sample appointments for the patient
    const patient = createdUsers.find(u => u.role === 'patient');
    const doctor = createdUsers.find(u => u.role === 'doctor');

    if (patient && doctor) {
      await Appointment.deleteMany({ patient: patient._id });

      const appointments = [
        {
          patient: patient._id,
          doctor: doctor._id,
          appointmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          startTime: '10:00',
          endTime: '10:30',
          type: 'video_consultation',
          status: 'completed',
          reason: 'Diabetes follow-up',
          symptoms: ['High blood sugar'],
          fee: 500,
          paymentStatus: 'paid'
        },
        {
          patient: patient._id,
          doctor: doctor._id,
          appointmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          startTime: '14:00',
          endTime: '14:30',
          type: 'phone_consultation',
          status: 'completed',
          reason: 'Blood pressure check',
          symptoms: ['High blood pressure'],
          fee: 400,
          paymentStatus: 'paid'
        },
        {
          patient: patient._id,
          doctor: doctor._id,
          appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          startTime: '11:00',
          endTime: '11:30',
          type: 'video_consultation',
          status: 'completed',
          reason: 'Regular check-up',
          symptoms: ['General wellness'],
          fee: 500,
          paymentStatus: 'paid'
        }
      ];

      await Appointment.create(appointments);
      console.log('✅ Sample appointments created!');
    }

    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    console.log('\n👤 PATIENT LOGIN:');
    console.log('   Email: patient@example.com');
    console.log('   Password: password123');
    console.log('   💰 Total Spent: ₹1,400');
    
    console.log('\n👩‍⚕️ DOCTOR LOGIN:');
    console.log('   Email: doctor@example.com');
    console.log('   Password: password123');
    
    console.log('\n👔 ADMIN LOGIN:');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');

    console.log('\n🌐 LOGIN URL: http://localhost:5173/login');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.disconnect();
    console.log('📪 Database connection closed');
  }
}

createSimpleTestUsers();
