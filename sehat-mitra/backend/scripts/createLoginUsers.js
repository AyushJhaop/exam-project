const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function createTestUsers() {
  try {
    console.log('🧪 Creating test users with spending data...');

    // Hash password for all users
    const hashedPassword = await bcrypt.hash('password123', 12);

    // 1. Create Test Patient with spending history
    const testPatient = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'patient@example.com',
      password: hashedPassword,
      phone: '+1-555-0123',
      role: 'patient',
      patientInfo: {
        medicalHistory: ['Diabetes Type 2', 'Hypertension'],
        allergies: ['Peanuts', 'Shellfish'],
        emergencyContact: {
          name: 'Jane Doe',
          relationship: 'Spouse',
          phone: '+1-555-0124'
        }
      }
    };

    // 2. Create Test Doctor
    const testDoctor = {
      firstName: 'Dr. Sarah',
      lastName: 'Smith',
      email: 'doctor@example.com',
      password: hashedPassword,
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
        },
        availability: {
          monday: { start: '09:00', end: '17:00' },
          tuesday: { start: '09:00', end: '17:00' },
          wednesday: { start: '09:00', end: '17:00' },
          thursday: { start: '09:00', end: '17:00' },
          friday: { start: '09:00', end: '17:00' }
        }
      }
    };

    // 3. Create Test Admin
    const testAdmin = {
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@example.com',
      password: hashedPassword,
      phone: '+1-555-0126',
      role: 'admin'
    };

    // Delete existing test users
    await User.deleteMany({ 
      email: { $in: ['patient@example.com', 'doctor@example.com', 'admin@example.com'] } 
    });

    // Create users
    const createdPatient = await User.create(testPatient);
    const createdDoctor = await User.create(testDoctor);
    const createdAdmin = await User.create(testAdmin);

    console.log('✅ Test users created successfully!');

    // Create sample appointments for spending data
    const sampleAppointments = [
      {
        patient: createdPatient._id,
        doctor: createdDoctor._id,
        appointmentDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        startTime: '10:00',
        endTime: '10:30',
        type: 'video_consultation',
        status: 'completed',
        reason: 'Diabetes follow-up and blood sugar management',
        symptoms: ['High blood sugar', 'Fatigue'],
        urgency: 'medium',
        fee: 500,
        paymentStatus: 'paid',
        prescription: {
          medications: [
            { name: 'Metformin', dosage: '500mg', frequency: 'Twice daily' }
          ],
          notes: 'Continue current diabetes management plan'
        }
      },
      {
        patient: createdPatient._id,
        doctor: createdDoctor._id,
        appointmentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
        startTime: '14:00',
        endTime: '14:30',
        type: 'phone_consultation',
        status: 'completed',
        reason: 'Blood pressure monitoring and medication adjustment',
        symptoms: ['High blood pressure', 'Headache'],
        urgency: 'high',
        fee: 400,
        paymentStatus: 'paid',
        prescription: {
          medications: [
            { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily' }
          ],
          notes: 'Blood pressure management'
        }
      },
      {
        patient: createdPatient._id,
        doctor: createdDoctor._id,
        appointmentDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        startTime: '11:00',
        endTime: '11:30',
        type: 'video_consultation',
        status: 'completed',
        reason: 'Regular check-up and medication review',
        symptoms: ['General wellness check'],
        urgency: 'low',
        fee: 500,
        paymentStatus: 'paid',
        prescription: {
          medications: [
            { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily' }
          ],
          notes: 'Follow-up consultation. Patient improving.'
        }
      },
      {
        patient: createdPatient._id,
        doctor: createdDoctor._id,
        appointmentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        startTime: '15:00',
        endTime: '15:30',
        type: 'video_consultation',
        status: 'scheduled',
        reason: 'Monthly diabetes and hypertension check-up',
        symptoms: ['Regular monitoring'],
        urgency: 'medium',
        fee: 500,
        paymentStatus: 'pending'
      }
    ];

    // Delete existing appointments for test patient
    await Appointment.deleteMany({ patient: createdPatient._id });

    // Create sample appointments
    await Appointment.insertMany(sampleAppointments);

    console.log('✅ Sample appointments created with spending data!');

    // Display login credentials
    console.log('\n🔐 LOGIN CREDENTIALS:');
    console.log('='.repeat(50));
    
    console.log('\n👤 PATIENT LOGIN (View Spending Data):');
    console.log('   Email: patient@example.com');
    console.log('   Password: password123');
    console.log('   Total Spent: ₹1,400 (3 completed appointments)');
    
    console.log('\n👩‍⚕️ DOCTOR LOGIN (View Earnings):');
    console.log('   Email: doctor@example.com');
    console.log('   Password: password123');
    console.log('   Total Earned: ₹1,400');
    
    console.log('\n👔 ADMIN LOGIN (View Analytics):');
    console.log('   Email: admin@example.com');
    console.log('   Password: password123');
    console.log('   Access: Full system analytics');

    console.log('\n🌐 APPLICATION URLs:');
    console.log('   Frontend: http://localhost:5173');
    console.log('   Backend:  http://localhost:5000');

    console.log('\n✨ Ready to login and view dashboard analytics!');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    mongoose.disconnect();
    console.log('📪 Database connection closed');
  }
}

// Run the script
createTestUsers();
