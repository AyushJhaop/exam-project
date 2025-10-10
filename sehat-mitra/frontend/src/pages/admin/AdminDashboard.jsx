import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BellIcon,
  ArrowUpIcon,
  ArrowDownIcon,
} from '@heroicons/react/24/outline';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    stats: {},
    appointments: [],
    revenue: [],
    userGrowth: [],
    leadStats: {},
    npsData: {},
    loading: true,
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      console.log('Fetching admin dashboard data...');
      const response = await api.get('/dashboard/overview');
      console.log('Dashboard data received:', response.data);
      
      if (response.data && response.data.success) {
        const { overview } = response.data;
        setDashboardData({
          stats: {
            totalUsers: overview.users?.total || 0,
            totalPatients: overview.users?.patients || 0,
            totalDoctors: overview.users?.doctors || 0,
            totalAppointments: overview.appointments?.total || 0,
            completedAppointments: overview.appointments?.completed || 0,
            totalRevenue: overview.revenue?.total || 0,
            totalLeads: overview.leads?.total || 0,
            conversionRate: overview.leads?.conversionRate || 0,
          },
          appointments: [],
          revenue: [],
          userGrowth: [],
          leadStats: {
            total: overview.leads?.total || 0,
            converted: overview.leads?.converted || 0,
            conversionRate: overview.leads?.conversionRate || 0,
          },
          npsData: {},
          loading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching admin dashboard data:', error);
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  const statCards = [
    {
      name: 'Total Users',
      value: dashboardData.stats.totalUsers || 0,
      change: '+12%',
      changeType: 'positive',
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Doctors',
      value: dashboardData.stats.totalDoctors || 0,
      change: '+8%',
      changeType: 'positive',
      icon: AcademicCapIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Total Appointments',
      value: dashboardData.stats.totalAppointments || 0,
      change: '+23%',
      changeType: 'positive',
      icon: CalendarIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'Monthly Revenue',
      value: `₹${dashboardData.stats.monthlyRevenue?.toLocaleString() || 0}`,
      change: '+15%',
      changeType: 'positive',
      icon: CurrencyDollarIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Active Leads',
      value: dashboardData.leadStats.total || 0,
      change: '+5%',
      changeType: 'positive',
      icon: UserGroupIcon,
      color: 'bg-indigo-500',
    },
    {
      name: 'NPS Score',
      value: dashboardData.npsData.score || 0,
      change: '+2 pts',
      changeType: 'positive',
      icon: ChartBarIcon,
      color: 'bg-pink-500',
    },
  ];

  const quickActions = [
    {
      name: 'Business Analytics',
      description: 'View detailed business metrics',
      href: '/admin/business',
      icon: ChartBarIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Lead Management',
      description: 'Manage and track leads',
      href: '/admin/leads',
      icon: UserGroupIcon,
      color: 'bg-green-500',
    },
    {
      name: 'User Management',
      description: 'Manage users and permissions',
      href: '/admin/users',
      icon: UsersIcon,
      color: 'bg-purple-500',
    },
    {
      name: 'System Settings',
      description: 'Configure system settings',
      href: '/admin/settings',
      icon: BellIcon,
      color: 'bg-yellow-500',
    },
  ];

  const pieData = [
    { name: 'Hot Leads', value: dashboardData.leadStats.hot || 0, color: '#ef4444' },
    { name: 'Warm Leads', value: dashboardData.leadStats.warm || 0, color: '#f97316' },
    { name: 'Cold Leads', value: dashboardData.leadStats.cold || 0, color: '#3b82f6' },
  ];

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.name}! Here's your business overview.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat) => (
            <div key={stat.name} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} rounded-lg p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                  <div className="flex items-center">
                    <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    <div className={`ml-2 flex items-center text-sm ${
                      stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {stat.changeType === 'positive' ? (
                        <ArrowUpIcon className="h-4 w-4" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4" />
                      )}
                      <span className="ml-1">{stat.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']} />
                <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Lead Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Growth Chart */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dashboardData.userGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="patients" stackId="a" fill="#3b82f6" />
              <Bar dataKey="doctors" stackId="a" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="group relative bg-gray-50 rounded-lg p-6 hover:bg-gray-100 transition-colors"
              >
                <div>
                  <span className={`${action.color} rounded-lg inline-flex p-3 ring-4 ring-white`}>
                    <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
                  </span>
                </div>
                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-gray-600">
                    <span className="absolute inset-0" aria-hidden="true" />
                    {action.name}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">{action.description}</p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="m11.293 17.293 1.414 1.414L19.414 12l-6.707-6.707-1.414 1.414L15.586 11H6v2h9.586l-4.293 4.293z" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
