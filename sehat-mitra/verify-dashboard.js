// Paste this into your browser console while on the dashboard page
// This will show you exactly what data the frontend is receiving

console.log('=== FRONTEND DASHBOARD DATA CHECK ===');

// Check localStorage
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

console.log('Logged in user:', user.email);
console.log('User ID:', user.id);
console.log('Token exists:', !!token);

if (!token) {
  console.error('❌ No token found - please login first');
} else {
  // Make API call to dashboard
  fetch('http://localhost:5000/api/patients/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('✅ Dashboard API Response:', data);
    
    if (data.success) {
      const dashboard = data.dashboard;
      console.log('\n=== DASHBOARD STATS ===');
      console.log('Total appointments:', dashboard.appointmentStats.total);
      console.log('Completed appointments:', dashboard.appointmentStats.completed);
      console.log('Completion rate:', dashboard.appointmentStats.completionRate + '%');
      console.log('Total spent:', '₹' + dashboard.loyaltyMetrics.totalSpent);
      console.log('Loyalty score:', dashboard.loyaltyMetrics.loyaltyScore);
      
      // Check if page is displaying this data
      const totalSpentElement = document.querySelector('span:contains("Total Spent")');
      if (totalSpentElement) {
        console.log('Total Spent element found on page');
      } else {
        console.log('⚠️  Total Spent element not found - might need to navigate to dashboard');
      }
    } else {
      console.error('❌ Dashboard API error:', data.message);
    }
  })
  .catch(error => {
    console.error('❌ Network error:', error);
  });
}

console.log('\nIf you see "Total spent: ₹1250" above, but it shows ₹0 on the page, try:');
console.log('1. Refresh the page (Ctrl+R / Cmd+R)');
console.log('2. Clear browser cache');
console.log('3. Make sure you are on the Patient Dashboard page');
console.log('4. Check browser network tab for failed requests');
