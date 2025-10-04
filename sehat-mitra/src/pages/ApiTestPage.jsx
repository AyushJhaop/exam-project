import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  doctorService, 
  patientService, 
  leadService, 
  dashboardService 
} from '../services/apiServices';
import toast from 'react-hot-toast';

const ApiTestPage = () => {
  const { user, isAuthenticated } = useAuth();
  const [testResults, setTestResults] = useState({});
  const [loading, setLoading] = useState(false);

  const runApiTests = async () => {
    setLoading(true);
    const results = {};

    try {
      // Test auth verification
      console.log('Testing API connections...');
      
      if (isAuthenticated && user) {
        if (user.role === 'doctor') {
          // Test doctor APIs
          try {
            const profile = await doctorService.getProfile();
            results.doctorProfile = { success: true, data: profile };
          } catch (error) {
            results.doctorProfile = { success: false, error: error.message };
          }

          try {
            const schedule = await doctorService.getSchedule(new Date().toISOString().split('T')[0]);
            results.doctorSchedule = { success: true, data: schedule };
          } catch (error) {
            results.doctorSchedule = { success: false, error: error.message };
          }

          try {
            const dashboard = await doctorService.getDashboardStats();
            results.doctorDashboard = { success: true, data: dashboard };
          } catch (error) {
            results.doctorDashboard = { success: false, error: error.message };
          }
        }

        if (user.role === 'patient') {
          // Test patient APIs
          try {
            const profile = await patientService.getProfile();
            results.patientProfile = { success: true, data: profile };
          } catch (error) {
            results.patientProfile = { success: false, error: error.message };
          }

          try {
            const appointments = await patientService.getAppointments();
            results.patientAppointments = { success: true, data: appointments };
          } catch (error) {
            results.patientAppointments = { success: false, error: error.message };
          }

          try {
            const doctors = await patientService.searchDoctors({});
            results.doctorSearch = { success: true, data: doctors };
          } catch (error) {
            results.doctorSearch = { success: false, error: error.message };
          }
        }

        if (user.role === 'admin') {
          // Test admin APIs
          try {
            const leads = await leadService.getAll({});
            results.leads = { success: true, data: leads };
          } catch (error) {
            results.leads = { success: false, error: error.message };
          }

          try {
            const business = await dashboardService.getBusinessMetrics();
            results.businessMetrics = { success: true, data: business };
          } catch (error) {
            results.businessMetrics = { success: false, error: error.message };
          }
        }
      }

      setTestResults(results);
      toast.success('API tests completed!');
    } catch (error) {
      console.error('API test error:', error);
      toast.error('API test failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">API Connection Test</h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page tests the connection between frontend and backend APIs.
            </p>
            
            {isAuthenticated ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <h3 className="text-green-800 font-medium">Authentication Status: ✅ Authenticated</h3>
                <p className="text-green-700">User: {user?.firstName} {user?.lastName} ({user?.role})</p>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <h3 className="text-red-800 font-medium">Authentication Status: ❌ Not Authenticated</h3>
                <p className="text-red-700">Please log in to test role-specific APIs</p>
              </div>
            )}

            <button
              onClick={runApiTests}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Testing APIs...' : 'Run API Tests'}
            </button>
          </div>

          {Object.keys(testResults).length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-900">Test Results</h2>
              
              {Object.entries(testResults).map(([testName, result]) => (
                <div
                  key={testName}
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className={`font-medium ${
                      result.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testName} {result.success ? '✅' : '❌'}
                    </h3>
                  </div>
                  
                  {result.success ? (
                    <div className="text-green-700 text-sm">
                      <p>✓ API call successful</p>
                      {result.data && (
                        <pre className="mt-2 p-2 bg-green-100 rounded text-xs overflow-x-auto">
                          {JSON.stringify(result.data, null, 2).substring(0, 200)}...
                        </pre>
                      )}
                    </div>
                  ) : (
                    <div className="text-red-700 text-sm">
                      <p>✗ Error: {result.error}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiTestPage;
