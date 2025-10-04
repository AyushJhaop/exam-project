/**
 * Sliding Window algorithm for recent activity metrics
 */
class SlidingWindowAnalyzer {
  constructor(windowSize = 7) { // Default 7 days
    this.windowSize = windowSize;
    this.appointments = [];
    this.revenues = [];
    this.activities = [];
  }

  // Add appointment to sliding window
  addAppointment(appointment) {
    const now = new Date();
    const appointmentData = {
      ...appointment,
      timestamp: new Date(appointment.appointmentDate)
    };

    this.appointments.push(appointmentData);
    this.cleanOldData();
  }

  // Remove data outside the window
  cleanOldData() {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.windowSize);

    this.appointments = this.appointments.filter(apt => 
      apt.timestamp >= cutoffDate
    );
    this.revenues = this.revenues.filter(rev => 
      rev.timestamp >= cutoffDate
    );
    this.activities = this.activities.filter(act => 
      act.timestamp >= cutoffDate
    );
  }

  // Get appointment metrics for current window
  getAppointmentMetrics() {
    this.cleanOldData();
    
    const total = this.appointments.length;
    const completed = this.appointments.filter(apt => apt.status === 'completed').length;
    const cancelled = this.appointments.filter(apt => apt.status === 'cancelled').length;
    const noShow = this.appointments.filter(apt => apt.status === 'no_show').length;

    return {
      total,
      completed,
      cancelled,
      noShow,
      completionRate: total > 0 ? (completed / total * 100).toFixed(2) : 0,
      cancellationRate: total > 0 ? (cancelled / total * 100).toFixed(2) : 0,
      noShowRate: total > 0 ? (noShow / total * 100).toFixed(2) : 0
    };
  }

  // Get revenue metrics with moving average
  getRevenueMetrics() {
    this.cleanOldData();
    
    const totalRevenue = this.appointments
      .filter(apt => apt.status === 'completed' && apt.paymentStatus === 'paid')
      .reduce((sum, apt) => sum + (apt.fee || 0), 0);

    const avgDailyRevenue = totalRevenue / this.windowSize;
    
    // Calculate daily revenue for trend analysis
    const dailyRevenue = this.getDailyRevenue();
    
    return {
      totalRevenue,
      avgDailyRevenue: avgDailyRevenue.toFixed(2),
      dailyRevenue,
      trend: this.calculateTrend(dailyRevenue)
    };
  }

  // Calculate daily revenue breakdown
  getDailyRevenue() {
    const dailyMap = new Map();
    
    // Initialize all days in window
    for (let i = 0; i < this.windowSize; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dailyMap.set(dateStr, 0);
    }

    // Add revenue data
    this.appointments
      .filter(apt => apt.status === 'completed' && apt.paymentStatus === 'paid')
      .forEach(apt => {
        const dateStr = apt.timestamp.toISOString().split('T')[0];
        if (dailyMap.has(dateStr)) {
          dailyMap.set(dateStr, dailyMap.get(dateStr) + (apt.fee || 0));
        }
      });

    return Array.from(dailyMap.entries()).map(([date, revenue]) => ({
      date,
      revenue
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  // Calculate trend using linear regression
  calculateTrend(dailyData) {
    if (dailyData.length < 2) return 0;

    const n = dailyData.length;
    const sumX = dailyData.reduce((sum, _, i) => sum + i, 0);
    const sumY = dailyData.reduce((sum, item) => sum + item.revenue, 0);
    const sumXY = dailyData.reduce((sum, item, i) => sum + (i * item.revenue), 0);
    const sumXX = dailyData.reduce((sum, _, i) => sum + (i * i), 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  // Get patient acquisition metrics
  getPatientAcquisitionMetrics() {
    this.cleanOldData();
    
    const uniquePatients = new Set(this.appointments.map(apt => apt.patient.toString()));
    const newPatients = this.appointments.filter(apt => {
      // This would need to check if it's patient's first appointment
      // Simplified for this implementation
      return apt.isFirstAppointment;
    }).length;

    return {
      totalUniquePatients: uniquePatients.size,
      newPatients,
      returnPatients: uniquePatients.size - newPatients,
      acquisitionRate: uniquePatients.size > 0 ? 
        (newPatients / uniquePatients.size * 100).toFixed(2) : 0
    };
  }

  // Get doctor utilization metrics
  getDoctorUtilizationMetrics() {
    this.cleanOldData();
    
    const doctorStats = new Map();
    
    this.appointments.forEach(apt => {
      const doctorId = apt.doctor.toString();
      if (!doctorStats.has(doctorId)) {
        doctorStats.set(doctorId, {
          total: 0,
          completed: 0,
          revenue: 0,
          avgRating: 0,
          ratingCount: 0
        });
      }
      
      const stats = doctorStats.get(doctorId);
      stats.total++;
      
      if (apt.status === 'completed') {
        stats.completed++;
        stats.revenue += apt.fee || 0;
        
        if (apt.rating?.patientRating?.score) {
          stats.avgRating = (stats.avgRating * stats.ratingCount + apt.rating.patientRating.score) / (stats.ratingCount + 1);
          stats.ratingCount++;
        }
      }
    });

    return Array.from(doctorStats.entries()).map(([doctorId, stats]) => ({
      doctorId,
      ...stats,
      utilizationRate: (stats.completed / stats.total * 100).toFixed(2),
      avgRating: stats.avgRating.toFixed(2)
    }));
  }
}

/**
 * Two-pointer technique for analyzing appointment patterns
 */
class AppointmentPatternAnalyzer {
  constructor() {
    this.appointments = [];
  }

  // Set appointments data (sorted by date)
  setAppointments(appointments) {
    this.appointments = appointments.sort((a, b) => 
      new Date(a.appointmentDate) - new Date(b.appointmentDate)
    );
  }

  // Find peak hours using two-pointer technique
  findPeakHours() {
    const hourCounts = new Array(24).fill(0);
    
    this.appointments.forEach(apt => {
      const hour = new Date(apt.appointmentDate).getHours();
      hourCounts[hour]++;
    });

    // Find the window with maximum appointments
    let maxSum = 0;
    let maxStart = 0;
    const windowSize = 3; // 3-hour window

    // Calculate initial window sum
    let currentSum = 0;
    for (let i = 0; i < windowSize; i++) {
      currentSum += hourCounts[i];
    }
    maxSum = currentSum;

    // Use sliding window to find maximum
    for (let i = 1; i <= 24 - windowSize; i++) {
      currentSum = currentSum - hourCounts[i - 1] + hourCounts[i + windowSize - 1];
      if (currentSum > maxSum) {
        maxSum = currentSum;
        maxStart = i;
      }
    }

    return {
      peakWindow: {
        startHour: maxStart,
        endHour: maxStart + windowSize - 1,
        appointmentCount: maxSum
      },
      hourlyDistribution: hourCounts.map((count, hour) => ({ hour, count }))
    };
  }

  // Find appointment clusters (busy periods) using two pointers
  findAppointmentClusters(maxGapMinutes = 30) {
    if (this.appointments.length === 0) return [];

    const clusters = [];
    let left = 0;

    while (left < this.appointments.length) {
      let right = left;
      const clusterStart = new Date(this.appointments[left].appointmentDate);
      
      // Extend cluster while appointments are within gap threshold
      while (right + 1 < this.appointments.length) {
        const currentEnd = new Date(this.appointments[right].appointmentDate);
        const nextStart = new Date(this.appointments[right + 1].appointmentDate);
        
        const gapMinutes = (nextStart - currentEnd) / (1000 * 60);
        
        if (gapMinutes <= maxGapMinutes) {
          right++;
        } else {
          break;
        }
      }

      const clusterEnd = new Date(this.appointments[right].appointmentDate);
      
      clusters.push({
        startTime: clusterStart,
        endTime: clusterEnd,
        appointmentCount: right - left + 1,
        appointments: this.appointments.slice(left, right + 1),
        duration: (clusterEnd - clusterStart) / (1000 * 60) // minutes
      });

      left = right + 1;
    }

    return clusters.sort((a, b) => b.appointmentCount - a.appointmentCount);
  }

  // Analyze doctor workload balance
  analyzeWorkloadBalance() {
    const doctorWorkload = new Map();
    
    this.appointments.forEach(apt => {
      const doctorId = apt.doctor.toString();
      if (!doctorWorkload.has(doctorId)) {
        doctorWorkload.set(doctorId, []);
      }
      doctorWorkload.get(doctorId).push(apt);
    });

    const workloadStats = [];
    
    for (let [doctorId, appointments] of doctorWorkload) {
      // Sort appointments by date
      appointments.sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate));
      
      // Calculate gaps between appointments
      const gaps = [];
      for (let i = 0; i < appointments.length - 1; i++) {
        const current = new Date(appointments[i].appointmentDate);
        const next = new Date(appointments[i + 1].appointmentDate);
        gaps.push((next - current) / (1000 * 60)); // minutes
      }

      const avgGap = gaps.length > 0 ? gaps.reduce((a, b) => a + b, 0) / gaps.length : 0;
      const minGap = gaps.length > 0 ? Math.min(...gaps) : 0;
      const maxGap = gaps.length > 0 ? Math.max(...gaps) : 0;

      workloadStats.push({
        doctorId,
        appointmentCount: appointments.length,
        avgGapMinutes: avgGap.toFixed(2),
        minGapMinutes: minGap,
        maxGapMinutes: maxGap,
        isOverloaded: avgGap < 15, // Less than 15 minutes between appointments
        isUnderUtilized: avgGap > 120 // More than 2 hours between appointments
      });
    }

    return workloadStats.sort((a, b) => b.appointmentCount - a.appointmentCount);
  }
}

module.exports = {
  SlidingWindowAnalyzer,
  AppointmentPatternAnalyzer
};
