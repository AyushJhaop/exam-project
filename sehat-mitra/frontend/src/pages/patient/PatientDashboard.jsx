import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  HeartIcon,
  ClockIcon,
  StarIcon,
  PlusIcon,
  EyeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { patientService } from '../../services/apiServices';
import toast from 'react-hot-toast';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    appointmentStats: {
      total: 0,
      completed: 0,
      completionRate: 0,
      statusBreakdown: []
    },
    upcomingAppointments: [],
    recentPrescriptions: [],
    loyaltyMetrics: {},
    memberSince: null
  });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await patientService.getDashboardStats();
      if (response.success) {
        console.log('✅ Dashboard data loaded:', response.dashboard);
        console.log('💰 Total spent will be:', response.dashboard.loyaltyMetrics?.totalSpent);
        setDashboardData(response.dashboard);
      } else {
        console.error('Dashboard API returned error:', response.message);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
            Welcome back, {user?.firstName}!
          </h1>
          <p className="text-gray-600 mt-2">
            Here's your health dashboard overview
          </p>
          {dashboardData.memberSince && (
            <p className="text-sm text-gray-500 mt-1">
              Member since {formatDate(dashboardData.memberSince)}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Link
            to="/book-appointment"
            className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <PlusIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-semibold text-lg">Book Appointment</div>
                <div className="text-indigo-200 text-sm">Schedule a consultation</div>
              </div>
            </div>
          </Link>

          <Link
            to="/search-doctors"
            className="bg-white border-2 border-indigo-600 text-indigo-600 p-6 rounded-xl hover:bg-indigo-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <UserIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-semibold text-lg">Find Doctors</div>
                <div className="text-indigo-400 text-sm">Browse specialists</div>
              </div>
            </div>
          </Link>

          <Link
            to="/my-appointments"
            className="bg-white border-2 border-gray-200 text-gray-700 p-6 rounded-xl hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center space-x-3">
              <CalendarIcon className="w-8 h-8 group-hover:scale-110 transition-transform" />
              <div>
                <div className="font-semibold text-lg">My Appointments</div>
                <div className="text-gray-500 text-sm">View history</div>
              </div>
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Appointment Statistics */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Appointment Overview</h2>
                <ChartBarIcon className="w-6 h-6 text-gray-400" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {dashboardData.appointmentStats.total}
                  </div>
                  <div className="text-sm text-blue-600">Total</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {dashboardData.appointmentStats.completed}
                  </div>
                  <div className="text-sm text-green-600">Completed</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {dashboardData.appointmentStats.completionRate}%
                  </div>
                  <div className="text-sm text-purple-600">Success Rate</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">
                    {dashboardData.loyaltyMetrics?.loyaltyScore || 0}
                  </div>
                  <div className="text-sm text-orange-600">Loyalty Score</div>
                </div>
              </div>

              {dashboardData.appointmentStats.statusBreakdown.length > 0 && (
                <div className="space-y-2">
                  <h3 className="font-medium text-gray-700">Status Breakdown:</h3>
                  {dashboardData.appointmentStats.statusBreakdown.map((status, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <span className="capitalize text-gray-600">{status._id}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status._id)}`}>
                        {status.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Upcoming Appointments */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Upcoming Appointments</h2>
                <Link
                  to="/my-appointments"
                  className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View all</span>
                  <EyeIcon className="w-4 h-4" />
                </Link>
              </div>

              {dashboardData.upcomingAppointments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.upcomingAppointments.map((appointment) => (
                    <div
                      key={appointment._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                            <UserIcon className="w-6 h-6 text-indigo-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              Dr. {appointment.doctor.firstName} {appointment.doctor.lastName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {appointment.doctor.doctorInfo?.specialization?.[0]}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium text-gray-900">
                            {formatDate(appointment.appointmentDate)}
                          </div>
                          <div className="text-sm text-gray-600">
                            {formatTime(appointment.startTime)}
                          </div>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No upcoming appointments</p>
                  <Link
                    to="/book-appointment"
                    className="inline-block mt-2 text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    Book your first appointment
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Health Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <HeartIcon className="w-6 h-6 text-red-500" />
                <h2 className="text-xl font-semibold text-gray-900">Health Summary</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Consultations</span>
                  <span className="font-semibold">{dashboardData.appointmentStats.total}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-green-600">
                    {dashboardData.appointmentStats.completionRate}%
                  </span>
                </div>
                
                {/* Enhanced Total Spent Display */}
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center">
                      <span className="text-gray-700 font-medium">💰 Total Amount Spent</span>
                    </div>
                    <span className="font-bold text-2xl text-green-700">
                      ₹{dashboardData.loyaltyMetrics?.totalSpent || 0}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    From {dashboardData.appointmentStats.completed} completed consultations
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Loyalty Level</span>
                  <div className="flex items-center space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <StarIcon
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.floor((dashboardData.loyaltyMetrics?.loyaltyScore || 0) / 20)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Prescriptions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="w-6 h-6 text-green-500" />
                <h2 className="text-xl font-semibold text-gray-900">Recent Prescriptions</h2>
              </div>

              {dashboardData.recentPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recentPrescriptions.slice(0, 3).map((prescription, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-gray-900">
                          Dr. {prescription.doctor.firstName} {prescription.doctor.lastName}
                        </h4>
                        <span className="text-xs text-gray-500">
                          {formatDate(prescription.appointmentDate)}
                        </span>
                      </div>
                      {prescription.prescription.medications?.length > 0 && (
                        <div className="text-sm text-gray-600">
                          {prescription.prescription.medications.length} medication(s) prescribed
                        </div>
                      )}
                      {prescription.prescription.notes && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {prescription.prescription.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No prescriptions yet</p>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-6">
              <h3 className="font-semibold text-blue-900 mb-3">Health Tips</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li>• Book regular check-ups to maintain good health</li>
                <li>• Keep track of your symptoms before appointments</li>
                <li>• Follow prescribed medications as directed</li>
                <li>• Maintain a healthy lifestyle with proper diet and exercise</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
