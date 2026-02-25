const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const testUser = {
    email: 'official_test@pickwise.com',
    username: 'PickWiseTester',
    password: 'securePassword123'
};

async function runOfficialTest() {
    try {
        console.log('🔗 Connecting to Data Store...');
        await mongoose.connect(MONGO_URI);
        const User = require('./src/models/User');

        console.log('🧹 Purging existing test records...');
        await User.deleteMany({ email: testUser.email });

        console.log('\n🚀 [TEST 1] Registration...');
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        if (regRes.data.ok) {
            console.log('✅ Registration SUCCESS');
        } else {
            console.error('❌ Registration FAILED:', regRes.data);
            process.exit(1);
        }

        console.log('\n🔑 [TEST 2] Login Verification...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });

        if (loginRes.data.ok && loginRes.data.token) {
            console.log('✅ Login SUCCESS (Token Acquired)');
        } else {
            console.error('❌ Login FAILED:', loginRes.data);
            process.exit(1);
        }

        const token = loginRes.data.token;

        console.log('\n📡 [TEST 3] Authentication Middleware Check...');
        const meRes = await axios.get(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (meRes.data.ok && meRes.data.user.email === testUser.email) {
            console.log('✅ Auth Middleware VERIFIED');
            console.log('\n✨ ALL SECURITY SYSTEMS NORMALized! Registration and Login are 100% operational.');
        } else {
            console.error('❌ Middleware FAILED:', meRes.data);
            process.exit(1);
        }

    } catch (err) {
        console.error('\n💥 CRITICAL TEST FAILURE:', err.response?.data || err.message);
        if (err.response?.data) console.error('Full Error Data:', JSON.stringify(err.response.data, null, 2));
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

runOfficialTest();
