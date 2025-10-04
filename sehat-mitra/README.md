# 🏥 Sehat Mitra - Telemedicine Appointment Scheduler

A comprehensive telemedicine platform that demonstrates customer acquisition to loyalty through sales funnel & operations dashboard, built with MongoDB, React, and advanced data structures & algorithms.

## 🎯 Project Overview

**Sehat Mitra** is a full-stack telemedicine appointment scheduler that showcases:
- **Customer Acquisition to Loyalty**: Complete patient journey from lead capture to loyal customers
- **Advanced DSA Implementation**: Priority queues, balanced BSTs, hash tables, and sliding window algorithms
- **Business Intelligence**: RFM analysis, CLV calculation, NPS scoring, and real-time analytics
- **MongoDB Integration**: Advanced aggregation pipelines and NoSQL database design

## 🚀 Features Implemented

### 1. Customer Acquisition to Loyalty (Business + DSA)
- ✅ **Lead Capture System**: Smart forms with duplicate detection using hash tables
- ✅ **Priority Queue Engine**: Automatic lead qualification and prioritization
- ✅ **Sales Funnel**: Prospect → Qualified → Customer → Loyal customer journey
- ✅ **Intelligent Matching**: BST-based doctor recommendation system

### 2. Sales Funnel & CRM (Business + DSA)
- ✅ **Multi-stage Pipeline**: Lead management with automated progression
- ✅ **Duplicate Detection**: Hash-based customer deduplication system
- ✅ **Customer Segmentation**: RFM analysis for targeted marketing
- ✅ **Conversion Tracking**: Real-time funnel metrics and analytics

### 3. Business Metrics Dashboard (Business + NoSQL)
- ✅ **Real-time Analytics**: Live appointment and revenue tracking
- ✅ **MongoDB Aggregation**: Complex pipelines for business intelligence
- ✅ **RFM Segmentation**: Customer value analysis and scoring
- ✅ **CLV Calculation**: Customer lifetime value prediction
- ✅ **NPS Analysis**: Net Promoter Score tracking and trends

### 4. Operations Module (Business + DSA)
- ✅ **Appointment Management**: Intelligent scheduling with conflict detection
- ✅ **Resource Optimization**: Doctor availability and workload analysis
- ✅ **Pattern Recognition**: Sliding window analysis for peak hours
- ✅ **Performance Metrics**: Utilization rates and efficiency tracking

### 5. Advanced Algorithms & Data Structures
- ✅ **Priority Queue**: Lead qualification and appointment scheduling
- ✅ **Balanced BST**: Doctor search and recommendation system
- ✅ **Hash Tables**: Duplicate detection and fast lookups
- ✅ **Sliding Window**: Recent activity metrics and trend analysis
- ✅ **Graph Algorithms**: (Ready for referral network analysis)

## 🛠 Technology Stack

### Backend
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based secure authentication
- **APIs**: RESTful APIs with comprehensive error handling

### Frontend
- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS for modern UI
- **State Management**: Context API with useReducer
- **Icons**: Heroicons for consistent iconography
- **Notifications**: React Hot Toast for user feedback

### Data Structures & Algorithms
- **Priority Queue**: Min/Max heap for lead prioritization
- **AVL Tree**: Self-balancing BST for doctor searches
- **Hash Table**: O(1) duplicate detection and caching
- **Sliding Window**: Time-series analysis and metrics
- **Two Pointers**: Pattern recognition in appointments

## 📁 Project Structure

