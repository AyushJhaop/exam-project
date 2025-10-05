import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusIcon, 
  UserGroupIcon, 
  ClipboardDocumentListIcon,
  FunnelIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import LeadCaptureModal from '../../components/LeadCaptureModal';
import LeadFollowUpDashboard from '../../components/LeadFollowUpDashboard';

const LeadManagementPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCaptureModal, setShowCaptureModal] = useState(false);
  const [captureType, setCaptureType] = useState('patient');

  const tabs = [
    { id: 'dashboard', name: 'Follow-up Dashboard', icon: ChartBarIcon },
    { id: 'capture', name: 'Lead Capture', icon: PlusIcon },
    { id: 'analytics', name: 'Analytics', icon: FunnelIcon }
  ];

  const handleNewLead = (type) => {
    setCaptureType(type);
    setShowCaptureModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Management</h1>
          <p className="text-gray-600 mt-2">
            Capture, qualify, and convert potential patients and doctors
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <button
            onClick={() => handleNewLead('patient')}
            className="bg-indigo-600 text-white p-6 rounded-xl hover:bg-indigo-700 transition-colors group flex items-center space-x-4"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <UserGroupIcon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Add Patient Lead</div>
              <div className="text-indigo-200 text-sm">Capture potential patient information</div>
            </div>
          </button>

          <button
            onClick={() => handleNewLead('doctor')}
            className="bg-green-600 text-white p-6 rounded-xl hover:bg-green-700 transition-colors group flex items-center space-x-4"
          >
            <div className="bg-white bg-opacity-20 p-3 rounded-lg">
              <ClipboardDocumentListIcon className="w-8 h-8" />
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Add Doctor Lead</div>
              <div className="text-green-200 text-sm">Recruit medical professionals</div>
            </div>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'dashboard' && (
            <LeadFollowUpDashboard />
          )}

          {activeTab === 'capture' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Capture Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Patient Leads</h3>
                  <p className="text-gray-600 mb-4">
                    Capture potential patients who are looking for healthcare services.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Auto-prioritized by medical condition urgency
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Smart follow-up scheduling
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
                      Direct conversion to patient registration
                    </div>
                  </div>

                  <button
                    onClick={() => handleNewLead('patient')}
                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                  >
                    Capture Patient Lead
                  </button>
                </div>

                <div className="border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Leads</h3>
                  <p className="text-gray-600 mb-4">
                    Recruit medical professionals to join your telemedicine platform.
                  </p>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Prioritized by specialty demand
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Qualification-based scoring
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full mr-3"></span>
                      Streamlined onboarding process
                    </div>
                  </div>

                  <button
                    onClick={() => handleNewLead('doctor')}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Capture Doctor Lead
                  </button>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">💡 Lead Capture Best Practices</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Capture leads at strategic points: exit intent, form abandonment, after viewing multiple doctors</li>
                  <li>• Use urgency indicators in medical conditions to prioritize patient leads</li>
                  <li>• Follow up with high-priority leads within 30 minutes</li>
                  <li>• Track conversion rates and optimize your lead sources</li>
                  <li>• Personalize follow-up messages based on lead type and priority</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Lead Analytics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                  <div className="text-2xl font-bold">85%</div>
                  <div className="text-blue-100">Lead Response Rate</div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
                  <div className="text-2xl font-bold">42%</div>
                  <div className="text-green-100">Conversion Rate</div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                  <div className="text-2xl font-bold">2.3h</div>
                  <div className="text-purple-100">Avg Follow-up Time</div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Sources Performance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Website Forms</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">124 leads</span>
                        <span className="text-sm font-medium text-green-600">58% conversion</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Referrals</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">67 leads</span>
                        <span className="text-sm font-medium text-green-600">73% conversion</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Social Media</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-600">89 leads</span>
                        <span className="text-sm font-medium text-yellow-600">34% conversion</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Quality Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600">High Priority Leads</div>
                      <div className="text-2xl font-bold text-red-600">23</div>
                      <div className="text-xs text-gray-500">Require immediate attention</div>
                    </div>
                    <div className="p-4 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600">Average Lead Score</div>
                      <div className="text-2xl font-bold text-blue-600">7.2</div>
                      <div className="text-xs text-gray-500">Out of 10 maximum</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Lead Capture Modal */}
      <LeadCaptureModal
        isOpen={showCaptureModal}
        onClose={() => setShowCaptureModal(false)}
        leadType={captureType}
      />
    </div>
  );
};

export default LeadManagementPage;
