import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  HeartIcon, 
  UserGroupIcon, 
  ClockIcon, 
  ShieldCheckIcon,
  CalendarIcon,
  VideoCameraIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();
  const [leadForm, setLeadForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    leadType: 'patient',
    specialization: '',
    medicalCondition: '',
    source: 'website'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState({
    totalDoctors: 150,
    totalPatients: 5000,
    completedAppointments: 12000,
    averageRating: 4.8
  });

  // Simulated real-time stats update
  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        totalPatients: prev.totalPatients + Math.floor(Math.random() * 3),
        completedAppointments: prev.completedAppointments + Math.floor(Math.random() * 2)
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleLeadSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/leads', leadForm);
      if (response.data.success) {
        toast.success('Thank you for your interest! We will contact you soon.');
        setLeadForm({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          leadType: 'patient',
          specialization: '',
          medicalCondition: '',
          source: 'website'
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: VideoCameraIcon,
      title: 'Video Consultations',
      description: 'Connect with certified doctors through secure video calls from the comfort of your home.'
    },
    {
      icon: CalendarIcon,
      title: 'Easy Scheduling',
      description: 'Book appointments instantly with our intelligent matching system that finds the best available doctors.'
    },
    {
      icon: DocumentTextIcon,
      title: 'Digital Prescriptions',
      description: 'Get digital prescriptions and medical records that are securely stored and easily accessible.'
    },
    {
      icon: ShieldCheckIcon,
      title: 'Secure & Private',
      description: 'Your medical data is protected with enterprise-grade security and HIPAA compliance.'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Patient',
      rating: 5,
      comment: 'Sehat Mitra made it so easy to connect with a specialist. The video consultation was clear and professional.'
    },
    {
      name: 'Dr. Rajesh Kumar',
      role: 'Cardiologist',
      rating: 5,
      comment: 'The platform helps me manage my practice efficiently and reach more patients who need care.'
    },
    {
      name: 'Maria Garcia',
      role: 'Patient',
      rating: 5,
      comment: 'Excellent service! I got the care I needed without having to travel. Highly recommended.'
    }
  ];

  const specializations = [
    'General Medicine',
    'Cardiology',
    'Dermatology',
    'Pediatrics',
    'Orthopedics',
    'Psychiatry',
    'Gynecology',
    'Neurology'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-indigo-50 via-white to-cyan-50 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(156, 146, 172, 0.05) 1px, transparent 0)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Your Health,
                <span className="text-indigo-600"> Our Priority</span>
              </h1>
              <p className="mt-6 text-xl text-gray-600 leading-relaxed">
                Connect with certified healthcare professionals through our advanced telemedicine platform. 
                Get quality medical care from anywhere, anytime.
              </p>
              
              {/* Statistics */}
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">{stats.totalDoctors.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Certified Doctors</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">{stats.totalPatients.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Happy Patients</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">{stats.completedAppointments.toLocaleString()}+</div>
                  <div className="text-sm text-gray-600">Consultations</div>
                </div>
                <div className="text-center p-4 bg-white rounded-lg shadow-sm border border-gray-100">
                  <div className="text-2xl font-bold text-indigo-600">{stats.averageRating}★</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {isAuthenticated ? (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      to="/register"
                      className="inline-flex items-center justify-center px-8 py-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      to="/search-doctors"
                      className="inline-flex items-center justify-center px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-xl hover:bg-indigo-50 transition-colors"
                    >
                      Find Doctors
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Lead Generation Form */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="text-center mb-6">
                <HeartIcon className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900">Book a Free Consultation</h3>
                <p className="text-gray-600 mt-2">Get started with personalized healthcare today</p>
              </div>

              <form onSubmit={handleLeadSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    value={leadForm.firstName}
                    onChange={(e) => setLeadForm({...leadForm, firstName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={leadForm.lastName}
                    onChange={(e) => setLeadForm({...leadForm, lastName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    required
                  />
                </div>

                <input
                  type="email"
                  placeholder="Email Address"
                  value={leadForm.email}
                  onChange={(e) => setLeadForm({...leadForm, email: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  required
                />

                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={leadForm.phone}
                  onChange={(e) => setLeadForm({...leadForm, phone: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  required
                />

                <select
                  value={leadForm.leadType}
                  onChange={(e) => setLeadForm({...leadForm, leadType: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                >
                  <option value="patient">I am a Patient</option>
                  <option value="doctor">I am a Doctor</option>
                </select>

                {leadForm.leadType === 'doctor' && (
                  <select
                    value={leadForm.specialization}
                    onChange={(e) => setLeadForm({...leadForm, specialization: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                    required
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                )}

                {leadForm.leadType === 'patient' && (
                  <input
                    type="text"
                    placeholder="What brings you here? (e.g., headache, check-up)"
                    value={leadForm.medicalCondition}
                    onChange={(e) => setLeadForm({...leadForm, medicalCondition: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors"
                  />
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Book Free Consultation'}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  By submitting, you agree to our terms and privacy policy
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Sehat Mitra?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform combines cutting-edge technology with compassionate care to deliver 
              the best telemedicine experience.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-xl bg-gray-50 hover:bg-indigo-50 transition-colors group">
                <feature.icon className="w-12 h-12 text-indigo-600 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real experiences from real people who trust us with their health
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 italic">"{testimonial.comment}"</p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-indigo-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Healthcare Experience?
          </h2>
          <p className="text-xl text-indigo-100 mb-8">
            Join thousands of patients and doctors who trust Sehat Mitra for their healthcare needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-indigo-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors shadow-lg hover:shadow-xl"
            >
              Start Your Journey
            </Link>
            <Link
              to="/search-doctors"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white hover:text-indigo-600 transition-colors"
            >
              Browse Doctors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
