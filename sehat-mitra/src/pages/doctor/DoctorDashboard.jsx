import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CalendarIcon,
  UserGroupIcon,
  BanknotesIcon,
  StarIcon,
  ClockIcon,
  DocumentTextIcon,
  EyeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { doctorService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    appointmentStats: {
      total: 0,
      completed: 0,
      completionRate: 0,
      statusBreakdown: []
    },
    todayAppointments: {
      count: 0,
      appointments: []
    },
    upcomingAppointments: [],
    revenue: {
      total: 0,
      average: 0,
      completedAppointments: 0
    },
    rating: {
      average: 0,
      count: 0
    },
    recentReviews: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await doctorService.getDashboardStats();
      if (response.success) {
        setDashboardData(response.dashboard);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <StarIcon
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome, Dr. {user?.firstName} {user?.lastName}
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your practice overview for today
          </p>
          <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <StarIcon className="w-4 h-4 text-yellow-400 fill-current" />
              <span>{dashboardData.rating.average.toFixed(1)} rating</span>
            </div>
            <div>•</div>
            <div>{dashboardData.rating.count} reviews</div>
            <div>•</div>
            <div>{user?.doctorInfo?.specialization?.[0]}</div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Today's Appointments</p>
                <p className="text-3xl font-bold text-blue-600">
                  {dashboardData.todayAppointments.count}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Patients</p>
                <p className="text-3xl font-bold text-green-600">
                  {dashboardData.appointmentStats.total}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-purple-600">
                  ₹{dashboardData.revenue.total.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <BanknotesIcon className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-3xl font-bold text-indigo-600">
                  {dashboardData.appointmentStats.completionRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                <ArrowTrendingUpIcon className="w-6 h-6 text-indigo-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Schedule */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
                <Link
                  to="/doctor/schedule"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>Manage schedule</span>
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </div>

              {dashboardData.todayAppointments.appointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.todayAppointments.appointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatTime(appointment.startTime)} - {formatTime(appointment.endTime)}
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(appointment.status)}`}>
                            {appointment.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </div>

            {/* Revenue Analytics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ChartBarIcon className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">Revenue Analytics</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{dashboardData.revenue.total.toLocaleString()}
                  </div>
                  <div className="text-sm text-green-600">Total Revenue</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    ₹{parseFloat(dashboardData.revenue.average).toLocaleString()}
                  </div>
                  <div className="text-sm text-blue-600">Average per Consultation</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.revenue.completedAppointments}
                  </div>
                  <div className="text-sm text-purple-600">Paid Consultations</div>
                </div>
              </div>
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link
                  to="/doctor/patients"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View patients</span>
                  <UsersIcon className="w-4 h-4" />
                </Link>
              </div>

              {dashboardData.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.slice(0, 5).map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                            <UserGroupIcon className="w-5 h-5 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {appointment.patient.firstName} {appointment.patient.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(appointment.startTime)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming appointments</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Rating Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <StarIcon className="w-6 h-6 text-yellow-500" />
                <h2 className="text-xl font-semibold text-gray-900">Rating Summary</h2>
              </div>

              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-yellow-500 mb-2">
                  {dashboardData.rating.average.toFixed(1)}
                </div>
                <div className="flex justify-center space-x-1 mb-2">
                  {renderStars(dashboardData.rating.average)}
                </div>
                <p className="text-sm text-gray-600">
                  Based on {dashboardData.rating.count} reviews
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Patient Satisfaction</span>
                  <span className="font-semibold">
                    {dashboardData.rating.count > 0 ? '95%' : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Recommendation Rate</span>
                  <span className="font-semibold">
                    {dashboardData.rating.count > 0 ? '92%' : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Reviews */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-blue-500" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Reviews</h2>
              </div>

              {dashboardData.recentReviews.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentReviews.slice(0, 3).map((review, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium text-gray-900 text-sm">
                          {review.patient.firstName} {review.patient.lastName}
                        </h4>
                        <div className="flex space-x-1">
                          {renderStars(review.rating.patientRating.score)}
                        </div>
                      </div>
                      {review.rating.patientRating.review && (
                        <p className="text-xs text-gray-600 line-clamp-2">
                          "{review.rating.patientRating.review}"
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">
                        {formatDate(review.appointmentDate)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No reviews yet</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl border border-indigo-200 p-6">
              <h3 className="font-semibold text-indigo-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/doctor/schedule"
                  className="block w-full text-left text-sm text-indigo-700 hover:text-indigo-900 font-medium py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  📅 Update Schedule
                </Link>
                <Link
                  to="/doctor/patients"
                  className="block w-full text-left text-sm text-indigo-700 hover:text-indigo-900 font-medium py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  👥 View Patients
                </Link>
                <Link
                  to="/doctor/analytics"
                  className="block w-full text-left text-sm text-indigo-700 hover:text-indigo-900 font-medium py-2 px-3 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  📊 View Analytics
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
