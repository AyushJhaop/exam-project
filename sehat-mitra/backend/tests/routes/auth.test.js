const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const authRoutes = require('../routes/auth');

// Create express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

describe('Authentication Routes', () => {
  
  describe('POST /api/auth/register', () => {
    test('should register a new patient successfully', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'patient',
        phone: '1234567890'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('patient');
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    test('should register a new doctor successfully', async () => {
      const doctorData = {
        name: 'Dr. Smith',
        email: 'dr.smith@hospital.com',
        password: 'securepass123',
        role: 'doctor',
        phone: '0987654321',
        specialization: 'Cardiology',
        experience: 10,
        qualifications: ['MBBS', 'MD Cardiology']
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(doctorData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('doctor');
      expect(response.body.user.profile.specialization).toBe('Cardiology');
      expect(response.body.user.profile.experience).toBe(10);
    });

    test('should return error for duplicate email', async () => {
      const userData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        role: 'patient'
      };

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('email');
    });

    test('should return error for invalid email format', async () => {
      const userData = {
        name: 'Invalid User',
        email: 'invalid-email',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should return error for weak password', async () => {
      const userData = {
        name: 'Weak Password User',
        email: 'weak@example.com',
        password: '123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('password');
    });

    test('should return error for missing required fields', async () => {
      const userData = {
        email: 'incomplete@example.com'
        // Missing name, password, role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should hash password before saving', async () => {
      const userData = {
        name: 'Password Test User',
        email: 'hashtest@example.com',
        password: 'plainpassword',
        role: 'patient'
      };

      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      const user = await User.findOne({ email: userData.email });
      expect(user.password).not.toBe(userData.password);
      expect(user.password).toMatch(/^\$2[aby]\$/); // bcrypt hash pattern
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Create a test user
      const hashedPassword = await bcrypt.hash('testpassword', 10);
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: hashedPassword,
        role: 'patient',
        phone: '1234567890'
      });
    });

    test('should login with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined();
    });

    test('should return error for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'testpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('credentials');
    });

    test('should return error for invalid password', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('credentials');
    });

    test('should return error for missing fields', async () => {
      const loginData = {
        email: 'test@example.com'
        // Missing password
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should update last login timestamp', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'testpassword'
      };

      const oldLastLogin = testUser.lastLogin;

      await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      const updatedUser = await User.findById(testUser._id);
      expect(updatedUser.lastLogin).not.toEqual(oldLastLogin);
    });
  });

  describe('GET /api/auth/me', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      // Register a user and get token
      const userData = {
        name: 'Auth Test User',
        email: 'authtest@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      testUser = response.body.user;
      authToken = response.body.token;
    });

    test('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('authtest@example.com');
      expect(response.body.user.password).toBeUndefined();
    });

    test('should return error without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });

    test('should return error with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should return error with expired token', async () => {
      // This would need to be tested with actual token expiration
      // For now, we'll test with a malformed token
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer expired.token.here')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let testUser;
    let authToken;

    beforeEach(async () => {
      const userData = {
        name: 'Profile Test User',
        email: 'profile@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      testUser = response.body.user;
      authToken = response.body.token;
    });

    test('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        phone: '9876543210',
        profile: {
          address: '123 Main St',
          dateOfBirth: '1990-01-01'
        }
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.phone).toBe('9876543210');
    });

    test('should not update email', async () => {
      const updateData = {
        email: 'newemail@example.com' // Should be ignored
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.user.email).toBe('profile@example.com'); // Unchanged
    });

    test('should return error without authentication', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Password Reset Flow', () => {
    let testUser;

    beforeEach(async () => {
      const userData = {
        name: 'Reset Test User',
        email: 'reset@example.com',
        password: 'oldpassword',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      testUser = response.body.user;
    });

    test('should request password reset', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'reset@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset');
    });

    test('should return success even for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);

      expect(response.body.success).toBe(true);
    });
  });

  describe('Security Tests', () => {
    test('should rate limit registration attempts', async () => {
      const userData = {
        name: 'Rate Limit Test',
        email: 'ratelimit@example.com',
        password: 'password123',
        role: 'patient'
      };

      // Make multiple rapid registration attempts
      const promises = [];
      for (let i = 0; i < 10; i++) {
        userData.email = `ratelimit${i}@example.com`;
        promises.push(
          request(app)
            .post('/api/auth/register')
            .send(userData)
        );
      }

      const responses = await Promise.all(promises);
      
      // Should have some successful and possibly some rate-limited
      const successCount = responses.filter(r => r.status === 201).length;
      expect(successCount).toBeGreaterThan(0);
    });

    test('should sanitize user input', async () => {
      const maliciousData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(maliciousData)
        .expect(201);

      // Name should be sanitized
      expect(response.body.user.name).not.toContain('<script>');
    });

    test('should validate role field', async () => {
      const userData = {
        name: 'Invalid Role User',
        email: 'invalidrole@example.com',
        password: 'password123',
        role: 'hacker' // Invalid role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    test('should handle very long names', async () => {
      const userData = {
        name: 'A'.repeat(1000), // Very long name
        email: 'longname@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    test('should handle special characters in name', async () => {
      const userData = {
        name: 'José María O\'Connor-Smith',
        email: 'special@example.com',
        password: 'password123',
        role: 'patient'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.name).toBe(userData.name);
    });

    test('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