```
sehat-mitra/
├── backend/
│   ├── server.js              # Express server setup
│   ├── models/                # MongoDB schemas
│   │   ├── User.js           # Patient/Doctor/Admin model
│   │   ├── Appointment.js    # Appointment scheduling model
│   │   └── Lead.js           # Lead management model
│   ├── routes/               # API route handlers
│   │   ├── auth.js           # Authentication endpoints
│   │   ├── appointments.js   # Appointment management
│   │   ├── dashboard.js      # Analytics and metrics
│   │   ├── leads.js          # Lead management
│   │   ├── patients.js       # Patient-specific routes
│   │   └── doctors.js        # Doctor-specific routes
│   ├── algorithms/           # DSA implementations
│   │   ├── priorityQueue.js  # Lead qualification engine
│   │   ├── appointmentMatcher.js # BST-based matching
│   │   ├── duplicateDetection.js # Hash-based deduplication
│   │   └── slidingWindow.js  # Time-series analysis
│   ├── middleware/           # Custom middleware
│   │   └── auth.js           # JWT authentication
│   └── .env                  # Environment configuration
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── layout/           # Navigation and layout
│   │   └── auth/             # Authentication components
│   ├── pages/                # Main application pages
│   │   ├── auth/             # Login/Register pages
│   │   ├── patient/          # Patient dashboard and features
│   │   ├── doctor/           # Doctor dashboard and features
│   │   └── admin/            # Admin analytics and management
│   ├── contexts/             # React Context providers
│   │   └── AuthContext.jsx   # Authentication state management
│   ├── services/             # API service functions
│   │   └── api.js            # Axios configuration and interceptors
│   └── utils/                # Utility functions and helpers
├── package.json              # Dependencies and scripts
└── README.md                # This file
```

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Git** for version control

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd sehat-mitra
   ```

2. **Install Dependencies**
   ```bash
   # Install all dependencies (frontend + backend)
   npm run install:all
   
   # Or install separately
   npm install                    # Frontend dependencies
   cd backend && npm install      # Backend dependencies
   ```

3. **Environment Setup**
   
   **Backend (.env in /backend)**
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/sehat-mitra
   JWT_SECRET=sehat-mitra-jwt-secret-key-2024
   NODE_ENV=development
   ```
   
   **Frontend (.env in root)**
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Sehat Mitra
   VITE_APP_VERSION=1.0.0
   ```

4. **Database Setup**
   ```bash
   # Ensure MongoDB is running
   mongod
   
   # The application will create collections automatically
   ```

5. **Start the Application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm start
   
   # Or run separately
   npm run server:dev    # Backend on http://localhost:5000
   npm run dev          # Frontend on http://localhost:5173
   ```

6. **Access the Application**
   - **Frontend**: http://localhost:5173
   - **Backend API**: http://localhost:5000/api
   - **Health Check**: http://localhost:5000/api/health

## 👥 User Roles & Access

### Patient Features
- **Registration & Profile Management**
- **Doctor Search & Filtering**
- **Intelligent Appointment Booking**
- **Medical History Tracking**
- **Prescription Management**
- **Rating & Review System**

### Doctor Features
- **Professional Profile Setup**
- **Availability Management**
- **Patient Appointment Tracking**
- **Digital Prescription System**
- **Analytics Dashboard**
- **Revenue Tracking**

### Admin Features
- **Business Intelligence Dashboard**
- **Lead Management System**
- **RFM Customer Segmentation**
- **CLV Analysis & Prediction**
- **NPS Tracking & Trends**
- **Operations Analytics**

## 📊 Business Metrics & Analytics

### Customer Journey Analytics
- **Lead Qualification Score**: Priority-based lead ranking
- **Conversion Funnel**: Stage-wise progression tracking
- **Customer Acquisition Cost (CAC)**: Marketing efficiency metrics
- **Customer Lifetime Value (CLV)**: Revenue prediction per customer

### RFM Segmentation
- **Recency**: Days since last appointment
- **Frequency**: Total number of appointments
- **Monetary**: Total amount spent on consultations
- **Segments**: Champions, Loyal Customers, At Risk, etc.

### Net Promoter Score (NPS)
- **Real-time NPS Calculation**: Based on patient ratings
- **Trend Analysis**: Monthly NPS tracking
- **Promoter/Detractor Classification**: Automatic categorization

### Operational Metrics
- **Doctor Utilization Rates**: Efficiency and capacity metrics
- **Peak Hours Analysis**: Time-based demand patterns
- **Appointment Completion Rates**: Success metrics
- **Revenue Per Doctor**: Performance indicators

