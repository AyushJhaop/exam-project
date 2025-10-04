const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - will be added after they are created
try {
  const authRoutes = require('./routes/auth');
  app.use('/api/auth', authRoutes);
} catch (error) {
  console.log('Auth routes not loaded:', error.message);
}

try {
  const leadRoutes = require('./routes/leads');
  app.use('/api/leads', leadRoutes);
} catch (error) {
  console.log('Lead routes not loaded:', error.message);
}

try {
  const appointmentRoutes = require('./routes/appointments');
  app.use('/api/appointments', appointmentRoutes);
} catch (error) {
  console.log('Appointment routes not loaded:', error.message);
}

try {
  const patientRoutes = require('./routes/patients');
  app.use('/api/patients', patientRoutes);
} catch (error) {
  console.log('Patient routes not loaded:', error.message);
}

try {
  const doctorRoutes = require('./routes/doctors');
  app.use('/api/doctors', doctorRoutes);
} catch (error) {
  console.log('Doctor routes not loaded:', error.message);
}

try {
  const dashboardRoutes = require('./routes/dashboard');
  app.use('/api/dashboard', dashboardRoutes);
} catch (error) {
  console.log('Dashboard routes not loaded:', error.message);
}

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/sehat-mitra', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
