# API Documentation - Sehat Mitra

## Base URL
```
Development: http://localhost:5000/api
Production: https://api.sehatmitra.com/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

Error responses:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-10-04T12:00:00Z"
}
```

---

## Authentication Endpoints

### Register User
**POST** `/auth/register`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "patient", // "patient" | "doctor" | "admin"
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male" // "male" | "female" | "other"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "jwt_token"
  },
  "message": "User registered successfully"
}
```

### Login
**POST** `/auth/login`

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient"
    },
    "token": "jwt_token"
  },
  "message": "Login successful"
}
```

### Verify Token
**GET** `/auth/verify`
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": "patient"
    }
  },
  "message": "Token valid"
}
```

---

## Appointment Endpoints

### Search Doctors
**GET** `/appointments/search-doctors`

**Query Parameters:**
- `specialty` (string): Doctor specialty
- `location` (string): Location filter
- `experience` (string): Experience range
- `rating` (string): Minimum rating
- `availability` (string): Availability filter

**Response:**
```json
{
  "success": true,
  "data": {
    "doctors": [
      {
        "id": "doctor_id",
        "name": "Dr. Smith",
        "specialty": "cardiology",
        "experience": 10,
        "rating": 4.8,
        "consultationFee": 500,
        "location": "Mumbai",
        "profileImage": "image_url",
        "qualification": "MBBS, MD"
      }
    ],
    "total": 25,
    "matchingScore": 95
  }
}
```

### Get Available Slots
**GET** `/appointments/available-slots`
*Requires Authentication*

**Query Parameters:**
- `doctorId` (string, required): Doctor ID
- `date` (string, required): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "slots": ["09:00", "10:00", "11:00", "14:00", "15:00"],
    "date": "2025-10-05"
  }
}
```

### Book Appointment
**POST** `/appointments/book`
*Requires Authentication (Patient only)*

**Body:**
```json
{
  "doctorId": "doctor_id",
  "date": "2025-10-05",
  "time": "10:00",
  "symptoms": "Chest pain and shortness of breath",
  "urgency": "urgent", // "routine" | "urgent" | "emergency"
  "notes": "Additional notes"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "appointment": {
      "id": "appointment_id",
      "doctorId": "doctor_id",
      "patientId": "patient_id",
      "date": "2025-10-05",
      "time": "10:00",
      "status": "scheduled",
      "symptoms": "Chest pain and shortness of breath",
      "fee": 500
    }
  },
  "message": "Appointment booked successfully"
}
```

### Get My Appointments
**GET** `/appointments/my-appointments`
*Requires Authentication (Patient only)*

**Query Parameters:**
- `status` (string): Filter by status
- `limit` (number): Limit results
- `page` (number): Page number

**Response:**
```json
{
  "success": true,
  "data": {
    "appointments": [
      {
        "id": "appointment_id",
        "doctor": {
          "id": "doctor_id",
          "name": "Dr. Smith",
          "specialty": "cardiology",
          "profileImage": "image_url"
        },
        "date": "2025-10-05",
        "time": "10:00",
        "status": "scheduled",
        "symptoms": "Chest pain",
        "fee": 500,
        "createdAt": "2025-10-04T12:00:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "totalPages": 2
  }
}
```

### Update Appointment Status
**PATCH** `/appointments/{appointmentId}/status`
*Requires Authentication*

**Body:**
```json
{
  "status": "confirmed" // "scheduled" | "confirmed" | "completed" | "cancelled"
}
```

### Cancel Appointment
**PATCH** `/appointments/{appointmentId}/cancel`
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "Appointment cancelled successfully"
}
```

### Rate Appointment
**POST** `/appointments/{appointmentId}/rating`
*Requires Authentication (Patient only)*

**Body:**
```json
{
  "rating": 5,
  "review": "Excellent consultation, very helpful doctor"
}
```

---

## Lead Management Endpoints

### Create Lead
**POST** `/leads`

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "source": "website",
  "message": "Interested in cardiology consultation",
  "urgency": "routine"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "lead": {
      "id": "lead_id",
      "name": "John Doe",
      "email": "john@example.com",
      "priority": "warm",
      "score": 75,
      "status": "new",
      "createdAt": "2025-10-04T12:00:00Z"
    }
  },
  "message": "Lead created successfully"
}
```

