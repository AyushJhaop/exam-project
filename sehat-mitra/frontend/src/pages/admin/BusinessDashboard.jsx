import { useState, useEffect } from 'react';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  UserGroupIcon,
  HeartIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  ScatterChart,
  Scatter,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import { dashboardService } from '../../services/apiServices';

const BusinessDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({
    rfmSegments: [],
    clvData: [],
    npsData: {},
    cohortAnalysis: [],
    churnPrediction: [],
    revenueMetrics: {},
    customerJourney: [],
    loading: true,
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      const response = await dashboardService.getBusinessMetrics();
      setAnalyticsData({ ...response, loading: false });
    } catch (error) {
      console.error('Error fetching business analytics:', error);
      setAnalyticsData(prev => ({ ...prev, loading: false }));
    }
  };

  const kpiCards = [
    {
      title: 'Average CLV',
      value: `₹${analyticsData.revenueMetrics.avgCLV?.toLocaleString() || 0}`,
      change: '+18%',
      trend: 'up',
      icon: CurrencyDollarIcon,
      color: 'bg-green-500',
    },
    {
      title: 'NPS Score',
      value: analyticsData.npsData.score || 0,
      change: '+5 pts',
      trend: 'up',
      icon: StarIcon,
      color: 'bg-blue-500',
    },
    {
      title: 'Churn Rate',
      value: `${analyticsData.revenueMetrics.churnRate || 0}%`,
      change: '-2.3%',
      trend: 'down',
      icon: UserGroupIcon,
      color: 'bg-red-500',
    },
    {
      title: 'Customer Satisfaction',
      value: `${analyticsData.revenueMetrics.satisfaction || 0}%`,
      change: '+4.2%',
      trend: 'up',
      icon: HeartIcon,
      color: 'bg-pink-500',
    },
  ];

  const rfmColors = {
    'Champions': '#10b981',
    'Loyal Customers': '#3b82f6',
    'Potential Loyalists': '#8b5cf6',
    'New Customers': '#06b6d4',
    'Promising': '#f59e0b',
    'Need Attention': '#ef4444',
    'About to Sleep': '#6b7280',
    'At Risk': '#dc2626',
    'Cannot Lose Them': '#7c2d12',
    'Hibernating': '#374151',
  };

  const npsSegmentColors = ['#ef4444', '#f59e0b', '#10b981']; // Detractors, Passives, Promoters

  if (analyticsData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700">Loading Business Analytics...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Business Intelligence Dashboard</h1>
          <p className="text-gray-600">Advanced analytics for data-driven decision making</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiCards.map((kpi) => (
            <div key={kpi.title} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${kpi.color} rounded-lg p-3`}>
                  <kpi.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-600">{kpi.title}</p>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
                    <div className={`flex items-center text-sm ${
                      kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      <ArrowTrendingUpIcon className={`h-4 w-4 ${kpi.trend === 'down' ? 'transform rotate-180' : ''}`} />
                      <span className="ml-1">{kpi.change}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* RFM Segmentation */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">RFM Customer Segmentation</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.rfmSegments}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ segment, percent }) => `${segment}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analyticsData.rfmSegments.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={rfmColors[entry.segment] || '#8884d8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* NPS Distribution */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Net Promoter Score</h3>
              <div className="text-2xl font-bold text-blue-600">{analyticsData.npsData.score}</div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.npsData.distribution || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={(entry, index) => npsSegmentColors[index]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Lifetime Value Analysis */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Lifetime Value Distribution</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={analyticsData.clvData}>
              <CartesianGrid />
              <XAxis 
                type="number" 
                dataKey="tenure" 
                name="Tenure (months)"
                label={{ value: 'Customer Tenure (months)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                type="number" 
                dataKey="clv" 
                name="CLV"
                label={{ value: 'Customer Lifetime Value (₹)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} />
              <Scatter name="CLV vs Tenure" data={analyticsData.clvData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Cohort Analysis */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Cohort Retention Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.cohortAnalysis}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="period" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Retention Rate']} />
                {analyticsData.cohortAnalysis.length > 0 && 
                  Object.keys(analyticsData.cohortAnalysis[0] || {})
                    .filter(key => key !== 'period')
                    .map((cohort, index) => (
                      <Line 
                        key={cohort} 
                        type="monotone" 
                        dataKey={cohort} 
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                        strokeWidth={2}
                      />
                    ))
                }
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Churn Prediction */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk Analysis</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData.churnPrediction}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="riskLevel" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Customer Journey Funnel */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Journey Funnel</h3>
          <div className="space-y-4">
            {analyticsData.customerJourney.map((stage, index) => {
              const percentage = analyticsData.customerJourney[0] 
                ? (stage.count / analyticsData.customerJourney[0].count * 100).toFixed(1)
                : 0;
              
              return (
                <div key={stage.stage} className="flex items-center space-x-4">
                  <div className="w-32 text-sm font-medium text-gray-600">{stage.stage}</div>
                  <div className="flex-1 bg-gray-200 rounded-full h-8 relative">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-indigo-600 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                      style={{ width: `${percentage}%` }}
                    >
                      {stage.count.toLocaleString()}
                    </div>
                    <div className="absolute right-2 top-1 text-xs text-gray-600">
                      {percentage}%
                    </div>
                  </div>
                  <div className="w-16 text-sm text-gray-600">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
