# Sehat Mitra - Comprehensive Project Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Architecture & Design Patterns](#architecture--design-patterns)
4. [Data Structures & Algorithms (DSA)](#data-structures--algorithms-dsa)
5. [MongoDB Database Design](#mongodb-database-design)
6. [Frontend Implementation](#frontend-implementation)
7. [API Documentation](#api-documentation)
8. [Key Features Implementation](#key-features-implementation)
9. [Project Structure Analysis](#project-structure-analysis)
10. [Viva Exam Preparation](#viva-exam-preparation)

---

## Project Overview

**Sehat Mitra** is a comprehensive healthcare management system that connects patients with doctors through an intelligent appointment booking platform. The system includes advanced features like lead management, appointment scheduling with consultation types, and business analytics.

### Core Functionalities
- **Multi-role Authentication** (Patient, Doctor, Admin)
- **Intelligent Doctor Matching** using algorithms
- **Appointment Management** with consultation types
- **Lead Management System** with priority queues
- **Real-time Dashboard Analytics**
- **Patient Journey Tracking**

---

## Technology Stack

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing

### Frontend Technologies
- **React.js** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **React Hot Toast** - Notifications
- **Heroicons** - Icon library

### Development Tools
- **ESLint** - Code linting
- **Babel** - JavaScript compiler
- **PostCSS** - CSS processing
- **Jest** - Testing framework

---

## Architecture & Design Patterns

### 1. **MVC Architecture**
```
Model (MongoDB Schemas) → Controller (Route Handlers) → View (React Components)
```

### 2. **Component-Based Architecture**
```
App.jsx
├── Layout Components (Navbar)
├── Page Components (Dashboard, Booking)
├── Feature Components (LeadCapture, Modals)
└── Utility Components (ProtectedRoute)
```

### 3. **API-First Design**
- RESTful API endpoints
- Centralized API service layer
- Consistent error handling
- Authentication middleware

### 4. **Context Pattern**
- AuthContext for global authentication state
- Centralized user management

---

## Data Structures & Algorithms (DSA)

### 1. **Binary Search Tree (BST) - Doctor Matching**
**File:** `backend/algorithms/appointmentMatcher.js`

```javascript
class DoctorBST {
  insert(doctor) {
    // Insert doctor based on rating for efficient searching
  }
  
  findByRating(minRating) {
    // Find all doctors above minimum rating threshold
  }
}
```

**Use Case:** Efficiently search and filter doctors by rating and specialization.

### 2. **Priority Queue - Lead Management**
**File:** `backend/algorithms/priorityQueue.js`

```javascript
class PriorityQueue {
  enqueue(lead, priority) {
    // Add lead with calculated priority score
  }
  
  dequeue() {
    // Remove highest priority lead for follow-up
  }
}
```

**Use Case:** Prioritize leads based on conversion probability and engagement score.

### 3. **Sliding Window - Time Slot Management**
**File:** `backend/algorithms/slidingWindow.js`

```javascript
class SlidingWindow {
  findOptimalSlots(doctorSchedule, duration) {
    // Find available time slots using sliding window technique
  }
}
```

**Use Case:** Efficiently find available appointment slots in doctor's schedule.

### 4. **Duplicate Detection - Conflict Prevention**
**File:** `backend/algorithms/duplicateDetection.js`

```javascript
class DuplicateDetection {
  detectAppointmentConflicts(newAppointment, existingAppointments) {
    // Use hashing to detect scheduling conflicts
  }
}
```

**Use Case:** Prevent double-booking of appointments.

### 5. **Matching Algorithm - Doctor-Patient Pairing**
```javascript
calculateMatchScore(doctor, request) {
  // Weighted scoring algorithm:
  // - Specialization match (30%)
  // - Rating (25%)
  // - Experience (15%)
  // - Availability (15%)
  // - Fee (10%)
  // - Location (5%)
}
```

**Time Complexity Analysis:**
- Doctor Search: O(log n) with BST
- Lead Prioritization: O(log n) with Priority Queue
- Slot Finding: O(n) with Sliding Window
- Conflict Detection: O(1) with Hashing

---

## MongoDB Database Design

### 1. **User Schema**
```javascript
const userSchema = {
  // Common fields
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String, // bcrypt hashed
  role: { type: String, enum: ['patient', 'doctor', 'admin'] },
  
  // Role-specific embedded documents
  patientInfo: {
    medicalHistory: [String],
    allergies: [String],
    emergencyContact: Object
  },
  
  doctorInfo: {
    specialization: [String],
    experience: Number,
    consultationFee: Number,
    licenseNumber: String,
    rating: { average: Number, count: Number }
  }
}
```

### 2. **Appointment Schema**
```javascript
const appointmentSchema = {
  patient: { type: ObjectId, ref: 'User' },
  doctor: { type: ObjectId, ref: 'User' },
  appointmentDate: Date,
  startTime: String,
  endTime: String,
  type: {
    type: String,
    enum: ['video_consultation', 'phone_consultation', 'in_person']
  },
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'completed', 'cancelled', 'no_show']
  },
  fee: Number,
  prescription: {
    medications: [Object],
    tests: [String],
    notes: String
  }
}
```

### 3. **Lead Schema**
```javascript
const leadSchema = {
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  leadType: { type: String, enum: ['patient', 'doctor'] },
  source: String,
  status: { type: String, enum: ['new', 'contacted', 'qualified', 'converted'] },
  priority: Number, // Calculated using algorithm
  assignedTo: { type: ObjectId, ref: 'User' },
  converted: { type: Boolean, default: false }
}
```

### 4. **Database Indexes**
```javascript
// Performance optimization indexes
appointmentSchema.index({ doctor: 1, appointmentDate: 1, startTime: 1 });
appointmentSchema.index({ patient: 1, appointmentDate: -1 });
userSchema.index({ email: 1, role: 1 });
leadSchema.index({ priority: -1, status: 1 });
```

### 5. **Aggregation Pipelines**
```javascript
// Dashboard analytics
const revenueAnalytics = await Appointment.aggregate([
  { $match: { status: 'completed', paymentStatus: 'paid' } },
  { $group: { 
      _id: null, 
      totalRevenue: { $sum: '$fee' },
      avgAppointmentValue: { $avg: '$fee' }
    }
  }
]);
```

---

## Frontend Implementation

### 1. **React Architecture**

#### Component Hierarchy
```
App.jsx
├── AuthContext.Provider
├── Router
│   ├── Public Routes (Landing, Login, Register)
│   └── Protected Routes
│       ├── Patient Routes
│       │   ├── PatientDashboard
│       │   ├── AppointmentBooking
│       │   └── AppointmentHistory
│       ├── Doctor Routes
│       │   ├── DoctorDashboard
│       │   └── DoctorSchedule
│       └── Admin Routes
│           ├── AdminDashboard
│           └── LeadManagement
```

### 2. **State Management**

#### Context API Implementation
```javascript
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Authentication methods
  const login = async (credentials) => {
    // JWT token handling
  };
  
  const logout = () => {
    // Clear authentication state
  };
};
```

#### Component State Patterns
```javascript
// Appointment Booking - Multi-step form state
const [step, setStep] = useState(1); // 1: Search, 2: Select, 3: Time, 4: Confirm
const [selectedDoctor, setSelectedDoctor] = useState(null);
const [appointmentDetails, setAppointmentDetails] = useState({
  symptoms: '',
  urgency: 'routine',
  consultationType: 'video_consultation'
});
```

### 3. **API Integration**

#### Service Layer Pattern
```javascript
// apiServices.js
export const patientService = {
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },
  
  bookAppointment: async (appointmentData) => {
    const response = await api.post('/patients/appointments/book', appointmentData);
    return response.data;
  }
};
```

#### Error Handling
```javascript
try {
  const response = await patientService.bookAppointment(appointmentData);
  toast.success('Appointment booked successfully!');
  navigate('/my-appointments');
} catch (error) {
  console.error('Error booking appointment:', error);
  toast.error(error.response?.data?.message || 'Failed to book appointment');
}
```

### 4. **UI/UX Implementation**

#### Tailwind CSS Styling
```javascript
// Consultation Type Selection with Visual Feedback
<div className={`flex items-center space-x-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
  appointmentDetails.consultationType === 'video_consultation' 
    ? 'border-indigo-500 bg-indigo-50' 
    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
}`}>
```

#### Responsive Design
```javascript
// Grid layouts with responsive breakpoints
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

---

## API Documentation

### 1. **Authentication Endpoints**

#### POST /auth/login
```json
Request:
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "firstName": "John",
    "lastName": "Doe",
    "role": "patient"
  }
}
```

### 2. **Patient Endpoints**

#### GET /patients/dashboard
```json
Response:
{
  "success": true,
  "data": {
    "totalAppointments": 15,
    "upcomingAppointments": 3,
    "totalSpent": 1250,
    "statusBreakdown": {
      "completed": 10,
      "scheduled": 3,
      "cancelled": 2
    }
  }
}
```

#### POST /patients/appointments/book
```json
Request:
{
  "doctorId": "doctor_id",
  "date": "2025-10-05",
  "time": "10:00",
  "symptoms": "Chest pain",
  "urgency": "routine",
  "consultationType": "video_consultation"
}

Response:
{
  "success": true,
  "message": "Appointment booked successfully",
  "appointment": {
    "id": "appointment_id",
    "doctor": { "name": "Dr. Smith" },
    "date": "2025-10-05",
    "time": "10:00",
    "fee": 500
  }
}
```

### 3. **Doctor Endpoints**

#### GET /doctors/dashboard
```json
Response:
{
  "success": true,
  "data": {
    "totalPatients": 150,
    "todayAppointments": 8,
    "monthlyRevenue": 75000,
    "upcomingAppointments": [
      {
        "id": "apt_id",
        "patient": { "name": "John Doe" },
        "time": "10:00",
        "type": "video_consultation"
      }
    ]
  }
}
```

### 4. **Lead Management Endpoints**

#### GET /leads
```json
Response:
{
  "success": true,
  "leads": [
    {
      "id": "lead_id",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "priority": 85,
      "status": "qualified",
      "source": "website"
    }
  ]
}
```

---

## Key Features Implementation

### 1. **Consultation Type Feature**

#### Frontend Implementation
```javascript
// Dynamic pricing based on consultation type
const consultationTypes = [
  {
    id: 'video_consultation',
    name: 'Video Consultation',
    icon: VideoCameraIcon,
    badge: '🌟 Most Popular',
    priceMultiplier: 1.0
  },
  {
    id: 'phone_consultation',
    name: 'Phone Consultation',
    icon: PhoneIcon,
    badge: '💰 20% Discount',
    priceMultiplier: 0.8
  },
  {
    id: 'in_person',
    name: 'In-Person Visit',
    icon: BuildingOffice2Icon,
    badge: '🏥 Traditional',
    priceMultiplier: 1.0
  }
];
```

#### Backend Fee Calculation
```javascript
// Dynamic fee calculation in patients.js
const baseFee = doctor.doctorInfo?.consultationFee || 500;
const consultationFee = consultationType === 'phone_consultation' ? 
  Math.round(baseFee * 0.8) : baseFee;
```

### 2. **Lead Scoring Algorithm**

```javascript
const calculateLeadScore = (lead) => {
  let score = 0;
  
  // Source scoring
  const sourceScores = {
    'website': 20,
    'social_media': 15,
    'referral': 30,
    'advertisement': 10
  };
  
  // Engagement scoring
  if (lead.phone) score += 25;
  if (lead.medicalCondition) score += 20;
  if (lead.specialization) score += 15;
  
  // Urgency factor
  const hoursSinceCreation = (Date.now() - lead.createdAt) / (1000 * 60 * 60);
  if (hoursSinceCreation < 1) score += 20; // Hot lead
  
  return Math.min(score, 100); // Cap at 100
};
```

### 3. **Real-time Dashboard Analytics**

```javascript
// Aggregation pipeline for business metrics
const businessMetrics = await Appointment.aggregate([
  {
    $facet: {
      totalRevenue: [
        { $match: { status: 'completed', paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$fee' } } }
      ],
      appointmentTrends: [
        {
          $group: {
            _id: { 
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]
    }
  }
]);
```

---

## Project Structure Analysis

### Backend Structure
```
backend/
├── server.js                 # Entry point, Express app setup
├── middleware/
│   └── auth.js               # JWT authentication middleware
├── models/
│   ├── User.js               # User schema (patients, doctors, admins)
│   ├── Appointment.js        # Appointment schema with consultation types
│   └── Lead.js               # Lead management schema
├── routes/
│   ├── auth.js               # Authentication routes
│   ├── patients.js           # Patient-specific endpoints
│   ├── doctors.js            # Doctor-specific endpoints
│   ├── appointments.js       # Appointment management
│   ├── leads.js              # Lead management routes
│   └── dashboard.js          # Analytics and dashboard data
├── algorithms/
│   ├── appointmentMatcher.js # Doctor matching algorithm
│   ├── priorityQueue.js      # Lead prioritization
│   ├── slidingWindow.js      # Time slot management
│   └── duplicateDetection.js # Conflict prevention
└── scripts/
    ├── seedDoctors.js        # Database seeding
    └── createTestPatient.js  # Test data creation
```

### Frontend Structure
```
src/
├── main.jsx                  # React entry point
├── App.jsx                   # Main app component with routing
├── contexts/
│   └── AuthContext.jsx       # Global authentication state
├── services/
│   ├── api.js                # Axios configuration
│   └── apiServices.js        # API service functions
├── components/
│   ├── layout/
│   │   └── Navbar.jsx        # Navigation component
│   └── auth/
│       └── ProtectedRoute.jsx # Route protection
├── pages/
│   ├── auth/
│   │   ├── LoginPage.jsx     # User authentication
│   │   └── RegisterPage.jsx  # User registration
│   ├── patient/
│   │   ├── PatientDashboard.jsx    # Patient overview
│   │   ├── AppointmentBooking.jsx  # Multi-step booking flow
│   │   └── AppointmentHistory.jsx  # Appointment management
│   ├── doctor/
│   │   ├── DoctorDashboard.jsx     # Doctor overview
│   │   └── DoctorSchedule.jsx      # Schedule management
│   └── admin/
│       ├── AdminDashboard.jsx      # Admin overview
│       └── LeadManagement.jsx      # Lead management interface
└── utils/                    # Utility functions
```

---

## Viva Exam Preparation

This comprehensive documentation covers all the technical aspects of your Sehat Mitra project. Continue reading the next sections for detailed viva exam questions and answers...
