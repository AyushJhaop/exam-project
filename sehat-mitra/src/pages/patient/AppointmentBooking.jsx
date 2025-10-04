import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar } from 'react-calendar';
import { 
  MagnifyingGlassIcon, 
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { toast } from 'react-hot-toast';
import { patientService } from '../../services/apiServices';
import 'react-calendar/dist/Calendar.css';

const AppointmentBooking = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Search, 2: Select Doctor, 3: Select Time, 4: Confirm
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [searchFilters, setSearchFilters] = useState({
    specialty: '',
    location: '',
    experience: '',
    rating: '',
  });
  const [appointmentDetails, setAppointmentDetails] = useState({
    symptoms: '',
    urgency: 'routine',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (step === 2) {
      searchDoctors();
    }
  }, [step, searchFilters]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableSlots();
    }
  }, [selectedDoctor, selectedDate]);

  const searchDoctors = async () => {
    setLoading(true);
    try {
      const response = await patientService.searchDoctors(searchFilters);
      setDoctors(response.doctors);
    } catch (error) {
      console.error('Error searching doctors:', error);
      toast.error('Failed to search doctors');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableSlots = async () => {
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const response = await patientService.getDoctorAvailability(selectedDoctor._id, dateStr);
      setAvailableSlots(response.slots || []);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      toast.error('Failed to fetch available slots');
    }
  };

  const bookAppointment = async () => {
    setLoading(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor._id,
        date: selectedDate.toISOString().split('T')[0],
        time: selectedTime,
        symptoms: appointmentDetails.symptoms,
        urgency: appointmentDetails.urgency,
        notes: appointmentDetails.notes,
      };

      const response = await patientService.bookAppointment(appointmentData);
      toast.success('Appointment booked successfully!');
      navigate('/my-appointments');
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to book appointment');
    } finally {
      setLoading(false);
    }
  };

  const renderStarRating = (rating) => {
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star}>
            {star <= rating ? (
              <StarIconSolid className="h-4 w-4 text-yellow-400" />
            ) : (
              <StarIcon className="h-4 w-4 text-gray-300" />
            )}
          </div>
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating})</span>
      </div>
    );
  };

  const renderSearchStep = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Doctor</h1>
        <p className="text-gray-600">Search and book appointments with qualified doctors</p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Specialty</label>
            <select
              value={searchFilters.specialty}
              onChange={(e) => setSearchFilters({ ...searchFilters, specialty: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="dermatology">Dermatology</option>
              <option value="neurology">Neurology</option>
              <option value="orthopedics">Orthopedics</option>
              <option value="pediatrics">Pediatrics</option>
              <option value="psychiatry">Psychiatry</option>
              <option value="general">General Medicine</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
            <input
              type="text"
              value={searchFilters.location}
              onChange={(e) => setSearchFilters({ ...searchFilters, location: e.target.value })}
              placeholder="City or area"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Experience</label>
            <select
              value={searchFilters.experience}
              onChange={(e) => setSearchFilters({ ...searchFilters, experience: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any Experience</option>
              <option value="1-5">1-5 years</option>
              <option value="5-10">5-10 years</option>
              <option value="10+">10+ years</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
            <select
              value={searchFilters.rating}
              onChange={(e) => setSearchFilters({ ...searchFilters, rating: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any Rating</option>
              <option value="4+">4+ Stars</option>
              <option value="4.5+">4.5+ Stars</option>
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setStep(2)}
            className="flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
          >
            <MagnifyingGlassIcon className="h-5 w-5 mr-2" />
            Search Doctors
          </button>
        </div>
      </div>
    </div>
  );

  const renderDoctorSelection = () => (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select a Doctor</h2>
        <button
          onClick={() => setStep(1)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Search
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {doctor.profileImage ? (
                    <img
                      src={doctor.profileImage}
                      alt={doctor.name}
                      className="h-16 w-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                      <UserIcon className="h-8 w-8 text-gray-600" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{doctor.name}</h3>
                  <p className="text-gray-600 capitalize">{doctor.specialty}</p>
                  <div className="mt-2">
                    {renderStarRating(doctor.rating)}
                  </div>
                  
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {doctor.experience} years experience
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      {doctor.location}
                    </div>
                  </div>
                  
                  <div className="mt-4 flex items-center justify-between">
                    <div className="text-lg font-semibold text-green-600">
                      ₹{doctor.consultationFee}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDoctor(doctor);
                        setStep(3);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                    >
                      Select Doctor
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderTimeSelection = () => (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Select Date & Time</h2>
        <button
          onClick={() => setStep(2)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Doctors
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Date</h3>
            <Calendar
              onChange={setSelectedDate}
              value={selectedDate}
              minDate={new Date()}
              className="w-full border-0 shadow-none"
            />
          </div>

          {/* Time Slots */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Time Slots</h3>
            <div className="grid grid-cols-2 gap-3">
              {availableSlots.map((slot) => (
                <button
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`p-3 text-sm font-medium rounded-md border ${
                    selectedTime === slot
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
            
            {selectedTime && (
              <div className="mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Continue to Booking Details
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderConfirmation = () => (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Confirm Appointment</h2>
        <button
          onClick={() => setStep(3)}
          className="text-indigo-600 hover:text-indigo-800"
        >
          ← Back to Time Selection
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Appointment Summary */}
        <div className="border-b pb-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Appointment Summary</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Doctor:</span>
              <span className="font-medium">{selectedDoctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Specialty:</span>
              <span className="font-medium capitalize">{selectedDoctor?.specialty}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{selectedDate.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-medium">{selectedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Consultation Fee:</span>
              <span className="font-medium text-green-600">₹{selectedDoctor?.consultationFee}</span>
            </div>
          </div>
        </div>

        {/* Additional Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symptoms/Reason for visit *
            </label>
            <textarea
              value={appointmentDetails.symptoms}
              onChange={(e) => setAppointmentDetails({ ...appointmentDetails, symptoms: e.target.value })}
              rows={3}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Describe your symptoms or reason for the consultation..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Urgency</label>
            <select
              value={appointmentDetails.urgency}
              onChange={(e) => setAppointmentDetails({ ...appointmentDetails, urgency: e.target.value })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="routine">Routine</option>
              <option value="urgent">Urgent</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Additional Notes (Optional)
            </label>
            <textarea
              value={appointmentDetails.notes}
              onChange={(e) => setAppointmentDetails({ ...appointmentDetails, notes: e.target.value })}
              rows={2}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Any additional information..."
            />
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={bookAppointment}
            disabled={!appointmentDetails.symptoms || loading}
            className="w-full flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Book Appointment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3, 4].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full ${
                    step >= stepNumber
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {stepNumber}
                </div>
                {stepNumber < 4 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      step > stepNumber ? 'bg-indigo-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2">
            <div className="text-sm text-gray-600 grid grid-cols-4 gap-8 text-center">
              <span>Search</span>
              <span>Select Doctor</span>
              <span>Choose Time</span>
              <span>Confirm</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 1 && renderSearchStep()}
        {step === 2 && renderDoctorSelection()}
        {step === 3 && renderTimeSelection()}
        {step === 4 && renderConfirmation()}
      </div>
    </div>
  );
};

export default AppointmentBooking;
