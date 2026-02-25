const axios = require('axios');

async function testAuth() {
  const baseURL = 'http://localhost:4000/api';
  const testUser = {
    email: `test_${Date.now()}@example.com`,
    username: `testuser_${Date.now()}`,
    password: 'password123'
  };

  try {
    console.log('--- Testing Registration ---');
    const regRes = await axios.post(`${baseURL}/auth/register`, testUser);
    console.log('Registration Response:', regRes.data.ok ? 'SUCCESS' : 'FAILED');
    if (!regRes.data.ok) throw new Error('Registration failed');

    const token = regRes.data.token;
    console.log('Token received:', token ? 'YES' : 'NO');

    console.log('\n--- Testing Login ---');
    const loginRes = await axios.post(`${baseURL}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    });
    console.log('Login Response:', loginRes.data.ok ? 'SUCCESS' : 'FAILED');
    if (!loginRes.data.ok) throw new Error('Login failed');

    console.log('\n--- Testing Profile Fetching (Auth Middleware) ---');
    const profileRes = await axios.get(`${baseURL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Profile Fetch Response:', profileRes.data.ok ? 'SUCCESS' : 'FAILED');
    console.log('Username from server:', profileRes.data.user?.username);

    if (profileRes.data.user?.username === testUser.username) {
      console.log('\n✅ ALL AUTH TESTS PASSED!');
    } else {
      console.log('\n❌ AUTH TEST FAILED: Username mismatch');
    }

  } catch (err) {
    console.error('\n❌ AUTH TEST FAILED:', err.response?.data || err.message);
  }
}

testAuth();
