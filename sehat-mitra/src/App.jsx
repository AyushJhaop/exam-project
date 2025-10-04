import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout Components
import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Components
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AppointmentBooking from './pages/patient/AppointmentBooking';
import DoctorSearch from './pages/patient/DoctorSearch';
import AppointmentHistory from './pages/patient/AppointmentHistory';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import PatientManagement from './pages/doctor/PatientManagement';
import BusinessDashboard from './pages/admin/BusinessDashboard';
import LeadManagement from './pages/admin/LeadManagement';
import ApiTestPage from './pages/ApiTestPage';
import NotFoundPage from './pages/NotFoundPage';

// Loading component
const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Sehat Mitra</h2>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

// Dashboard Router Component
const DashboardRouter = () => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  switch (user.role) {
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
      return <DoctorDashboard />;
    case 'admin':
      return <AdminDashboard />;
    default:
      return <Navigate to="/login" replace />;
  }
};

// Main App Component
const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardRouter />
              </ProtectedRoute>
            } 
          />

          {/* Patient Routes */}
          <Route 
            path="/book-appointment" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppointmentBooking />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/search-doctors" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DoctorSearch />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/my-appointments" 
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <AppointmentHistory />
              </ProtectedRoute>
            } 
          />

          {/* Doctor Routes */}
          <Route 
            path="/doctor/schedule" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorSchedule />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/doctor/patients" 
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <PatientManagement />
              </ProtectedRoute>
            } 
          />

          {/* Admin Routes */}
          <Route 
            path="/admin/business" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <BusinessDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/leads" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <LeadManagement />
              </ProtectedRoute>
            } 
          />

          {/* API Test Route - Available to all authenticated users */}
          <Route 
            path="/api-test" 
            element={
              <ProtectedRoute>
                <ApiTestPage />
              </ProtectedRoute>
            } 
          />

          {/* 404 Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
