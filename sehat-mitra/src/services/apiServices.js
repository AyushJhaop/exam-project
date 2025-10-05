import api from './api';

// Auth Services
const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  verify: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },

  changePassword: async (passwordData) => {
    const response = await api.post('/auth/change-password', passwordData);
    return response.data;
  }
};

// Doctor Services
const doctorService = {
  // Profile Management
  getProfile: async () => {
    const response = await api.get('/doctors/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/doctors/profile', profileData);
    return response.data;
  },

  // Schedule Management
  getSchedule: async (date) => {
    const response = await api.get(`/doctors/schedule?date=${date}`);
    return response.data;
  },

  addScheduleSlot: async (slotData) => {
    const response = await api.post('/doctors/schedule', slotData);
    return response.data;
  },

  updateScheduleSlot: async (slotId, slotData) => {
    const response = await api.put(`/doctors/schedule/${slotId}`, slotData);
    return response.data;
  },

  deleteScheduleSlot: async (slotId) => {
    const response = await api.delete(`/doctors/schedule/${slotId}`);
    return response.data;
  },

  // Appointments
  getAppointments: async (date) => {
    const response = await api.get(`/doctors/appointments?date=${date}`);
    return response.data;
  },

  getAppointmentHistory: async (page = 1, limit = 10, status) => {
    let url = `/doctors/appointments/history?page=${page}&limit=${limit}`;
    if (status) url += `&status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  updateAppointmentStatus: async (appointmentId, status, notes) => {
    const response = await api.put(`/doctors/appointments/${appointmentId}/status`, {
      status,
      notes
    });
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/doctors/dashboard');
    return response.data;
  },

  getPatterns: async (timeframe = '7d') => {
    const response = await api.get(`/doctors/patterns?timeframe=${timeframe}`);
    return response.data;
  }
};

// Patient Services
const patientService = {
  // Profile Management
  getProfile: async () => {
    const response = await api.get('/patients/profile');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/patients/profile', profileData);
    return response.data;
  },

  // Doctor Search & Booking
  searchDoctors: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/patients/search-doctors?${params.toString()}`);
    return response.data;
  },

  getDoctorDetails: async (doctorId) => {
    const response = await api.get(`/patients/doctors/${doctorId}`);
    return response.data;
  },

  getDoctorAvailability: async (doctorId, date) => {
    const response = await api.get(`/patients/doctors/${doctorId}/availability?date=${date}`);
    return response.data;
  },

  bookAppointment: async (appointmentData) => {
    const response = await api.post('/patients/appointments/book', appointmentData);
    return response.data;
  },

  // Appointments
  getAppointments: async (status) => {
    let url = '/patients/appointments';
    if (status) url += `?status=${status}`;
    const response = await api.get(url);
    return response.data;
  },

  getAppointmentHistory: async (page = 1, limit = 10) => {
    const response = await api.get(`/patients/appointments/history?page=${page}&limit=${limit}`);
    return response.data;
  },

  cancelAppointment: async (appointmentId, reason) => {
    const response = await api.put(`/patients/appointments/${appointmentId}/cancel`, { reason });
    return response.data;
  },

  rescheduleAppointment: async (appointmentId, newSlot) => {
    const response = await api.put(`/patients/appointments/${appointmentId}/reschedule`, newSlot);
    return response.data;
  },

  // Dashboard
  getDashboardStats: async () => {
    const response = await api.get('/patients/dashboard');
    return response.data;
  }
};