### Get Leads
**GET** `/leads`
*Requires Authentication (Admin only)*

**Query Parameters:**
- `priority` (string): Filter by priority
- `status` (string): Filter by status
- `sortBy` (string): Sort field
- `sortOrder` (string): "asc" or "desc"

**Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "lead_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "priority": "hot",
        "score": 85,
        "status": "new",
        "source": "website",
        "createdAt": "2025-10-04T12:00:00Z"
      }
    ],
    "total": 50
  }
}
```

### Get Lead Stats
**GET** `/leads/stats`
*Requires Authentication (Admin only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "hot": 25,
    "warm": 75,
    "cold": 50,
    "conversionRate": 15.5,
    "avgResponseTime": 2.5
  }
}
```

### Update Lead Status
**PATCH** `/leads/{leadId}/status`
*Requires Authentication (Admin only)*

**Body:**
```json
{
  "status": "contacted" // "new" | "contacted" | "qualified" | "converted" | "lost"
}
```

### Update Lead Priority
**PATCH** `/leads/{leadId}/priority`
*Requires Authentication (Admin only)*

**Body:**
```json
{
  "priority": "hot" // "hot" | "warm" | "cold"
}
```

---

## Dashboard Endpoints

### Get Patient Dashboard
**GET** `/dashboard/patient`
*Requires Authentication (Patient only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalAppointments": 15,
      "upcomingAppointments": 3,
      "completedAppointments": 10,
      "totalSpent": 7500
    },
    "upcomingAppointments": [],
    "recentActivity": [],
    "healthMetrics": {
      "bmi": 23.5,
      "lastCheckup": "2025-09-15"
    }
  }
}
```

### Get Doctor Dashboard
**GET** `/dashboard/doctor`
*Requires Authentication (Doctor only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalPatients": 150,
      "todayAppointments": 8,
      "monthlyRevenue": 75000,
      "rating": 4.8
    },
    "todaySchedule": [],
    "recentPatients": [],
    "performanceMetrics": {
      "completionRate": 95,
      "avgRating": 4.8,
      "patientSatisfaction": 92
    }
  }
}
```

### Get Admin Analytics
**GET** `/dashboard/admin-analytics`
*Requires Authentication (Admin only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalUsers": 1250,
      "totalDoctors": 85,
      "totalAppointments": 5420,
      "monthlyRevenue": 1250000
    },
    "revenue": [
      { "month": "Jan", "revenue": 125000 },
      { "month": "Feb", "revenue": 135000 }
    ],
    "userGrowth": [
      { "month": "Jan", "patients": 50, "doctors": 5 }
    ],
    "leadStats": {
      "total": 350,
      "hot": 75,
      "warm": 150,
      "cold": 125
    },
    "npsData": {
      "score": 72,
      "distribution": [
        { "category": "Promoters", "count": 450 },
        { "category": "Passives", "count": 200 },
        { "category": "Detractors", "count": 50 }
      ]
    }
  }
}
```

### Get Business Analytics
**GET** `/dashboard/business-analytics`
*Requires Authentication (Admin only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "rfmSegments": [
      { "segment": "Champions", "count": 125 },
      { "segment": "Loyal Customers", "count": 89 },
      { "segment": "At Risk", "count": 45 }
    ],
    "clvData": [
      { "tenure": 12, "clv": 15000 },
      { "tenure": 24, "clv": 25000 }
    ],
    "cohortAnalysis": [
      { "period": "Month 1", "Jan2024": 100, "Feb2024": 95 },
      { "period": "Month 2", "Jan2024": 85, "Feb2024": 80 }
    ],
    "churnPrediction": [
      { "riskLevel": "Low", "count": 450 },
      { "riskLevel": "Medium", "count": 125 },
      { "riskLevel": "High", "count": 35 }
    ],
    "customerJourney": [
      { "stage": "Awareness", "count": 1000 },
      { "stage": "Interest", "count": 750 },
      { "stage": "Consideration", "count": 500 },
      { "stage": "Purchase", "count": 250 },
      { "stage": "Retention", "count": 200 }
    ],
    "revenueMetrics": {
      "avgCLV": 18500,
      "churnRate": 12.5,
      "satisfaction": 88.5
    }
  }
}
```

