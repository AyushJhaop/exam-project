import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import BusinessDashboard from '../../pages/admin/BusinessDashboard';

// Mock Recharts
jest.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data }) => <div data-testid="pie">Data points: {data?.length || 0}</div>,
  Cell: () => <div data-testid="cell" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: ({ dataKey }) => <div data-testid="line">{dataKey}</div>,
  XAxis: ({ dataKey }) => <div data-testid="x-axis">{dataKey}</div>,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  ScatterChart: ({ children }) => <div data-testid="scatter-chart">{children}</div>,
  Scatter: ({ dataKey }) => <div data-testid="scatter">{dataKey}</div>,
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: ({ dataKey }) => <div data-testid="bar">{dataKey}</div>
}));

// Mock API calls
jest.mock('../../services/api', () => ({
  get: jest.fn()
}));

const MockedBusinessDashboard = () => (
  <BrowserRouter>
    <AuthProvider>
      <BusinessDashboard />
    </AuthProvider>
  </BrowserRouter>
);

describe('BusinessDashboard Component', () => {
  const mockRFMData = {
    segments: [
      {
        segment: 'Champions',
        customerCount: 150,
        percentage: 25,
        averageSpent: 1200,
        recencyScore: 5,
        frequencyScore: 5,
        monetaryScore: 5
      },
      {
        segment: 'Loyal Customers',
        customerCount: 120,
        percentage: 20,
        averageSpent: 800,
        recencyScore: 4,
        frequencyScore: 5,
        monetaryScore: 4
      },
      {
        segment: 'At Risk',
        customerCount: 80,
        percentage: 13,
        averageSpent: 600,
        recencyScore: 2,
        frequencyScore: 3,
        monetaryScore: 3
      }
    ],
    totalCustomers: 600,
    totalRevenue: 540000
  };

  const mockCLVData = {
    averageCLV: 2450,
    totalCustomers: 600,
    highValueCustomers: 85,
    clvDistribution: [
      { range: '0-500', count: 200, percentage: 33.3 },
      { range: '500-1000', count: 180, percentage: 30 },
      { range: '1000-2000', count: 120, percentage: 20 },
      { range: '2000+', count: 100, percentage: 16.7 }
    ]
  };

  const mockNPSData = {
    overallNPS: 67,
    totalResponses: 450,
    distribution: {
      promoters: 270,
      passives: 120,
      detractors: 60
    },
    trend: [
      { month: 'Jan', nps: 65 },
      { month: 'Feb', nps: 68 },
      { month: 'Mar', nps: 67 },
      { month: 'Apr', nps: 71 },
      { month: 'May', nps: 67 }
    ]
  };

  const mockCohortData = {
    cohorts: [
      {
        acquisitionMonth: '2024-01',
        customerCount: 100,
        retentionRates: [100, 85, 75, 68, 62, 58]
      },
      {
        acquisitionMonth: '2024-02',
        customerCount: 120,
        retentionRates: [100, 88, 78, 71, 65]
      }
    ]
  };

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { get } = require('../../services/api');
    get.mockImplementation((url) => {
      if (url === '/dashboard/rfm-analysis') {
        return Promise.resolve({ data: { rfmAnalysis: mockRFMData } });
      }
      if (url === '/dashboard/clv-analysis') {
        return Promise.resolve({ data: { clvAnalysis: mockCLVData } });
      }
      if (url === '/dashboard/nps-analysis') {
        return Promise.resolve({ data: { npsAnalysis: mockNPSData } });
      }
      if (url === '/dashboard/cohort-analysis') {
        return Promise.resolve({ data: { cohortAnalysis: mockCohortData } });
      }
      return Promise.resolve({ data: {} });
    });
  });

  describe('Initial Render and Data Loading', () => {
    test('should render dashboard title and navigation', () => {
      render(<MockedBusinessDashboard />);
      
      expect(screen.getByText(/business analytics/i)).toBeInTheDocument();
      expect(screen.getByText(/rfm analysis/i)).toBeInTheDocument();
      expect(screen.getByRole('navigation')).toBeInTheDocument();
    });

    test('should load all analytics data on mount', async () => {
      const { get } = require('../../services/api');
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(get).toHaveBeenCalledWith('/dashboard/rfm-analysis');
        expect(get).toHaveBeenCalledWith('/dashboard/clv-analysis');
        expect(get).toHaveBeenCalledWith('/dashboard/nps-analysis');
        expect(get).toHaveBeenCalledWith('/dashboard/cohort-analysis');
      });
    });

    test('should show loading state while fetching data', () => {
      const { get } = require('../../services/api');
      get.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      render(<MockedBusinessDashboard />);
      
      expect(screen.getByText(/loading analytics/i)).toBeInTheDocument();
    });

    test('should handle data loading errors', async () => {
      const { get } = require('../../services/api');
      get.mockRejectedValue(new Error('Failed to load analytics'));
      
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/failed to load analytics/i)).toBeInTheDocument();
      });
    });
  });

  describe('RFM Analysis Section', () => {
    test('should display RFM analysis charts and metrics', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Champions')).toBeInTheDocument();
        expect(screen.getByText('150')).toBeInTheDocument(); // Customer count
        expect(screen.getByText('25%')).toBeInTheDocument(); // Percentage
      });
      
      expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    });

    test('should show customer segment breakdown', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Champions')).toBeInTheDocument();
        expect(screen.getByText('Loyal Customers')).toBeInTheDocument();
        expect(screen.getByText('At Risk')).toBeInTheDocument();
      });
    });

    test('should display total customers and revenue', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('600')).toBeInTheDocument(); // Total customers
        expect(screen.getByText(/540,000/)).toBeInTheDocument(); // Total revenue
      });
    });

    test('should show RFM scores for each segment', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        // Should show RFM scores (5, 5, 5 for Champions)
        const rfmScores = screen.getAllByText('5');
        expect(rfmScores.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Customer Lifetime Value Analysis', () => {
    test('should display CLV metrics', async () => {
      render(<MockedBusinessDashboard />);
      
      // Navigate to CLV tab
      const clvTab = screen.getByText(/customer lifetime value/i);
      await userEvent.click(clvTab);
      
      await waitFor(() => {
        expect(screen.getByText('₹2,450')).toBeInTheDocument(); // Average CLV
        expect(screen.getByText('85')).toBeInTheDocument(); // High value customers
      });
    });

    test('should show CLV distribution chart', async () => {
      render(<MockedBusinessDashboard />);
      
      const clvTab = screen.getByText(/customer lifetime value/i);
      await userEvent.click(clvTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    test('should display CLV ranges and percentages', async () => {
      render(<MockedBusinessDashboard />);
      
      const clvTab = screen.getByText(/customer lifetime value/i);
      await userEvent.click(clvTab);
      
      await waitFor(() => {
        expect(screen.getByText('0-500')).toBeInTheDocument();
        expect(screen.getByText('33.3%')).toBeInTheDocument();
        expect(screen.getByText('2000+')).toBeInTheDocument();
      });
    });
  });

  describe('Net Promoter Score Analysis', () => {
    test('should display NPS score and breakdown', async () => {
      render(<MockedBusinessDashboard />);
      
      const npsTab = screen.getByText(/net promoter score/i);
      await userEvent.click(npsTab);
      
      await waitFor(() => {
        expect(screen.getByText('67')).toBeInTheDocument(); // Overall NPS
        expect(screen.getByText('270')).toBeInTheDocument(); // Promoters
        expect(screen.getByText('120')).toBeInTheDocument(); // Passives
        expect(screen.getByText('60')).toBeInTheDocument(); // Detractors
      });
    });

    test('should show NPS trend chart', async () => {
      render(<MockedBusinessDashboard />);
      
      const npsTab = screen.getByText(/net promoter score/i);
      await userEvent.click(npsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    test('should categorize NPS score correctly', async () => {
      render(<MockedBusinessDashboard />);
      
      const npsTab = screen.getByText(/net promoter score/i);
      await userEvent.click(npsTab);
      
      await waitFor(() => {
        // NPS of 67 should be categorized as "Excellent"
        expect(screen.getByText(/excellent/i)).toBeInTheDocument();
      });
    });

    test('should display NPS distribution pie chart', async () => {
      render(<MockedBusinessDashboard />);
      
      const npsTab = screen.getByText(/net promoter score/i);
      await userEvent.click(npsTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
    });
  });

  describe('Cohort Analysis', () => {
    test('should display cohort retention table', async () => {
      render(<MockedBusinessDashboard />);
      
      const cohortTab = screen.getByText(/cohort analysis/i);
      await userEvent.click(cohortTab);
      
      await waitFor(() => {
        expect(screen.getByText('2024-01')).toBeInTheDocument();
        expect(screen.getByText('2024-02')).toBeInTheDocument();
        expect(screen.getByText('85%')).toBeInTheDocument(); // Retention rate
      });
    });

    test('should show cohort retention chart', async () => {
      render(<MockedBusinessDashboard />);
      
      const cohortTab = screen.getByText(/cohort analysis/i);
      await userEvent.click(cohortTab);
      
      await waitFor(() => {
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    test('should display customer acquisition months', async () => {
      render(<MockedBusinessDashboard />);
      
      const cohortTab = screen.getByText(/cohort analysis/i);
      await userEvent.click(cohortTab);
      
      await waitFor(() => {
        expect(screen.getByText('100')).toBeInTheDocument(); // Customer count
        expect(screen.getByText('120')).toBeInTheDocument(); // Another cohort count
      });
    });
  });

  describe('Tab Navigation', () => {
    test('should switch between different analysis tabs', async () => {
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      // Initially should show RFM analysis
      await waitFor(() => {
        expect(screen.getByText('Champions')).toBeInTheDocument();
      });
      
      // Switch to CLV tab
      const clvTab = screen.getByText(/customer lifetime value/i);
      await user.click(clvTab);
      
      await waitFor(() => {
        expect(screen.getByText('₹2,450')).toBeInTheDocument();
      });
      
      // Switch to NPS tab
      const npsTab = screen.getByText(/net promoter score/i);
      await user.click(npsTab);
      
      await waitFor(() => {
        expect(screen.getByText('67')).toBeInTheDocument();
      });
    });

    test('should highlight active tab', async () => {
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      const clvTab = screen.getByText(/customer lifetime value/i);
      await user.click(clvTab);
      
      expect(clvTab).toHaveClass('border-blue-500'); // Active tab styling
    });
  });

  describe('Data Export and Filters', () => {
    test('should provide data export functionality', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        const exportButton = screen.getByText(/export data/i);
        expect(exportButton).toBeInTheDocument();
      });
    });

    test('should filter data by date range', async () => {
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      const dateFilter = screen.getByRole('combobox', { name: /date range/i });
      await user.selectOptions(dateFilter, 'last-30-days');
      
      // Should trigger data refresh with new date range
      const { get } = require('../../services/api');
      expect(get).toHaveBeenCalledWith(
        expect.stringContaining('startDate')
      );
    });

    test('should refresh data manually', async () => {
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      const refreshButton = screen.getByText(/refresh/i);
      await user.click(refreshButton);
      
      const { get } = require('../../services/api');
      expect(get).toHaveBeenCalledTimes(8); // 4 initial + 4 refresh calls
    });
  });

  describe('Responsive Design', () => {
    test('should adapt charts for mobile viewport', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      render(<MockedBusinessDashboard />);
      
      // Charts should be rendered in responsive containers
      expect(screen.getAllByTestId('responsive-container').length).toBeGreaterThan(0);
    });

    test('should stack tabs vertically on mobile', () => {
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));
      
      render(<MockedBusinessDashboard />);
      
      const tabContainer = screen.getByRole('tablist');
      expect(tabContainer).toHaveClass('flex-col'); // Mobile stacking
    });
  });

  describe('Performance and Optimization', () => {
    test('should handle large datasets efficiently', async () => {
      // Mock large dataset
      const largeRFMData = {
        ...mockRFMData,
        segments: Array.from({ length: 100 }, (_, i) => ({
          segment: `Segment ${i}`,
          customerCount: Math.floor(Math.random() * 1000),
          percentage: Math.floor(Math.random() * 100),
          averageSpent: Math.floor(Math.random() * 5000),
          recencyScore: Math.floor(Math.random() * 5) + 1,
          frequencyScore: Math.floor(Math.random() * 5) + 1,
          monetaryScore: Math.floor(Math.random() * 5) + 1
        }))
      };

      const { get } = require('../../services/api');
      get.mockImplementation(() => 
        Promise.resolve({ data: { rfmAnalysis: largeRFMData } })
      );

      const startTime = performance.now();
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText('Segment 0')).toBeInTheDocument();
      });
      
      const endTime = performance.now();
      expect(endTime - startTime).toBeLessThan(5000); // Should render within 5 seconds
    });

    test('should memoize chart components', async () => {
      const renderSpy = jest.fn();
      
      // Mock component to track re-renders
      jest.doMock('recharts', () => ({
        ...jest.requireActual('recharts'),
        PieChart: (props) => {
          renderSpy();
          return <div data-testid="pie-chart">{props.children}</div>;
        }
      }));
      
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
      });
      
      const initialRenderCount = renderSpy.mock.calls.length;
      
      // Switch tabs and back
      const clvTab = screen.getByText(/customer lifetime value/i);
      await user.click(clvTab);
      
      const rfmTab = screen.getByText(/rfm analysis/i);
      await user.click(rfmTab);
      
      // Should not re-render unnecessarily
      expect(renderSpy.mock.calls.length).toBe(initialRenderCount);
    });
  });

  describe('Accessibility', () => {
    test('should have proper ARIA labels for charts', async () => {
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        const chart = screen.getByTestId('pie-chart');
        expect(chart).toHaveAttribute('aria-label');
      });
    });

    test('should support keyboard navigation for tabs', async () => {
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      const tabList = screen.getByRole('tablist');
      await user.click(tabList);
      
      // Arrow keys should navigate between tabs
      await user.keyboard('{ArrowRight}');
      
      const activeTab = document.activeElement;
      expect(activeTab).toHaveAttribute('role', 'tab');
    });

    test('should provide screen reader friendly data tables', async () => {
      render(<MockedBusinessDashboard />);
      
      const cohortTab = screen.getByText(/cohort analysis/i);
      await userEvent.click(cohortTab);
      
      await waitFor(() => {
        const table = screen.getByRole('table');
        expect(table).toHaveAttribute('aria-label');
        
        const columnHeaders = screen.getAllByRole('columnheader');
        expect(columnHeaders.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty data gracefully', async () => {
      const { get } = require('../../services/api');
      get.mockResolvedValue({ data: { rfmAnalysis: { segments: [], totalCustomers: 0 } } });
      
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/no data available/i)).toBeInTheDocument();
      });
    });

    test('should handle malformed data', async () => {
      const { get } = require('../../services/api');
      get.mockResolvedValue({ data: { malformedData: 'invalid' } });
      
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/unable to load data/i)).toBeInTheDocument();
      });
    });

    test('should provide retry mechanism for failed requests', async () => {
      const { get } = require('../../services/api');
      get.mockRejectedValueOnce(new Error('Network error'))
         .mockResolvedValue({ data: { rfmAnalysis: mockRFMData } });
      
      const user = userEvent.setup();
      render(<MockedBusinessDashboard />);
      
      await waitFor(() => {
        expect(screen.getByText(/retry/i)).toBeInTheDocument();
      });
      
      const retryButton = screen.getByText(/retry/i);
      await user.click(retryButton);
      
      await waitFor(() => {
        expect(screen.getByText('Champions')).toBeInTheDocument();
      });
    });
  });
});
