import { useState, useEffect } from 'react';
import { 
  PhoneIcon, 
  EnvelopeIcon, 
  CalendarIcon,
  UserPlusIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import * as apiServices from '../services/apiServices';

const leadService = apiServices.leadService;

const LeadFollowUpDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({});
  const [followUpAction, setFollowUpAction] = useState({
    leadId: null,
    type: '',
    notes: '',
    nextFollowUp: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll({ 
        stage: 'prospect', 
        sortBy: 'priority',
        sortOrder: 'desc' 
      });
      setLeads(response.leads || []);
    } catch (error) {
      toast.error('Failed to fetch leads');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await leadService.getStats();
      setStats(response.stats || {});
    } catch (error) {
      console.error('Error fetching lead stats:', error);
    }
  };

  const handleFollowUpAction = async (leadId, actionType) => {
    try {
      const action = {
        type: actionType,
        date: new Date(),
        outcome: '',
        nextFollowUp: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
      };

      await leadService.addInteraction(leadId, action);
      toast.success(`${actionType} logged successfully`);
      fetchLeads();
    } catch (error) {
      toast.error('Failed to log interaction');
    }
  };

  const convertLead = async (leadId, leadType) => {
    try {
      await leadService.convertLead(leadId);
      toast.success('Lead converted successfully!');
      
      // Redirect to registration with pre-filled data
      const lead = leads.find(l => l._id === leadId);
      if (lead) {
        const registrationUrl = `/register?prefill=true&firstName=${lead.firstName}&lastName=${lead.lastName}&email=${lead.email}&phone=${lead.phone}&role=${lead.leadType}`;
        window.open(registrationUrl, '_blank');
      }
      
      fetchLeads();
    } catch (error) {
      toast.error('Failed to convert lead');
    }
  };

  const getPriorityColor = (priority) => {
    if (priority >= 8) return 'bg-red-100 text-red-800';
    if (priority >= 6) return 'bg-yellow-100 text-yellow-800';
    if (priority >= 4) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getTimeSinceCreated = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffHours = Math.floor((now - created) / (1000 * 60 * 60));
    
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Lead Follow-up Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <UserPlusIcon className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">New Leads Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.todayLeads || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <ClockIcon className="h-8 w-8 text-yellow-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Follow-up</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingFollowUp || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <TrendingUpIcon className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.conversionRate || 0}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.monthlyLeads || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Leads List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">High Priority Leads</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
          ) : (
            <div className="divide-y">
              {leads.slice(0, 10).map((lead) => (
                <div key={lead._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900">
                          {lead.firstName} {lead.lastName}
                        </h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                          Priority {lead.priority}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          {lead.leadType}
                        </span>
                      </div>
                      
                      <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                        <span>📧 {lead.email}</span>
                        <span>📱 {lead.phone}</span>
                        {lead.leadType === 'doctor' && lead.specialization && (
                          <span>🏥 {lead.specialization}</span>
                        )}
                        {lead.leadType === 'patient' && lead.medicalCondition && (
                          <span>💊 {lead.medicalCondition}</span>
                        )}
                      </div>
                      
                      <div className="mt-2 text-sm text-gray-500">
                        Created {getTimeSinceCreated(lead.createdAt)} • Source: {lead.source}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFollowUpAction(lead._id, 'call')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        Call
                      </button>
                      
                      <button
                        onClick={() => handleFollowUpAction(lead._id, 'email')}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <EnvelopeIcon className="h-4 w-4 mr-2" />
                        Email
                      </button>

                      <button
                        onClick={() => convertLead(lead._id, lead.leadType)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Convert
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeadFollowUpDashboard;
