const axios = require('axios');
const mongoose = require('mongoose');

async function testReview() {
  try {
    const API_URL = 'http://localhost:4000/api';
    const login = await axios.post(`${API_URL}/auth/login`, {
      email: 'official_test@pickwise.com',
      password: 'securePassword123'
    });

    const token = login.data.token;
    const contentId = '69749e51a4a2040cf9d96af4'; // The ID from the user's error

    console.log('Testing Review Submission for ID:', contentId);
    
    // First, let's make sure the content exists or pick another valid ID
    const contentCheck = await axios.get(`${API_URL}/content/${contentId}`).catch(e => null);
    let target = contentId;
    
    if (!contentCheck) {
        console.log('ID not found, picking first available content...');
        const search = await axios.post(`${API_URL}/search`, { category: 'movie' });
        target = search.data.results[0]?._id;
    }

    const reviewRes = await axios.post(`${API_URL}/reviews/${target}`, 
      { rating: 9, text: 'This is a test review after auth fix.' },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (reviewRes.data.ok) {
      console.log('✅ Review submission SUCCESS');
    } else {
      console.log('❌ Review submission FAILED:', reviewRes.data);
    }

  } catch (err) {
    console.error('💥 REVIEW TEST FAILED:', err.response?.data || err.message);
  } finally {
    process.exit();
  }
}

testReview();
