const { SlidingWindow, MetricsAnalyzer } = require('../algorithms/slidingWindow');

describe('Sliding Window Algorithm Implementation', () => {
  let slidingWindow;

  beforeEach(() => {
    slidingWindow = new SlidingWindow(5); // Window size of 5
  });

  describe('Basic Window Operations', () => {
    test('should initialize empty sliding window', () => {
      expect(slidingWindow.size()).toBe(0);
      expect(slidingWindow.isFull()).toBe(false);
      expect(slidingWindow.getWindow()).toEqual([]);
    });

    test('should add elements to window', () => {
      slidingWindow.add(10);
      slidingWindow.add(20);
      slidingWindow.add(30);

      expect(slidingWindow.size()).toBe(3);
      expect(slidingWindow.getWindow()).toEqual([10, 20, 30]);
    });

    test('should maintain window size limit', () => {
      // Add more elements than window size
      for (let i = 1; i <= 8; i++) {
        slidingWindow.add(i * 10);
      }

      expect(slidingWindow.size()).toBe(5);
      expect(slidingWindow.isFull()).toBe(true);
      expect(slidingWindow.getWindow()).toEqual([40, 50, 60, 70, 80]);
    });

    test('should slide window correctly', () => {
      // Fill the window
      [10, 20, 30, 40, 50].forEach(val => slidingWindow.add(val));
      expect(slidingWindow.getWindow()).toEqual([10, 20, 30, 40, 50]);

      // Add one more element - should slide
      slidingWindow.add(60);
      expect(slidingWindow.getWindow()).toEqual([20, 30, 40, 50, 60]);

      // Add another - should slide again
      slidingWindow.add(70);
      expect(slidingWindow.getWindow()).toEqual([30, 40, 50, 60, 70]);
    });
  });

  describe('Statistical Operations', () => {
    beforeEach(() => {
      [15, 25, 35, 45, 55].forEach(val => slidingWindow.add(val));
    });

    test('should calculate sum correctly', () => {
      expect(slidingWindow.sum()).toBe(175);
    });

    test('should calculate average correctly', () => {
      expect(slidingWindow.average()).toBe(35);
    });

    test('should find minimum value', () => {
      expect(slidingWindow.min()).toBe(15);
    });

    test('should find maximum value', () => {
      expect(slidingWindow.max()).toBe(55);
    });

    test('should calculate range', () => {
      expect(slidingWindow.range()).toBe(40); // 55 - 15
    });

    test('should update statistics after sliding', () => {
      slidingWindow.add(65); // Window becomes [25, 35, 45, 55, 65]
      
      expect(slidingWindow.sum()).toBe(225);
      expect(slidingWindow.average()).toBe(45);
      expect(slidingWindow.min()).toBe(25);
      expect(slidingWindow.max()).toBe(65);
    });
  });

  describe('Trend Analysis', () => {
    test('should detect increasing trend', () => {
      [10, 20, 30, 40, 50].forEach(val => slidingWindow.add(val));
      expect(slidingWindow.getTrend()).toBe('increasing');
    });

    test('should detect decreasing trend', () => {
      [50, 40, 30, 20, 10].forEach(val => slidingWindow.add(val));
      expect(slidingWindow.getTrend()).toBe('decreasing');
    });

    test('should detect stable trend', () => {
      [30, 30, 30, 30, 30].forEach(val => slidingWindow.add(val));
      expect(slidingWindow.getTrend()).toBe('stable');
    });

    test('should detect mixed trend', () => {
      [10, 30, 20, 40, 25].forEach(val => slidingWindow.add(val));
      expect(slidingWindow.getTrend()).toBe('mixed');
    });
  });
});

