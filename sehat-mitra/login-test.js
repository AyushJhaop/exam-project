// Test login script
// Run this in browser console on http://localhost:5174

// Clear any existing auth data
localStorage.removeItem('token');
localStorage.removeItem('user');

// Login with test patient credentials
fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'patient@test.com',
    password: 'patient123'
  })
})
.then(response => response.json())
.then(data => {
  console.log('Login Response:', data);
  if (data.success) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    console.log('✅ Login successful! Reload the page to see dashboard.');
    console.log('User ID:', data.user.id);
  } else {
    console.error('❌ Login failed:', data.message);
  }
})
.catch(error => {
  console.error('❌ Login error:', error);
});

console.log('Attempting login with patient@test.com / patient123...');
