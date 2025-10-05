import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  StarIcon,
  ClockIcon,
  MapPinIcon,
  UserIcon,
  AcademicCapIcon,
  HeartIcon,
  FunnelIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import LeadCaptureModal from '../../components/LeadCaptureModal';

const DoctorSearch = () => {
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [filters, setFilters] = useState({
    specialty: '',
    location: '',
    experience: '',
    rating: '',
    availability: '',
    gender: '',
    language: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('rating');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState(new Set());
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetchDoctors();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [doctors, filters, searchQuery, sortBy, sortOrder]);

  const fetchDoctors = async () => {
    try {
      const response = await api.get('/appointments/search-doctors');
      setDoctors(response.data.doctors);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFavorites = async () => {
    try {
      const response = await api.get('/patients/favorites');
      setFavorites(new Set(response.data.favorites));
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const toggleFavorite = async (doctorId) => {
    try {
      if (favorites.has(doctorId)) {
        await api.delete(`/patients/favorites/${doctorId}`);
        setFavorites(prev => {
          const newSet = new Set(prev);
          newSet.delete(doctorId);
          return newSet;
        });
      } else {
        await api.post(`/patients/favorites/${doctorId}`);
        setFavorites(prev => new Set([...prev, doctorId]));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...doctors];

    // Apply text search
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply filters
    if (filters.specialty) {
      filtered = filtered.filter(doctor => doctor.specialty === filters.specialty);
    }
    if (filters.location) {
      filtered = filtered.filter(doctor =>
        doctor.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }
    if (filters.experience) {
      const [min, max] = filters.experience.split('-').map(x => parseInt(x));
      filtered = filtered.filter(doctor => {
        const exp = doctor.experience;
        if (max) return exp >= min && exp <= max;
        return exp >= min;
      });
    }
    if (filters.rating) {
      const minRating = parseFloat(filters.rating);
      filtered = filtered.filter(doctor => doctor.rating >= minRating);
    }
    if (filters.gender) {
      filtered = filtered.filter(doctor => doctor.gender === filters.gender);
    }
    if (filters.availability) {
      // Filter by availability (this would need to be implemented in the backend)
      filtered = filtered.filter(doctor => doctor.availability?.includes(filters.availability));
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'experience':
          aValue = a.experience;
          bValue = b.experience;
          break;
        case 'fee':
          aValue = a.consultationFee;
          bValue = b.consultationFee;
          break;
        default:
          aValue = a.rating;
          bValue = b.rating;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredDoctors(filtered);
  };

  const clearFilters = () => {
    setFilters({
      specialty: '',
      location: '',
      experience: '',
      rating: '',
      availability: '',
      gender: '',
      language: '',
    });
    setSearchQuery('');
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

  const specialties = [
    'cardiology', 'dermatology', 'neurology', 'orthopedics',
    'pediatrics', 'psychiatry', 'general', 'gynecology',
    'ophthalmology', 'dentistry'
  ];

  const handleDoctorView = (doctor) => {
    setViewCount(prev => {
      const newCount = prev + 1;
      // Show lead capture after viewing 3 doctors without booking
      if (newCount >= 3) {
        setTimeout(() => setShowLeadModal(true), 2000);
      }
      return newCount;
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading doctors...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Doctors</h1>
          <p className="text-gray-600">Search and discover qualified healthcare professionals</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search doctors, specialties, or locations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              <FunnelIcon className="h-5 w-5 mr-2" />
              Filters
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specialty</label>
                  <select
                    value={filters.specialty}
                    onChange={(e) => setFilters({ ...filters, specialty: e.target.value })}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">All Specialties</option>
                    {specialties.map(specialty => (
                      <option key={specialty} value={specialty}>
                        {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={filters.location}
                    onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                    placeholder="City or area"
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience</label>
                  <select
                    value={filters.experience}
                    onChange={(e) => setFilters({ ...filters, experience: e.target.value })}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Any Experience</option>
                    <option value="0-5">0-5 years</option>
                    <option value="5-10">5-10 years</option>
                    <option value="10-20">10-20 years</option>
                    <option value="20">20+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <select
                    value={filters.rating}
                    onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Any Rating</option>
                    <option value="3">3+ Stars</option>
                    <option value="4">4+ Stars</option>
                    <option value="4.5">4.5+ Stars</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Any Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                  <select
                    value={filters.availability}
                    onChange={(e) => setFilters({ ...filters, availability: e.target.value })}
                    className="w-full rounded-md border-gray-300 text-sm focus:border-indigo-500 focus:ring-indigo-500"
                  >
                    <option value="">Any Time</option>
                    <option value="today">Available Today</option>
                    <option value="tomorrow">Available Tomorrow</option>
                    <option value="week">This Week</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results */}
          <div className="flex-1">
            {/* Sort and Results Count */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600">
                Showing {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''}
              </p>
              <div className="flex items-center space-x-4">
                <label className="text-sm text-gray-600">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="text-sm border-gray-300 rounded-md focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="rating">Rating</option>
                  <option value="experience">Experience</option>
                  <option value="fee">Consultation Fee</option>
                  <option value="name">Name</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="text-gray-600 hover:text-gray-800"
                >
                  {sortOrder === 'asc' ? (
                    <ArrowUpIcon className="h-4 w-4" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Doctor Cards */}
            <div className="space-y-6">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor._id}
                  className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                  onClick={() => handleDoctorView(doctor)}
                >
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Doctor Image */}
                    <div className="flex-shrink-0">
                      {doctor.profileImage ? (
                        <img
                          src={doctor.profileImage}
                          alt={doctor.name}
                          className="h-32 w-32 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="h-32 w-32 rounded-lg bg-gray-200 flex items-center justify-center">
                          <UserIcon className="h-16 w-16 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Doctor Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{doctor.name}</h3>
                          <p className="text-indigo-600 capitalize font-medium">{doctor.specialty}</p>
                          <div className="mt-2">
                            {renderStarRating(doctor.rating)}
                          </div>
                        </div>
                        <button
                          onClick={() => toggleFavorite(doctor._id)}
                          className={`p-2 rounded-full ${
                            favorites.has(doctor._id)
                              ? 'text-red-500 bg-red-50'
                              : 'text-gray-400 bg-gray-50'
                          } hover:bg-red-100`}
                        >
                          <HeartIcon className={`h-5 w-5 ${favorites.has(doctor._id) ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <ClockIcon className="h-4 w-4 mr-2" />
                          {doctor.experience}+ years
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPinIcon className="h-4 w-4 mr-2" />
                          {doctor.location}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <AcademicCapIcon className="h-4 w-4 mr-2" />
                          {doctor.qualification}
                        </div>
                        <div className="text-sm text-gray-600">
                          Languages: {doctor.languages?.join(', ') || 'English'}
                        </div>
                      </div>

                      {doctor.bio && (
                        <p className="mt-3 text-gray-600 text-sm line-clamp-2">{doctor.bio}</p>
                      )}

                      <div className="mt-4 flex items-center justify-between">
                        <div className="text-2xl font-bold text-green-600">
                          ₹{doctor.consultationFee}
                          <span className="text-sm font-normal text-gray-500"> /consultation</span>
                        </div>
                        <div className="flex space-x-3">
                          <button className="px-4 py-2 text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50">
                            View Profile
                          </button>
                          <Link
                            to="/book-appointment"
                            state={{ selectedDoctor: doctor }}
                            className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                          >
                            Book Appointment
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <UserIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">
                  Try adjusting your filters or search query to find more doctors.
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-indigo-600 hover:text-indigo-800"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/book-appointment"
                  className="block w-full px-4 py-2 bg-indigo-600 text-white rounded-md text-center hover:bg-indigo-700"
                >
                  Book Appointment
                </Link>
                <Link
                  to="/my-appointments"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-center hover:bg-gray-50"
                >
                  My Appointments
                </Link>
              </div>
            </div>

            {/* Popular Specialties */}
            <div className="bg-white rounded-lg shadow p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Specialties</h3>
              <div className="space-y-2">
                {specialties.slice(0, 8).map((specialty) => (
                  <button
                    key={specialty}
                    onClick={() => setFilters({ ...filters, specialty })}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
                  >
                    {specialty.charAt(0).toUpperCase() + specialty.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        leadType="patient"
      />
    </div>
  );
};

export default DoctorSearch;
