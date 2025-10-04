import { useState, useEffect } from 'react';
import {
  UserIcon,
  MagnifyingGlassIcon,
  PhoneIcon,
  EnvelopeIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  EyeIcon,
  PencilIcon,
  PlusIcon,
  HeartIcon,
  ClockIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import api from '../../services/api';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    ageGroup: 'all',
    lastVisit: 'all',
    gender: 'all',
  });
  const [prescription, setPrescription] = useState({
    medications: '',
    instructions: '',
    followUp: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [patients, searchQuery, filters]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/doctors/patients');
      setPatients(response.data.patients);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...patients];

    // Apply search query
    if (searchQuery) {
      filtered = filtered.filter(patient =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        patient.phone?.includes(searchQuery)
      );
    }

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(patient => {
        switch (filters.status) {
          case 'active':
            return patient.lastAppointment && new Date(patient.lastAppointment) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          case 'inactive':
            return !patient.lastAppointment || new Date(patient.lastAppointment) <= new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
          case 'new':
            return patient.appointmentCount <= 1;
          default:
            return true;
        }
      });
    }

    if (filters.ageGroup !== 'all') {
      filtered = filtered.filter(patient => {
        const age = patient.age || 0;
        switch (filters.ageGroup) {
          case 'child':
            return age < 18;
          case 'adult':
            return age >= 18 && age < 65;
          case 'senior':
            return age >= 65;
          default:
            return true;
        }
      });
    }

    if (filters.gender !== 'all') {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    if (filters.lastVisit !== 'all') {
      const now = new Date();
      filtered = filtered.filter(patient => {
        if (!patient.lastAppointment) return filters.lastVisit === 'never';
        
        const lastVisit = new Date(patient.lastAppointment);
        const daysDiff = (now - lastVisit) / (1000 * 60 * 60 * 24);
        
        switch (filters.lastVisit) {
          case 'week':
            return daysDiff <= 7;
          case 'month':
            return daysDiff <= 30;
          case 'quarter':
            return daysDiff <= 90;
          case 'year':
            return daysDiff <= 365;
          case 'never':
            return false;
          default:
            return true;
        }
      });
    }

    setFilteredPatients(filtered);
  };

  const viewPatientDetails = async (patientId) => {
    try {
      const response = await api.get(`/doctors/patients/${patientId}`);
      setSelectedPatient(response.data.patient);
      setShowModal(true);
    } catch (error) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to fetch patient details');
    }
  };

  const addPrescription = async () => {
    try {
      await api.post(`/doctors/patients/${selectedPatient._id}/prescription`, prescription);
      toast.success('Prescription added successfully');
      setShowPrescriptionModal(false);
      setPrescription({
        medications: '',
        instructions: '',
        followUp: '',
        notes: '',
      });
      // Refresh patient details
      viewPatientDetails(selectedPatient._id);
    } catch (error) {
      console.error('Error adding prescription:', error);
      toast.error('Failed to add prescription');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getPatientStatusColor = (patient) => {
    if (!patient.lastAppointment) return 'bg-gray-100 text-gray-800';
    
    const daysSinceLastVisit = (new Date() - new Date(patient.lastAppointment)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastVisit <= 30) return 'bg-green-100 text-green-800';
    if (daysSinceLastVisit <= 90) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getPatientStatusLabel = (patient) => {
    if (!patient.lastAppointment) return 'New';
    
    const daysSinceLastVisit = (new Date() - new Date(patient.lastAppointment)) / (1000 * 60 * 60 * 24);
    
    if (daysSinceLastVisit <= 30) return 'Active';
    if (daysSinceLastVisit <= 90) return 'Regular';
    return 'Inactive';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading patients...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600">Manage your patients and their medical records</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search patients by name, email, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Patients</option>
                <option value="active">Active (Last 3 months)</option>
                <option value="inactive">Inactive (3+ months)</option>
                <option value="new">New Patients</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select
                value={filters.ageGroup}
                onChange={(e) => setFilters({ ...filters, ageGroup: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Ages</option>
                <option value="child">Children (0-17)</option>
                <option value="adult">Adults (18-64)</option>
                <option value="senior">Seniors (65+)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Visit</label>
              <select
                value={filters.lastVisit}
                onChange={(e) => setFilters({ ...filters, lastVisit: e.target.value })}
                className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">Any Time</option>
                <option value="week">Last Week</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last 3 Months</option>
                <option value="year">Last Year</option>
                <option value="never">Never Visited</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={() => setFilters({ status: 'all', ageGroup: 'all', lastVisit: 'all', gender: 'all' })}
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              Clear All Filters
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-500">
                <UserIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-500">
                <HeartIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Patients</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patients.filter(p => p.lastAppointment && new Date(p.lastAppointment) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-500">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New This Month</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patients.filter(p => p.createdAt && new Date(p.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-purple-500">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Appointments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patients.reduce((sum, p) => sum + (p.appointmentCount || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Patients ({filteredPatients.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointments
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {patient.profileImage ? (
                          <img
                            src={patient.profileImage}
                            alt={patient.name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                          <div className="text-sm text-gray-500">
                            {patient.age ? `${patient.age} years` : 'Age unknown'} • {patient.gender || 'Gender not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div className="flex items-center">
                          <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center mt-1">
                            <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                            {patient.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPatientStatusColor(patient)}`}>
                        {getPatientStatusLabel(patient)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(patient.lastAppointment)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {patient.appointmentCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewPatientDetails(patient._id)}
                          className="text-indigo-600 hover:text-indigo-900"
                          title="View Details"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPatient(patient);
                            setShowPrescriptionModal(true);
                          }}
                          className="text-green-600 hover:text-green-900"
                          title="Add Prescription"
                        >
                          <PlusIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredPatients.length === 0 && (
          <div className="text-center py-12">
            <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patients found</h3>
            <p className="text-gray-600">
              {patients.length === 0
                ? "You don't have any patients yet."
                : 'Try adjusting your search or filters.'}
            </p>
          </div>
        )}

        {/* Patient Details Modal */}
        {showModal && selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-medium text-gray-900">Patient Details</h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Patient Info */}
                  <div className="lg:col-span-1">
                    <div className="bg-gray-50 rounded-lg p-6">
                      <div className="text-center mb-4">
                        {selectedPatient.profileImage ? (
                          <img
                            src={selectedPatient.profileImage}
                            alt={selectedPatient.name}
                            className="h-24 w-24 rounded-full object-cover mx-auto"
                          />
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mx-auto">
                            <UserIcon className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        <h4 className="text-lg font-semibold text-gray-900 mt-2">
                          {selectedPatient.name}
                        </h4>
                        <p className="text-gray-600">{selectedPatient.email}</p>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Age</label>
                          <p className="text-gray-900">{selectedPatient.age || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Gender</label>
                          <p className="text-gray-900 capitalize">{selectedPatient.gender || 'Not specified'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Phone</label>
                          <p className="text-gray-900">{selectedPatient.phone || 'Not provided'}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Blood Group</label>
                          <p className="text-gray-900">{selectedPatient.bloodGroup || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Medical History & Appointments */}
                  <div className="lg:col-span-2">
                    <div className="space-y-6">
                      {/* Recent Appointments */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Recent Appointments</h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedPatient.appointments?.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPatient.appointments.slice(0, 5).map((appointment, index) => (
                                <div key={index} className="flex justify-between items-center p-3 bg-white rounded border">
                                  <div>
                                    <p className="font-medium">{formatDate(appointment.date)}</p>
                                    <p className="text-sm text-gray-600">{appointment.symptoms}</p>
                                  </div>
                                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800">
                                    {appointment.status}
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No appointments yet</p>
                          )}
                        </div>
                      </div>

                      {/* Medical Records */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Medical Records</h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedPatient.medicalHistory ? (
                            <p className="text-gray-700">{selectedPatient.medicalHistory}</p>
                          ) : (
                            <p className="text-gray-500">No medical history recorded</p>
                          )}
                        </div>
                      </div>

                      {/* Prescriptions */}
                      <div>
                        <h5 className="text-lg font-semibold text-gray-900 mb-3">Recent Prescriptions</h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                          {selectedPatient.prescriptions?.length > 0 ? (
                            <div className="space-y-3">
                              {selectedPatient.prescriptions.slice(0, 3).map((prescription, index) => (
                                <div key={index} className="p-3 bg-white rounded border">
                                  <p className="font-medium text-sm text-gray-600">
                                    {formatDate(prescription.date)}
                                  </p>
                                  <p className="text-gray-900">{prescription.medications}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-center py-4">No prescriptions yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      setShowPrescriptionModal(true);
                      setShowModal(false);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                  >
                    Add Prescription
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Prescription Modal */}
        {showPrescriptionModal && selectedPatient && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-1/2 lg:w-1/3 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Add Prescription</h3>
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <p className="text-sm text-gray-600 mb-4">
                  Adding prescription for: <span className="font-medium">{selectedPatient.name}</span>
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medications *
                    </label>
                    <textarea
                      value={prescription.medications}
                      onChange={(e) => setPrescription({ ...prescription, medications: e.target.value })}
                      rows={3}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="List medications with dosage and frequency..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instructions
                    </label>
                    <textarea
                      value={prescription.instructions}
                      onChange={(e) => setPrescription({ ...prescription, instructions: e.target.value })}
                      rows={2}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Special instructions for the patient..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Follow-up
                    </label>
                    <input
                      type="text"
                      value={prescription.followUp}
                      onChange={(e) => setPrescription({ ...prescription, followUp: e.target.value })}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="e.g., 'Return in 2 weeks'"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      value={prescription.notes}
                      onChange={(e) => setPrescription({ ...prescription, notes: e.target.value })}
                      rows={2}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                      placeholder="Any additional notes..."
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => setShowPrescriptionModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addPrescription}
                    disabled={!prescription.medications}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:bg-gray-400"
                  >
                    Add Prescription
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

export default PatientManagement;
