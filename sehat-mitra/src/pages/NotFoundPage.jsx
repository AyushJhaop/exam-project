import { Link } from 'react-router-dom';
import { HomeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        {/* 404 Illustration */}
        <div className="mb-8">
          <svg
            className="mx-auto h-32 w-32 text-indigo-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.071-2.33"
            />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300 mb-4">404</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Page Not Found</h2>
          <p className="text-lg text-gray-600 mb-8">
            Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <HomeIcon className="h-5 w-5 mr-2" />
            Go to Homepage
          </Link>
          
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Go Back
          </button>
        </div>

        {/* Helpful Links */}
        <div className="mt-12">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Maybe you're looking for:</h3>
          <div className="space-y-2">
            <Link
              to="/search-doctors"
              className="block text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Find Doctors
            </Link>
            <Link
              to="/book-appointment"
              className="block text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Book an Appointment
            </Link>
            <Link
              to="/my-appointments"
              className="block text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              My Appointments
            </Link>
            <Link
              to="/dashboard"
              className="block text-indigo-600 hover:text-indigo-800 transition-colors duration-200"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {/* Support Information */}
        <div className="mt-12 text-sm text-gray-500">
          <p>
            Need help? Contact our support team at{' '}
            <a 
              href="mailto:support@sehatmitra.com" 
              className="text-indigo-600 hover:text-indigo-800"
            >
              support@sehatmitra.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
