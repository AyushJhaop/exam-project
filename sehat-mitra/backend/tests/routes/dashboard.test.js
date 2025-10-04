const request = require('supertest');
const express = require('express');
const User = require('../models/User');
const Appointment = require('../models/Appointment');
const dashboardRoutes = require('../routes/dashboard');
const { auth } = require('../middleware/auth');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/dashboard', auth, dashboardRoutes);

describe('Dashboard Analytics Routes', () => {
  let adminUser, adminToken;
  let patientUser, patientToken;
  let doctorUser, doctorToken;

  beforeEach(async () => {
    // Create test users
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@test.com',
      password: 'hashedpassword',
      role: 'admin'
    });

    patientUser = await User.create({
      name: 'Patient User',
      email: 'patient@test.com',
      password: 'hashedpassword',
      role: 'patient'
    });

    doctorUser = await User.create({
      name: 'Doctor User',
      email: 'doctor@test.com',
      password: 'hashedpassword',
      role: 'doctor',
      profile: {
        specialization: 'Cardiology',
        experience: 10
      }
    });

    // Mock tokens (in real tests, generate actual JWT tokens)
    adminToken = 'mock-admin-token';
    patientToken = 'mock-patient-token';
    doctorToken = 'mock-doctor-token';
  });

  describe('GET /api/dashboard/stats', () => {
    beforeEach(async () => {
      // Create test appointments
      await Appointment.create([
        {
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          date: new Date(),
          time: '10:00 AM',
          status: 'confirmed',
          type: 'consultation'
        },
        {
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
          time: '2:00 PM',
          status: 'completed',
          type: 'followup'
        }
      ]);
    });

    test('should return dashboard stats for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.totalUsers).toBeGreaterThanOrEqual(3);
      expect(response.body.stats.totalAppointments).toBeGreaterThanOrEqual(2);
      expect(response.body.stats.totalDoctors).toBeGreaterThanOrEqual(1);
      expect(response.body.stats.totalPatients).toBeGreaterThanOrEqual(1);
    });

    test('should return doctor-specific stats for doctor role', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.myAppointments).toBeDefined();
      expect(response.body.stats.myPatients).toBeDefined();
    });

    test('should return patient-specific stats for patient role', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.myAppointments).toBeDefined();
      expect(response.body.stats.upcomingAppointments).toBeDefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/rfm-analysis', () => {
    beforeEach(async () => {
      // Create customer journey data
      await User.findByIdAndUpdate(patientUser._id, {
        customerJourney: {
          acquisitionDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          totalAppointments: 5,
          totalSpent: 500,
          lastActivity: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          loyaltyScore: 85
        }
      });
    });

    test('should return RFM analysis for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/rfm-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.rfmAnalysis).toBeDefined();
      expect(response.body.rfmAnalysis.segments).toBeDefined();
      expect(Array.isArray(response.body.rfmAnalysis.segments)).toBe(true);
    });

    test('should restrict access to admin only', async () => {
      const response = await request(app)
        .get('/api/dashboard/rfm-analysis')
        .set('Authorization', `Bearer ${patientToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('admin');
    });

    test('should calculate RFM scores correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/rfm-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const segments = response.body.rfmAnalysis.segments;
      
      // Each segment should have valid RFM scores
      segments.forEach(segment => {
        expect(segment.recencyScore).toBeGreaterThanOrEqual(1);
        expect(segment.recencyScore).toBeLessThanOrEqual(5);
        expect(segment.frequencyScore).toBeGreaterThanOrEqual(1);
        expect(segment.frequencyScore).toBeLessThanOrEqual(5);
        expect(segment.monetaryScore).toBeGreaterThanOrEqual(1);
        expect(segment.monetaryScore).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('GET /api/dashboard/clv-analysis', () => {
    beforeEach(async () => {
      // Create users with CLV data
      await User.findByIdAndUpdate(patientUser._id, {
        customerJourney: {
          totalSpent: 1000,
          totalAppointments: 10,
          acquisitionDate: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
          clv: 2500
        }
      });
    });

    test('should return CLV analysis for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/clv-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.clvAnalysis).toBeDefined();
      expect(response.body.clvAnalysis.averageCLV).toBeGreaterThanOrEqual(0);
      expect(response.body.clvAnalysis.clvDistribution).toBeDefined();
    });

    test('should calculate CLV metrics correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/clv-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const analysis = response.body.clvAnalysis;
      
      expect(analysis.totalCustomers).toBeGreaterThanOrEqual(1);
      expect(analysis.averageCLV).toBeGreaterThan(0);
      expect(analysis.highValueCustomers).toBeDefined();
    });

    test('should restrict access to admin only', async () => {
      const response = await request(app)
        .get('/api/dashboard/clv-analysis')
        .set('Authorization', `Bearer ${doctorToken}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/dashboard/nps-analysis', () => {
    beforeEach(async () => {
      // Create users with NPS data
      await User.findByIdAndUpdate(patientUser._id, {
        customerJourney: {
          npsScore: 9 // Promoter
        }
      });

      // Create another patient with different NPS
      const anotherPatient = await User.create({
        name: 'Another Patient',
        email: 'another@test.com',
        password: 'hashedpassword',
        role: 'patient',
        customerJourney: {
          npsScore: 6 // Passive
        }
      });
    });

    test('should return NPS analysis for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/nps-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.npsAnalysis).toBeDefined();
      expect(response.body.npsAnalysis.overallNPS).toBeDefined();
      expect(response.body.npsAnalysis.distribution).toBeDefined();
    });

    test('should calculate NPS correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/nps-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const analysis = response.body.npsAnalysis;
      
      expect(analysis.overallNPS).toBeGreaterThanOrEqual(-100);
      expect(analysis.overallNPS).toBeLessThanOrEqual(100);
      expect(analysis.totalResponses).toBeGreaterThanOrEqual(2);
    });

    test('should categorize scores correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/nps-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const distribution = response.body.npsAnalysis.distribution;
      
      expect(distribution.promoters).toBeGreaterThanOrEqual(0);
      expect(distribution.passives).toBeGreaterThanOrEqual(0);
      expect(distribution.detractors).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/dashboard/cohort-analysis', () => {
    test('should return cohort analysis for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/cohort-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.cohortAnalysis).toBeDefined();
      expect(Array.isArray(response.body.cohortAnalysis.cohorts)).toBe(true);
    });

    test('should calculate retention rates', async () => {
      const response = await request(app)
        .get('/api/dashboard/cohort-analysis')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const cohorts = response.body.cohortAnalysis.cohorts;
      
      cohorts.forEach(cohort => {
        expect(cohort.acquisitionMonth).toBeDefined();
        expect(cohort.customerCount).toBeGreaterThanOrEqual(0);
        expect(Array.isArray(cohort.retentionRates)).toBe(true);
      });
    });
  });

  describe('GET /api/dashboard/revenue-trends', () => {
    beforeEach(async () => {
      // Create appointments with revenue data
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      await Appointment.create([
        {
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          date: today,
          time: '10:00 AM',
          status: 'completed',
          fee: 150
        },
        {
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          date: yesterday,
          time: '2:00 PM', 
          status: 'completed',
          fee: 200
        }
      ]);
    });

    test('should return revenue trends for admin', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-trends')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.revenueTrends).toBeDefined();
      expect(response.body.revenueTrends.totalRevenue).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.body.revenueTrends.dailyRevenue)).toBe(true);
    });

    test('should calculate trends correctly', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-trends')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const trends = response.body.revenueTrends;
      
      expect(trends.totalRevenue).toBe(350); // 150 + 200
      expect(trends.averageDailyRevenue).toBeGreaterThan(0);
    });

    test('should include date range in response', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-trends?startDate=2024-01-01&endDate=2024-12-31')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.revenueTrends.dateRange).toBeDefined();
    });
  });

  describe('Performance and Edge Cases', () => {
    test('should handle large datasets efficiently', async () => {
      // Create many appointments
      const appointments = [];
      for (let i = 0; i < 100; i++) {
        appointments.push({
          patientId: patientUser._id,
          doctorId: doctorUser._id,
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
          time: '10:00 AM',
          status: 'completed',
          fee: 100 + i
        });
      }
      await Appointment.insertMany(appointments);

      const startTime = Date.now();
      
      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(response.body.success).toBe(true);
      expect(duration).toBeLessThan(5000); // Should complete in less than 5 seconds
    });

    test('should handle empty database gracefully', async () => {
      // Clear all data
      await User.deleteMany({});
      await Appointment.deleteMany({});

      // Recreate admin user for authentication
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@test.com',
        password: 'hashedpassword',
        role: 'admin'
      });

      const response = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.stats.totalUsers).toBe(1); // Only admin
      expect(response.body.stats.totalAppointments).toBe(0);
    });

    test('should handle invalid date ranges', async () => {
      const response = await request(app)
        .get('/api/dashboard/revenue-trends?startDate=invalid-date&endDate=also-invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('date');
    });

    test('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/dashboard/stats?limit=invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Real-time Updates', () => {
    test('should reflect recent changes in stats', async () => {
      // Get initial stats
      const initialResponse = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const initialCount = initialResponse.body.stats.totalAppointments;

      // Add new appointment
      await Appointment.create({
        patientId: patientUser._id,
        doctorId: doctorUser._id,
        date: new Date(),
        time: '3:00 PM',
        status: 'confirmed'
      });

      // Get updated stats
      const updatedResponse = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(updatedResponse.body.stats.totalAppointments).toBe(initialCount + 1);
    });
  });
});
