// Debug script to test dashboard data loading
// You can run this in the browser console while on the dashboard page

console.log('=== DASHBOARD DEBUG ===');

// Check if user is logged in
const user = JSON.parse(localStorage.getItem('user') || '{}');
const token = localStorage.getItem('token');

console.log('User:', user);
console.log('Token exists:', !!token);

// Test API call
if (token) {
  fetch('http://localhost:5000/api/patients/dashboard', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log('API Response:', data);
    if (data.success) {
      console.log('Total Spent:', data.dashboard.loyaltyMetrics.totalSpent);
      console.log('Loyalty Metrics:', data.dashboard.loyaltyMetrics);
    } else {
      console.error('API Error:', data.message);
    }
  })
  .catch(error => {
    console.error('Network Error:', error);
  });
} else {
  console.error('No token found - user not logged in');
}