// Appointment Services
const appointmentService = {
  // General appointment operations
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/appointments?${params.toString()}`);
    return response.data;
  },

  getById: async (appointmentId) => {
    const response = await api.get(`/appointments/${appointmentId}`);
    return response.data;
  },

  create: async (appointmentData) => {
    const response = await api.post('/appointments', appointmentData);
    return response.data;
  },

  update: async (appointmentId, appointmentData) => {
    const response = await api.put(`/appointments/${appointmentId}`, appointmentData);
    return response.data;
  },

  delete: async (appointmentId) => {
    const response = await api.delete(`/appointments/${appointmentId}`);
    return response.data;
  },

  // Bulk operations
  bulkUpdate: async (appointmentIds, updateData) => {
    const response = await api.put('/appointments/bulk-update', {
      appointmentIds,
      updateData
    });
    return response.data;
  }
};

// Lead Services
const leadService = {
  // CRUD operations
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/leads?${params.toString()}`);
    return response.data;
  },

  getById: async (leadId) => {
    const response = await api.get(`/leads/${leadId}`);
    return response.data;
  },

  create: async (leadData) => {
    const response = await api.post('/leads', leadData);
    return response.data;
  },

  update: async (leadId, leadData) => {
    const response = await api.put(`/leads/${leadId}`, leadData);
    return response.data;
  },

  delete: async (leadId) => {
    const response = await api.delete(`/leads/${leadId}`);
    return response.data;
  },

  // Lead management specific operations
  updateStatus: async (leadId, status, notes) => {
    const response = await api.put(`/leads/${leadId}/status`, { status, notes });
    return response.data;
  },

  assignTo: async (leadId, assigneeId) => {
    const response = await api.put(`/leads/${leadId}/assign`, { assigneeId });
    return response.data;
  },

  convertToPatient: async (leadId) => {
    const response = await api.post(`/leads/${leadId}/convert`);
    return response.data;
  },

  // Convert lead (alias for convertToPatient)
  convertLead: async (leadId) => {
    const response = await api.post(`/leads/${leadId}/convert`);
    return response.data;
  },

  // Add interaction to lead
  addInteraction: async (leadId, interaction) => {
    const response = await api.post(`/leads/${leadId}/interaction`, interaction);
    return response.data;
  },

  // Analytics
  getStats: async () => {
    const response = await api.get('/leads/stats');
    return response.data;
  },

  getFunnelAnalytics: async (timeframe = '30d') => {
    const response = await api.get(`/leads/funnel?timeframe=${timeframe}`);
    return response.data;
  }
};

// Dashboard Services
const dashboardService = {
  // Admin/Business Dashboard
  getBusinessMetrics: async (timeframe = '30d') => {
    const response = await api.get(`/dashboard/business?timeframe=${timeframe}`);
    return response.data;
  },

  getRevenueAnalytics: async (timeframe = '30d') => {
    const response = await api.get(`/dashboard/revenue?timeframe=${timeframe}`);
    return response.data;
  },

  getUserGrowth: async (timeframe = '30d') => {
    const response = await api.get(`/dashboard/user-growth?timeframe=${timeframe}`);
    return response.data;
  },

  getAppointmentTrends: async (timeframe = '30d') => {
    const response = await api.get(`/dashboard/appointment-trends?timeframe=${timeframe}`);
    return response.data;
  },

  getTopDoctors: async (limit = 10) => {
    const response = await api.get(`/dashboard/top-doctors?limit=${limit}`);
    return response.data;
  },

  // General Dashboard
  getOverview: async () => {
    const response = await api.get('/dashboard/overview');
    return response.data;
  },

  getRecentActivity: async (limit = 10) => {
    const response = await api.get(`/dashboard/recent-activity?limit=${limit}`);
    return response.data;
  }
};

// Admin Services
const adminService = {
  // User Management
  getAllUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    const response = await api.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  updateUserStatus: async (userId, status) => {
    const response = await api.put(`/admin/users/${userId}/status`, { status });
    return response.data;
  },

  deleteUser: async (userId) => {
    const response = await api.delete(`/admin/users/${userId}`);
    return response.data;
  },

  // System Management
  getSystemStats: async () => {
    const response = await api.get('/admin/system/stats');
    return response.data;
  },

  getSystemLogs: async (page = 1, limit = 50) => {
    const response = await api.get(`/admin/system/logs?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Export all services
export {
  authService as default,
  doctorService,
  patientService,
  appointmentService,
  leadService,
  dashboardService,
  adminService
};