---

## Doctor Endpoints

### Get Doctor Schedule
**GET** `/doctors/schedule`
*Requires Authentication (Doctor only)*

**Query Parameters:**
- `date` (string): Date in YYYY-MM-DD format

**Response:**
```json
{
  "success": true,
  "data": {
    "schedule": {
      "2025-10-05": [
        {
          "id": "slot_id",
          "startTime": "09:00",
          "endTime": "10:00",
          "type": "available",
          "maxAppointments": 1,
          "notes": "Regular consultation slot"
        }
      ]
    }
  }
}
```

### Add Schedule Slot
**POST** `/doctors/schedule`
*Requires Authentication (Doctor only)*

**Body:**
```json
{
  "date": "2025-10-05",
  "startTime": "09:00",
  "endTime": "10:00",
  "type": "available", // "available" | "busy" | "break"
  "maxAppointments": 1,
  "notes": "Regular consultation slot"
}
```

### Update Schedule Slot
**PUT** `/doctors/schedule/{slotId}`
*Requires Authentication (Doctor only)*

### Delete Schedule Slot
**DELETE** `/doctors/schedule/{slotId}`
*Requires Authentication (Doctor only)*

### Get Doctor Patients
**GET** `/doctors/patients`
*Requires Authentication (Doctor only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "patients": [
      {
        "id": "patient_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "age": 35,
        "gender": "male",
        "lastAppointment": "2025-10-01",
        "appointmentCount": 5,
        "profileImage": "image_url"
      }
    ],
    "total": 150
  }
}
```

### Get Patient Details
**GET** `/doctors/patients/{patientId}`
*Requires Authentication (Doctor only)*

**Response:**
```json
{
  "success": true,
  "data": {
    "patient": {
      "id": "patient_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+1234567890",
      "age": 35,
      "gender": "male",
      "bloodGroup": "O+",
      "medicalHistory": "Hypertension, Diabetes",
      "appointments": [
        {
          "date": "2025-10-01",
          "symptoms": "Chest pain",
          "status": "completed"
        }
      ],
      "prescriptions": [
        {
          "date": "2025-10-01",
          "medications": "Aspirin 75mg daily"
        }
      ]
    }
  }
}
```

### Add Prescription
**POST** `/doctors/patients/{patientId}/prescription`
*Requires Authentication (Doctor only)*

**Body:**
```json
{
  "medications": "Aspirin 75mg daily, Metformin 500mg twice daily",
  "instructions": "Take with food, monitor blood sugar",
  "followUp": "Return in 2 weeks",
  "notes": "Patient responding well to treatment"
}
```

### Get Doctor Appointments
**GET** `/doctors/appointments`
*Requires Authentication (Doctor only)*

**Query Parameters:**
- `date` (string): Filter by date
- `status` (string): Filter by status

---

## Patient Endpoints

### Get Patient Profile
**GET** `/patients/profile`
*Requires Authentication (Patient only)*

### Update Patient Profile
**PATCH** `/patients/profile`
*Requires Authentication (Patient only)*

**Body:**
```json
{
  "phone": "+1234567890",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "bloodGroup": "O+",
  "medicalHistory": "No known allergies",
  "emergencyContact": {
    "name": "Jane Doe",
    "phone": "+1234567891",
    "relationship": "spouse"
  }
}
```

### Get Favorites
**GET** `/patients/favorites`
*Requires Authentication (Patient only)*

### Add to Favorites
**POST** `/patients/favorites/{doctorId}`
*Requires Authentication (Patient only)*

### Remove from Favorites
**DELETE** `/patients/favorites/{doctorId}`
*Requires Authentication (Patient only)*

---

## Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `UNAUTHORIZED` | Authentication required |
| `FORBIDDEN` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |
| `APPOINTMENT_CONFLICT` | Time slot not available |
| `INVALID_CREDENTIALS` | Login credentials invalid |
| `TOKEN_EXPIRED` | JWT token expired |
| `SERVER_ERROR` | Internal server error |

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- Search endpoints: 20 requests per minute

## Pagination

List endpoints support pagination:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)

Response includes pagination metadata:
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

This API documentation covers all the major endpoints in the Sehat Mitra platform. For additional details or support, refer to the source code or contact the development team.
