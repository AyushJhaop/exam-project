import { useState, useEffect } from 'react';
import { Calendar } from 'react-calendar';
import {
  CalendarDaysIcon,
  ClockIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { doctorService } from '../../services/apiServices';
import 'react-calendar/dist/Calendar.css';

const DoctorSchedule = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [schedule, setSchedule] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState(null);
  const [newSlot, setNewSlot] = useState({
    startTime: '',
    endTime: '',
    type: 'available',
    maxAppointments: 1,
    notes: '',
  });
  const [weekView, setWeekView] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
    fetchAppointments();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await doctorService.getSchedule(dateStr);
      setSchedule(response.schedule || {});
    } catch (error) {
      console.error('Error fetching schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await doctorService.getAppointments(dateStr);
      setAppointments(response.appointments || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const saveScheduleSlot = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const slotData = {
        date: dateStr,
        ...newSlot,
      };

      if (editingSlot) {
        await doctorService.updateScheduleSlot(editingSlot.id, slotData);
        toast.success('Schedule slot updated successfully');
      } else {
        await doctorService.addScheduleSlot(slotData);
        toast.success('Schedule slot added successfully');
      }

      setShowSlotModal(false);
      setEditingSlot(null);
      setNewSlot({
        startTime: '',
        endTime: '',
        type: 'available',
        maxAppointments: 1,
        notes: '',
      });
      fetchSchedule();
    } catch (error) {
      console.error('Error saving schedule slot:', error);
      toast.error(error.response?.data?.message || 'Failed to save schedule slot');
    }
  };

  const deleteScheduleSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      await doctorService.deleteScheduleSlot(slotId);
      toast.success('Schedule slot deleted successfully');
      fetchSchedule();
    } catch (error) {
      console.error('Error deleting schedule slot:', error);
      toast.error('Failed to delete schedule slot');
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await api.patch(`/appointments/${appointmentId}/status`, { status });
      toast.success(`Appointment ${status} successfully`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating appointment status:', error);
      toast.error('Failed to update appointment status');
    }
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSlotTypeColor = (type) => {
    const colors = {
      available: 'bg-green-100 text-green-800 border-green-200',
      busy: 'bg-red-100 text-red-800 border-red-200',
      break: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return colors[type] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getAppointmentStatusColor = (status) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-purple-100 text-purple-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDaySchedule = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return schedule[dateStr] || [];
  };

  const getDayAppointments = () => {
    return appointments.filter(appointment => {
      const appointmentDate = new Date(appointment.date).toDateString();
      return appointmentDate === selectedDate.toDateString();
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading schedule...</h2>
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
              <h1 className="text-3xl font-bold text-gray-900">My Schedule</h1>
              <p className="text-gray-600">Manage your availability and appointments</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setWeekView(!weekView)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                {weekView ? 'Day View' : 'Week View'}
              </button>
              <button
                onClick={() => setShowSlotModal(true)}
                className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Time Slot
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Calendar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h3>
              <Calendar
                onChange={setSelectedDate}
                value={selectedDate}
                className="w-full border-0 shadow-none"
                tileClassName={({ date }) => {
                  const dateStr = date.toISOString().split('T')[0];
                  const daySchedule = schedule[dateStr];
                  if (daySchedule && daySchedule.length > 0) {
                    return 'bg-indigo-100 text-indigo-800';
                  }
                  return '';
                }}
              />
              
              <div className="mt-4 text-center">
                <p className="text-sm font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Schedule Details */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Time Slots */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Time Slots</h3>
                  <button
                    onClick={() => setShowSlotModal(true)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm"
                  >
                    + Add Slot
                  </button>
                </div>

                <div className="space-y-3">
                  {getDaySchedule().length > 0 ? (
                    getDaySchedule().map((slot, index) => (
                      <div
                        key={index}
                        className={`flex items-center justify-between p-4 border rounded-lg ${getSlotTypeColor(
                          slot.type
                        )}`}
                      >
                        <div className="flex items-center space-x-4">
                          <ClockIcon className="h-5 w-5" />
                          <div>
                            <p className="font-medium">
                              {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                            </p>
                            <p className="text-sm opacity-75 capitalize">
                              {slot.type} • Max {slot.maxAppointments} appointments
                            </p>
                            {slot.notes && (
                              <p className="text-xs opacity-60">{slot.notes}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setEditingSlot({ id: slot._id, ...slot });
                              setNewSlot(slot);
                              setShowSlotModal(true);
                            }}
                            className="p-1 text-gray-600 hover:text-gray-800"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteScheduleSlot(slot._id)}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CalendarDaysIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No time slots scheduled for this day</p>
                      <button
                        onClick={() => setShowSlotModal(true)}
                        className="mt-2 text-indigo-600 hover:text-indigo-800"
                      >
                        Add your first time slot
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Appointments */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointments</h3>
                
                <div className="space-y-4">
                  {getDayAppointments().length > 0 ? (
                    getDayAppointments().map((appointment) => (
                      <div
                        key={appointment._id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          {appointment.patient.profileImage ? (
                            <img
                              src={appointment.patient.profileImage}
                              alt={appointment.patient.name}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          
                          <div>
                            <p className="font-medium text-gray-900">{appointment.patient.name}</p>
                            <p className="text-sm text-gray-600">
                              {formatTime(appointment.time)} • {appointment.symptoms}
                            </p>
                            <div className="flex items-center mt-1">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAppointmentStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {appointment.status}
                              </span>
                              {appointment.urgency === 'urgent' && (
                                <span className="ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'confirmed')}
                                className="p-2 text-green-600 hover:text-green-800"
                                title="Confirm"
                              >
                                <CheckCircleIcon className="h-5 w-5" />
                              </button>
                              <button
                                onClick={() => updateAppointmentStatus(appointment._id, 'cancelled')}
                                className="p-2 text-red-600 hover:text-red-800"
                                title="Cancel"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          
                          {appointment.status === 'confirmed' && (
                            <button
                              onClick={() => updateAppointmentStatus(appointment._id, 'completed')}
                              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <UserIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No appointments scheduled for this day</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add/Edit Slot Modal */}
        {showSlotModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    {editingSlot ? 'Edit Time Slot' : 'Add Time Slot'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowSlotModal(false);
                      setEditingSlot(null);
                      setNewSlot({
                        startTime: '',
                        endTime: '',
                        type: 'available',
                        maxAppointments: 1,
                        notes: '',
                      });
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.startTime}
                        onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={newSlot.endTime}
                        onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slot Type
                    </label>
                    <select
                      value={newSlot.type}
                      onChange={(e) => setNewSlot({ ...newSlot, type: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    >
                      <option value="available">Available</option>
                      <option value="busy">Busy</option>
                      <option value="break">Break</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Appointments
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={newSlot.maxAppointments}
                      onChange={(e) => setNewSlot({ ...newSlot, maxAppointments: parseInt(e.target.value) })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (Optional)
                    </label>
                    <textarea
                      value={newSlot.notes}
                      onChange={(e) => setNewSlot({ ...newSlot, notes: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Add any notes about this time slot..."
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowSlotModal(false);
                      setEditingSlot(null);
                      setNewSlot({
                        startTime: '',
                        endTime: '',
                        type: 'available',
                        maxAppointments: 1,
                        notes: '',
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveScheduleSlot}
                    disabled={!newSlot.startTime || !newSlot.endTime}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    {editingSlot ? 'Update' : 'Save'} Slot
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

export default DoctorSchedule;