## 🧮 Algorithm Implementations

### 1. Priority Queue (Lead Qualification)
```javascript
// Automatically prioritizes leads based on multiple factors
const priority = calculatePriority({
  leadType: 'patient',           // Base priority
  source: 'referral',           // Source weight
  urgency: 'high',              // Medical urgency
  specialization: 'cardiology'   // Demand-based priority
});
```

### 2. Balanced BST (Doctor Matching)
```javascript
// Efficient doctor search and recommendation
const matches = appointmentMatcher.findBestMatches({
  specialization: 'cardiology',
  preferredTime: '2024-10-05T14:00',
  urgency: 'medium',
  maxFee: 1000
});
```

### 3. Hash Table (Duplicate Detection)
```javascript
// O(1) duplicate customer detection
const duplicateCheck = duplicateDetector.checkDuplicate({
  email: 'patient@example.com',
  phone: '+1234567890',
  firstName: 'John',
  lastName: 'Doe'
});
```

### 4. Sliding Window (Analytics)
```javascript
// Real-time metrics with configurable time windows
const metrics = slidingWindow.getAppointmentMetrics(); // Last 7 days
const revenue = slidingWindow.getRevenueMetrics();     // Revenue trends
```

## 🚀 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/verify` - Token verification

### Appointments
- `POST /api/appointments/book` - Book appointment with AI matching
- `GET /api/appointments/my-appointments` - User's appointments
- `POST /api/appointments/recommend-doctors` - Get doctor recommendations

### Dashboard & Analytics
- `GET /api/dashboard/overview` - General metrics overview
- `GET /api/dashboard/rfm-analysis` - RFM customer segmentation
- `GET /api/dashboard/clv-analysis` - Customer lifetime value
- `GET /api/dashboard/nps-analysis` - Net Promoter Score metrics

### Lead Management
- `POST /api/leads` - Create new lead
- `GET /api/leads/next-qualified` - Get next priority lead
- `GET /api/leads/analytics` - Lead conversion analytics

## 🏆 Competitive Advantages

### Technical Excellence
- **Scalable Architecture**: Microservices-ready design
- **Optimized Performance**: O(log n) search, O(1) lookups
- **Real-time Analytics**: Live dashboard updates
- **Data-Driven Decisions**: ML-ready architecture

### Business Intelligence
- **Predictive Analytics**: CLV and churn prediction
- **Customer Segmentation**: Automated RFM analysis
- **Operational Efficiency**: Resource optimization
- **Revenue Optimization**: Dynamic pricing insights

### User Experience
- **Intelligent Matching**: AI-powered doctor recommendations
- **Seamless Booking**: Conflict-free appointment scheduling
- **Mobile-First Design**: Responsive across all devices
- **Accessibility**: WCAG 2.1 compliant interface

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] **AI-Powered Diagnosis**: Symptom analysis and recommendations
- [ ] **Blockchain Integration**: Secure medical record management
- [ ] **IoT Device Integration**: Wearable health monitoring
- [ ] **Multi-language Support**: Localization for global reach

### Advanced Analytics
- [ ] **Machine Learning Models**: Predictive health analytics
- [ ] **Graph Neural Networks**: Complex relationship analysis
- [ ] **Time Series Forecasting**: Demand prediction
- [ ] **Recommendation Engine**: Personalized health suggestions

## 🤝 Contributing

1. **Fork the Repository**
2. **Create Feature Branch**: `git checkout -b feature/amazing-feature`
3. **Commit Changes**: `git commit -m 'Add amazing feature'`
4. **Push to Branch**: `git push origin feature/amazing-feature`
5. **Open Pull Request**

## 📄 License

This project is licensed under the MIT License. See `LICENSE` file for details.

## 👨‍💻 Author

**Ayush Jha**
- Project: Comprehensive Telemedicine Platform
- Focus: DSA II, NoSQL Databases, Business Analytics
- Semester: 3, Sprint: 1

---

**Built with ❤️ for better healthcare accessibility**