describe('Metrics Analyzer', () => {
  let analyzer;

  beforeEach(() => {
    analyzer = new MetricsAnalyzer();
  });

  describe('Appointment Metrics', () => {
    test('should analyze daily appointment counts', () => {
      const appointments = [
        { date: '2024-01-01', count: 15 },
        { date: '2024-01-02', count: 18 },
        { date: '2024-01-03', count: 22 },
        { date: '2024-01-04', count: 19 },
        { date: '2024-01-05', count: 25 }
      ];

      const metrics = analyzer.analyzeAppointmentTrends(appointments, 3); // 3-day window

      expect(metrics.averageDaily).toBeCloseTo(19.8);
      expect(metrics.trend).toBeDefined();
      expect(metrics.dailyMetrics).toHaveLength(3); // Last 3 windows
    });

    test('should detect appointment booking patterns', () => {
      const hourlyBookings = [
        { hour: 9, count: 5 },
        { hour: 10, count: 8 },
        { hour: 11, count: 12 },
        { hour: 14, count: 15 }, // Peak
        { hour: 15, count: 10 },
        { hour: 16, count: 6 }
      ];

      const pattern = analyzer.findPeakHours(hourlyBookings, 3);

      expect(pattern.peakHour).toBe(14);
      expect(pattern.peakCount).toBe(15);
      expect(pattern.movingAverage).toBeDefined();
    });
  });

  describe('Revenue Analysis', () => {
    test('should analyze revenue trends using sliding window', () => {
      const dailyRevenue = [
        { date: '2024-01-01', amount: 1200 },
        { date: '2024-01-02', amount: 1350 },
        { date: '2024-01-03', amount: 1100 },
        { date: '2024-01-04', amount: 1450 },
        { date: '2024-01-05', amount: 1600 },
        { date: '2024-01-06', amount: 1300 },
        { date: '2024-01-07', amount: 1550 }
      ];

      const analysis = analyzer.analyzeRevenueTrends(dailyRevenue, 3);

      expect(analysis.weeklyAverage).toBeGreaterThan(0);
      expect(analysis.trend).toBeDefined();
      expect(analysis.volatility).toBeGreaterThanOrEqual(0);
    });

    test('should detect revenue anomalies', () => {
      const revenue = [
        { date: '2024-01-01', amount: 1000 },
        { date: '2024-01-02', amount: 1050 },
        { date: '2024-01-03', amount: 950 },
        { date: '2024-01-04', amount: 2500 }, // Anomaly - much higher
        { date: '2024-01-05', amount: 1000 }
      ];

      const anomalies = analyzer.detectAnomalies(revenue, 3);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].date).toBe('2024-01-04');
      expect(anomalies[0].value).toBe(2500);
    });
  });

  describe('Patient Flow Analysis', () => {
    test('should analyze patient wait times', () => {
      const waitTimes = [
        { timestamp: '09:00', waitTime: 15 },
        { timestamp: '09:30', waitTime: 12 },
        { timestamp: '10:00', waitTime: 18 },
        { timestamp: '10:30', waitTime: 22 },
        { timestamp: '11:00', waitTime: 8 },
        { timestamp: '11:30', waitTime: 25 }
      ];

      const analysis = analyzer.analyzeWaitTimes(waitTimes, 3);

      expect(analysis.averageWait).toBeGreaterThan(0);
      expect(analysis.trend).toBeDefined();
      expect(analysis.peakWaitPeriod).toBeDefined();
    });

    test('should analyze patient satisfaction scores', () => {
      const satisfactionScores = [
        { date: '2024-01-01', score: 4.2 },
        { date: '2024-01-02', score: 4.5 },
        { date: '2024-01-03', score: 4.1 },
        { date: '2024-01-04', score: 4.7 },
        { date: '2024-01-05', score: 4.3 }
      ];

      const analysis = analyzer.analyzeSatisfactionTrends(satisfactionScores, 3);

      expect(analysis.averageScore).toBeGreaterThan(0);
      expect(analysis.averageScore).toBeLessThanOrEqual(5);
      expect(analysis.trend).toBeDefined();
    });
  });

  describe('Real-time Metrics', () => {
    test('should update metrics in real-time', () => {
      const realTimeAnalyzer = new MetricsAnalyzer();
      
      // Simulate real-time data points
      const dataPoints = [
        { timestamp: Date.now() - 4000, value: 100 },
        { timestamp: Date.now() - 3000, value: 110 },
        { timestamp: Date.now() - 2000, value: 95 },
        { timestamp: Date.now() - 1000, value: 125 },
        { timestamp: Date.now(), value: 115 }
      ];

      dataPoints.forEach(point => {
        realTimeAnalyzer.addDataPoint(point.value, point.timestamp);
      });

      const metrics = realTimeAnalyzer.getCurrentMetrics(3); // 3-point window

      expect(metrics.current).toBe(115);
      expect(metrics.average).toBeCloseTo(111.67, 1);
      expect(metrics.trend).toBeDefined();
    });

    test('should handle rapid data updates', () => {
      const rapidAnalyzer = new MetricsAnalyzer();
      
      // Add 100 data points rapidly
      for (let i = 0; i < 100; i++) {
        rapidAnalyzer.addDataPoint(Math.random() * 100, Date.now() + i);
      }

      const metrics = rapidAnalyzer.getCurrentMetrics(10);
      
      expect(metrics.current).toBeGreaterThanOrEqual(0);
      expect(metrics.average).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Performance Metrics', () => {
    test('should handle large datasets efficiently', () => {
      const largeDataset = [];
      
      // Generate 1000 data points
      for (let i = 0; i < 1000; i++) {
        largeDataset.push({
          timestamp: Date.now() + i * 1000,
          value: Math.random() * 100
        });
      }

      const startTime = performance.now();
      
      const analysis = analyzer.analyzeTimeSeries(largeDataset, 50); // 50-point window
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(analysis).toBeDefined();
      expect(processingTime).toBeLessThan(100); // Should complete in less than 100ms
    });

    test('should maintain performance with sliding window updates', () => {
      const performanceAnalyzer = new MetricsAnalyzer();
      
      const startTime = performance.now();
      
      // Simulate 500 rapid updates
      for (let i = 0; i < 500; i++) {
        performanceAnalyzer.addDataPoint(Math.random() * 100);
        performanceAnalyzer.getCurrentMetrics(10);
      }
      
      const endTime = performance.now();
      const processingTime = endTime - startTime;

      expect(processingTime).toBeLessThan(200); // Should complete in less than 200ms
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty datasets', () => {
      const emptyAnalysis = analyzer.analyzeTimeSeries([], 5);
      
      expect(emptyAnalysis.average).toBe(0);
      expect(emptyAnalysis.trend).toBe('stable');
    });

    test('should handle single data point', () => {
      const singlePoint = [{ timestamp: Date.now(), value: 50 }];
      const analysis = analyzer.analyzeTimeSeries(singlePoint, 5);
      
      expect(analysis.average).toBe(50);
      expect(analysis.trend).toBe('stable');
    });

    test('should handle window size larger than dataset', () => {
      const smallDataset = [
        { timestamp: Date.now(), value: 10 },
        { timestamp: Date.now() + 1000, value: 20 }
      ];
      
      const analysis = analyzer.analyzeTimeSeries(smallDataset, 10);
      
      expect(analysis.average).toBe(15);
      expect(analysis.trend).toBeDefined();
    });

    test('should handle null/undefined values', () => {
      expect(() => analyzer.analyzeTimeSeries(null, 5)).not.toThrow();
      expect(() => analyzer.analyzeTimeSeries(undefined, 5)).not.toThrow();
      
      const nullAnalysis = analyzer.analyzeTimeSeries(null, 5);
      expect(nullAnalysis.average).toBe(0);
    });
  });
});
