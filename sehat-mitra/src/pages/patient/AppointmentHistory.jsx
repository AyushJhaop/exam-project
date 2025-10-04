import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDaysIcon,
  ClockIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  StarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { patientService } from '../../services/apiServices';

const AppointmentHistory = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    doctor: '',
  });
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [appointments, filters]);

  const fetchAppointments = async () => {
    try {
      const response = await patientService.getAppointments();
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...appointments];

    if (filters.status !== 'all') {
      filtered = filtered.filter(appointment => appointment.status === filters.status);
    }

    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (filters.dateRange) {
        case 'today':
          filterDate.setDate(now.getDate());
          filtered = filtered.filter(appointment => 
            new Date(appointment.date).toDateString() === filterDate.toDateString()
          );
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          filtered = filtered.filter(appointment => 
            new Date(appointment.date) >= filterDate
          );
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          filtered = filtered.filter(appointment => 
            new Date(appointment.date) >= filterDate
          );
          break;
        case 'upcoming':
          filtered = filtered.filter(appointment => 
            new Date(appointment.date) > now
          );
          break;
      }
    }

    if (filters.doctor) {
      filtered = filtered.filter(appointment =>
        appointment.doctor.name.toLowerCase().includes(filters.doctor.toLowerCase())
      );
    }

    // Sort by date (most recent first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredAppointments(filtered);
  };

  const cancelAppointment = async (appointmentId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await api.patch(`/appointments/${appointmentId}/cancel`);
      toast.success('Appointment cancelled successfully');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel appointment');
    }
  };

  const rescheduleAppointment = async (appointmentId) => {
    // This would typically navigate to a rescheduling page
    toast.info('Reschedule feature coming soon!');
  };

  const submitRating = async () => {
    try {
      await api.post(`/appointments/${selectedAppointment._id}/rating`, {
        rating,
        review,
      });
      toast.success('Rating submitted successfully');
      setShowRatingModal(false);
      setRating(5);
      setReview('');
      fetchAppointments();
    } catch (error) {
      console.error('Error submitting rating:', error);
      toast.error('Failed to submit rating');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
      rescheduled: 'bg-yellow-100 text-yellow-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <CalendarDaysIcon className="h-4 w-4" />;
      case 'completed':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'cancelled':
        return <ClockIcon className="h-4 w-4" />;
      default:
        return <CalendarDaysIcon className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const canCancelOrReschedule = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`);
    const now = new Date();
    const hoursDiff = (appointmentDateTime - now) / (1000 * 60 * 60);
    
    return hoursDiff > 24 && ['scheduled', 'confirmed'].includes(appointment.status);
  };

  const renderStarRating = (rating, interactive = false, onRatingChange = null) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            disabled={!interactive}
            className={interactive ? 'cursor-pointer' : 'cursor-default'}
          >
            {star <= rating ? (
              <StarIconSolid className="h-5 w-5 text-yellow-400" />
            ) : (
              <StarIcon className="h-5 w-5 text-gray-300" />
            )}
          </button>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading appointments...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600">View and manage your appointment history</p>
            </div>
            <Link
              to="/book-appointment"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Book New Appointment
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Time</option>
                <option value="upcoming">Upcoming</option>
                <option value="today">Today</option>
                <option value="week">Last 7 Days</option>
                <option value="month">Last 30 Days</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Doctor</label>
              <input
                type="text"
                value={filters.doctor}
                onChange={(e) => setFilters({ ...filters, doctor: e.target.value })}
                placeholder="Search by doctor name"
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setFilters({ status: 'all', dateRange: 'all', doctor: '' })}
                className="w-full px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-6">
          {filteredAppointments.map((appointment) => (
            <div key={appointment._id} className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Doctor Info */}
                <div className="flex items-center space-x-4 flex-1">
                  {appointment.doctor.profileImage ? (
                    <img
                      src={appointment.doctor.profileImage}
                      alt={appointment.doctor.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {appointment.doctor.name}
                    </h3>
                    <p className="text-gray-600 capitalize">{appointment.doctor.specialty}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-1">
                      <MapPinIcon className="h-4 w-4 mr-1" />
                      {appointment.doctor.location}
                    </div>
                  </div>
                </div>

                {/* Appointment Details */}
                <div className="flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Date & Time</p>
                      <p className="font-medium">
                        {formatDate(appointment.date)} at {formatTime(appointment.time)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Status</p>
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusIcon(appointment.status)}
                          <span className="ml-1 capitalize">{appointment.status}</span>
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Appointment ID</p>
                      <p className="font-mono text-sm">{appointment._id.slice(-8)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fee</p>
                      <p className="font-medium text-green-600">₹{appointment.fee}</p>
                    </div>
                  </div>

                  {appointment.symptoms && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600">Symptoms</p>
                      <p className="text-sm">{appointment.symptoms}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 min-w-[120px]">
                  <button
                    onClick={() => {
                      setSelectedAppointment(appointment);
                      setShowModal(true);
                    }}
                    className="flex items-center justify-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    View Details
                  </button>

                  {appointment.status === 'confirmed' && (
                    <button className="flex items-center justify-center px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200">
                      <VideoCameraIcon className="h-4 w-4 mr-1" />
                      Join Call
                    </button>
                  )}

                  {appointment.status === 'completed' && !appointment.rating && (
                    <button
                      onClick={() => {
                        setSelectedAppointment(appointment);
                        setShowRatingModal(true);
                      }}
                      className="flex items-center justify-center px-3 py-2 text-sm bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200"
                    >
                      <StarIcon className="h-4 w-4 mr-1" />
                      Rate Doctor
                    </button>
                  )}

                  {canCancelOrReschedule(appointment) && (
                    <>
                      <button
                        onClick={() => rescheduleAppointment(appointment._id)}
                        className="flex items-center justify-center px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                      >
                        <ClockIcon className="h-4 w-4 mr-1" />
                        Reschedule
                      </button>
                      <button
                        onClick={() => cancelAppointment(appointment._id)}
                        className="flex items-center justify-center px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                      >
                        Cancel
                      </button>
                    </>
                  )}

                  {appointment.prescription && (
                    <button className="flex items-center justify-center px-3 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Download
                    </button>
                  )}
                </div>
              </div>

              {appointment.rating && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Your Rating</p>
                      {renderStarRating(appointment.rating.rating)}
                    </div>
                    {appointment.rating.review && (
                      <div className="flex-1 ml-6">
                        <p className="text-sm text-gray-600">Your Review</p>
                        <p className="text-sm italic">"{appointment.rating.review}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
            <p className="text-gray-600 mb-4">
              {appointments.length === 0
                ? "You haven't booked any appointments yet."
                : 'Try adjusting your filters to see more appointments.'}
            </p>
            <Link
              to="/book-appointment"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Book Your First Appointment
            </Link>
          </div>
        )}

        {/* Appointment Detail Modal */}
        {showModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointment Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Doctor</label>
                      <p className="text-sm text-gray-900">{selectedAppointment.doctor.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Specialty</label>
                      <p className="text-sm text-gray-900 capitalize">{selectedAppointment.doctor.specialty}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Date</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedAppointment.date)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Time</label>
                      <p className="text-sm text-gray-900">{formatTime(selectedAppointment.time)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Symptoms</label>
                    <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedAppointment.symptoms}</p>
                  </div>
                  
                  {selectedAppointment.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded">{selectedAppointment.notes}</p>
                    </div>
                  )}
                  
                  {selectedAppointment.prescription && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prescription</label>
                      <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded">
                        <p>{selectedAppointment.prescription}</p>
                        <button className="mt-2 text-indigo-600 hover:text-indigo-800">
                          Download Prescription
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && selectedAppointment && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Rate Your Experience</h3>
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">
                      How was your appointment with Dr. {selectedAppointment.doctor.name}?
                    </p>
                    <div className="flex justify-center">
                      {renderStarRating(rating, true, setRating)}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Share your experience (Optional)
                    </label>
                    <textarea
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      rows={4}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Write your review..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowRatingModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitRating}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Submit Rating
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentHistory;
