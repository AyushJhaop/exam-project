const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Connect to MongoDB
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const mockDoctors = [
  {
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'dr.rajesh@sehatmitra.com',
    phone: '+91-9876543210',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'male',
      address: {
        street: '123 Medical Plaza',
        city: 'Mumbai',
        state: 'Maharashtra',
        zipCode: '400001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Cardiology', 'Internal Medicine'],
      licenseNumber: 'MH-12345',
      qualification: ['MBBS', 'MD Cardiology', 'DM Interventional Cardiology'],
      experience: 15,
      consultationFee: 1500,
      verified: true,
      rating: { average: 4.8, count: 245 },
      availableSlots: [
        { day: 'monday', startTime: '09:00', endTime: '17:00', duration: 30 },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', duration: 30 },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', duration: 30 },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', duration: 30 },
        { day: 'friday', startTime: '09:00', endTime: '17:00', duration: 30 },
        { day: 'saturday', startTime: '09:00', endTime: '13:00', duration: 30 }
      ]
    }
  },
  {
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'dr.priya@sehatmitra.com',
    phone: '+91-9876543211',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'female',
      address: {
        street: '456 Health Center',
        city: 'Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Dermatology', 'Cosmetology'],
      licenseNumber: 'DL-67890',
      qualification: ['MBBS', 'MD Dermatology', 'Fellowship in Cosmetology'],
      experience: 12,
      consultationFee: 1200,
      verified: true,
      rating: { average: 4.7, count: 189 },
      availableSlots: [
        { day: 'monday', startTime: '10:00', endTime: '18:00', duration: 45 },
        { day: 'tuesday', startTime: '10:00', endTime: '18:00', duration: 45 },
        { day: 'wednesday', startTime: '10:00', endTime: '18:00', duration: 45 },
        { day: 'thursday', startTime: '10:00', endTime: '18:00', duration: 45 },
        { day: 'friday', startTime: '10:00', endTime: '18:00', duration: 45 }
      ]
    }
  },
  {
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'dr.amit@sehatmitra.com',
    phone: '+91-9876543212',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'male',
      address: {
        street: '789 Care Hospital',
        city: 'Pune',
        state: 'Maharashtra',
        zipCode: '411001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Orthopedics', 'Sports Medicine'],
      licenseNumber: 'MH-11111',
      qualification: ['MBBS', 'MS Orthopedics', 'Fellowship in Sports Medicine'],
      experience: 18,
      consultationFee: 1800,
      verified: true,
      rating: { average: 4.9, count: 312 },
      availableSlots: [
        { day: 'monday', startTime: '08:00', endTime: '16:00', duration: 30 },
        { day: 'tuesday', startTime: '08:00', endTime: '16:00', duration: 30 },
        { day: 'wednesday', startTime: '08:00', endTime: '16:00', duration: 30 },
        { day: 'thursday', startTime: '08:00', endTime: '16:00', duration: 30 },
        { day: 'friday', startTime: '08:00', endTime: '16:00', duration: 30 },
        { day: 'saturday', startTime: '08:00', endTime: '12:00', duration: 30 }
      ]
    }
  },
  {
    firstName: 'Neha',
    lastName: 'Gupta',
    email: 'dr.neha@sehatmitra.com',
    phone: '+91-9876543213',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'female',
      address: {
        street: '321 Women\'s Health Clinic',
        city: 'Bangalore',
        state: 'Karnataka',
        zipCode: '560001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Gynecology', 'Obstetrics'],
      licenseNumber: 'KA-22222',
      qualification: ['MBBS', 'MS Gynecology', 'DGO'],
      experience: 14,
      consultationFee: 1400,
      verified: true,
      rating: { average: 4.6, count: 278 },
      availableSlots: [
        { day: 'monday', startTime: '09:30', endTime: '17:30', duration: 45 },
        { day: 'tuesday', startTime: '09:30', endTime: '17:30', duration: 45 },
        { day: 'wednesday', startTime: '09:30', endTime: '17:30', duration: 45 },
        { day: 'thursday', startTime: '09:30', endTime: '17:30', duration: 45 },
        { day: 'friday', startTime: '09:30', endTime: '17:30', duration: 45 },
        { day: 'saturday', startTime: '09:30', endTime: '14:30', duration: 45 }
      ]
    }
  },
  {
    firstName: 'Suresh',
    lastName: 'Reddy',
    email: 'dr.suresh@sehatmitra.com',
    phone: '+91-9876543214',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'male',
      address: {
        street: '555 Pediatric Center',
        city: 'Hyderabad',
        state: 'Telangana',
        zipCode: '500001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Pediatrics', 'Child Psychology'],
      licenseNumber: 'TS-33333',
      qualification: ['MBBS', 'MD Pediatrics', 'Fellowship in Child Psychology'],
      experience: 16,
      consultationFee: 1300,
      verified: true,
      rating: { average: 4.8, count: 156 },
      availableSlots: [
        { day: 'monday', startTime: '10:00', endTime: '18:00', duration: 30 },
        { day: 'tuesday', startTime: '10:00', endTime: '18:00', duration: 30 },
        { day: 'wednesday', startTime: '10:00', endTime: '18:00', duration: 30 },
        { day: 'thursday', startTime: '10:00', endTime: '18:00', duration: 30 },
        { day: 'friday', startTime: '10:00', endTime: '18:00', duration: 30 },
        { day: 'saturday', startTime: '10:00', endTime: '15:00', duration: 30 }
      ]
    }
  },
  {
    firstName: 'Kavitha',
    lastName: 'Nair',
    email: 'dr.kavitha@sehatmitra.com',
    phone: '+91-9876543215',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'female',
      address: {
        street: '777 Eye Care Center',
        city: 'Chennai',
        state: 'Tamil Nadu',
        zipCode: '600001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Ophthalmology', 'Retina Surgery'],
      licenseNumber: 'TN-44444',
      qualification: ['MBBS', 'MS Ophthalmology', 'Fellowship in Vitreoretinal Surgery'],
      experience: 20,
      consultationFee: 2000,
      verified: true,
      rating: { average: 4.9, count: 445 },
      availableSlots: [
        { day: 'monday', startTime: '08:30', endTime: '16:30', duration: 45 },
        { day: 'tuesday', startTime: '08:30', endTime: '16:30', duration: 45 },
        { day: 'wednesday', startTime: '08:30', endTime: '16:30', duration: 45 },
        { day: 'thursday', startTime: '08:30', endTime: '16:30', duration: 45 },
        { day: 'friday', startTime: '08:30', endTime: '16:30', duration: 45 }
      ]
    }
  },
  {
    firstName: 'Vikram',
    lastName: 'Singh',
    email: 'dr.vikram@sehatmitra.com',
    phone: '+91-9876543216',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'male',
      address: {
        street: '888 Neuro Hospital',
        city: 'Jaipur',
        state: 'Rajasthan',
        zipCode: '302001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Neurology', 'Stroke Medicine'],
      licenseNumber: 'RJ-55555',
      qualification: ['MBBS', 'MD Medicine', 'DM Neurology'],
      experience: 22,
      consultationFee: 2200,
      verified: true,
      rating: { average: 4.7, count: 298 },
      availableSlots: [
        { day: 'monday', startTime: '09:00', endTime: '17:00', duration: 60 },
        { day: 'tuesday', startTime: '09:00', endTime: '17:00', duration: 60 },
        { day: 'wednesday', startTime: '09:00', endTime: '17:00', duration: 60 },
        { day: 'thursday', startTime: '09:00', endTime: '17:00', duration: 60 },
        { day: 'friday', startTime: '09:00', endTime: '17:00', duration: 60 }
      ]
    }
  },
  {
    firstName: 'Ananya',
    lastName: 'Menon',
    email: 'dr.ananya@sehatmitra.com',
    phone: '+91-9876543217',
    password: 'doctor123',
    role: 'doctor',
    profile: {
      gender: 'female',
      address: {
        street: '999 Mental Health Center',
        city: 'Kochi',
        state: 'Kerala',
        zipCode: '682001',
        country: 'India'
      }
    },
    doctorInfo: {
      specialization: ['Psychiatry', 'Addiction Medicine'],
      licenseNumber: 'KL-66666',
      qualification: ['MBBS', 'MD Psychiatry', 'Fellowship in Addiction Medicine'],
      experience: 10,
      consultationFee: 1600,
      verified: true,
      rating: { average: 4.8, count: 134 },
      availableSlots: [
        { day: 'monday', startTime: '11:00', endTime: '19:00', duration: 60 },
        { day: 'tuesday', startTime: '11:00', endTime: '19:00', duration: 60 },
        { day: 'wednesday', startTime: '11:00', endTime: '19:00', duration: 60 },
        { day: 'thursday', startTime: '11:00', endTime: '19:00', duration: 60 },
        { day: 'friday', startTime: '11:00', endTime: '19:00', duration: 60 },
        { day: 'saturday', startTime: '11:00', endTime: '16:00', duration: 60 }
      ]
    }
  }
];

async function seedDoctors() {
  try {
    // Clear existing doctors (optional)
    await User.deleteMany({ role: 'doctor' });
    console.log('Cleared existing doctors');

    // Hash passwords and create doctors
    const doctors = await Promise.all(
      mockDoctors.map(async (doctor) => {
        const hashedPassword = await bcrypt.hash(doctor.password, 10);
        return {
          ...doctor,
          password: hashedPassword,
          customerJourney: {
            acquisitionDate: new Date(),
            acquisitionSource: 'system_seed',
            lastActivity: new Date()
          }
        };
      })
    );

    // Insert doctors
    const createdDoctors = await User.insertMany(doctors);
    console.log(`Created ${createdDoctors.length} doctors successfully!`);

    // Display created doctors
    createdDoctors.forEach(doctor => {
      console.log(`- Dr. ${doctor.firstName} ${doctor.lastName} (${doctor.doctorInfo.specialization.join(', ')})`);
    });

  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    mongoose.connection.close();
  }
}

// Run the seeding
seedDoctors();
