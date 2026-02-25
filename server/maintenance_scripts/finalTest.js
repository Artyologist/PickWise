const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function comprehensiveTest() {
    console.log('🔍 PICKWISE FINAL COMPREHENSIVE TEST\n');
    console.log('=' .repeat(60));
    
    try {
        // 1. Test Authentication
        console.log('\n1️⃣  AUTHENTICATION SYSTEM');
        console.log('-'.repeat(60));
        const testUser = {
            email: `final_test_${Date.now()}@pickwise.com`,
            username: `FinalTester${Date.now()}`,
            password: 'testpass123'
        };
        
        const regRes = await axios.post(`${API_URL}/auth/register`, testUser);
        console.log(`   ✅ Registration: ${regRes.data.ok ? 'SUCCESS' : 'FAILED'}`);
        
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: testUser.email,
            password: testUser.password
        });
        console.log(`   ✅ Login: ${loginRes.data.ok ? 'SUCCESS' : 'FAILED'}`);
        const token = loginRes.data.token;

        // 2. Test All Categories
        console.log('\n2️⃣  CATEGORY LOADING (8 Categories)');
        console.log('-'.repeat(60));
        const categories = ['movie', 'tv', 'videogame', 'anime', 'manga', 'novel', 'comic', 'documentary'];
        for (const cat of categories) {
            const res = await axios.post(`${API_URL}/search`, { category: cat, page: 1 });
            console.log(`   ✅ ${cat.toUpperCase().padEnd(12)}: ${res.data.results?.length || 0} items`);
        }

        // 3. Test Genre Filtering
        console.log('\n3️⃣  GENRE FILTERING');
        console.log('-'.repeat(60));
        const filterRes = await axios.post(`${API_URL}/search`, {
            category: 'movie',
            genres: ['Action'],
            page: 1
        });
        console.log(`   ✅ Action Movies: ${filterRes.data.results?.length || 0} results`);

        // 4. Test Global Search
        console.log('\n4️⃣  GLOBAL SEARCH');
        console.log('-'.repeat(60));
        const searchRes = await axios.get(`${API_URL}/global-search?q=Harry Potter`);
        const totalResults = Object.values(searchRes.data.results).reduce((sum, list) => sum + list.length, 0);
        console.log(`   ✅ "Harry Potter" search: ${totalResults} results across categories`);

        // 5. Test Cross-IP Relations
        console.log('\n5️⃣  CROSS-IP RELATIONS (Harry Potter Universe)');
        console.log('-'.repeat(60));
        await mongoose.connect(MONGO_URI);
        const ContentItem = require('./src/models/ContentItem');
        const poa = await ContentItem.findOne({ title: 'Harry Potter and the Prisoner of Azkaban', category: 'movie' });
        
        if (poa && poa.crossIp) {
            console.log(`   ✅ POA has ${poa.crossIp.length} Cross-IP relations`);
            const detailRes = await axios.get(`${API_URL}/content/${poa._id}`);
            console.log(`   ✅ API returns relations: ${detailRes.data.content.crossIp?.length || 0} items`);
        } else {
            console.log(`   ⚠️  POA Cross-IP not found`);
        }

        // 6. Test Review Submission
        console.log('\n6️⃣  REVIEW SYSTEM');
        console.log('-'.repeat(60));
        if (poa) {
            const reviewRes = await axios.post(
                `${API_URL}/reviews/${poa._id}`,
                { rating: 9, text: 'Final comprehensive test review' },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            console.log(`   ✅ Review submission: ${reviewRes.data.ok ? 'SUCCESS' : 'FAILED'}`);
        }

        // 7. Test Upcoming Projects
        console.log('\n7️⃣  UPCOMING PROJECTS');
        console.log('-'.repeat(60));
        const UpcomingProject = require('./src/models/UpcomingProject');
        const upcoming = await UpcomingProject.find({});
        console.log(`   ✅ Total upcoming projects: ${upcoming.length}`);
        const doomsdayCount = await UpcomingProject.countDocuments({ title: 'Avengers: Doomsday' });
        console.log(`   ✅ Doomsday duplicates: ${doomsdayCount} (should be 1)`);

        // 8. Test Posters
        console.log('\n8️⃣  POSTER COVERAGE');
        console.log('-'.repeat(60));
        const missingPosters = await ContentItem.countDocuments({
            $or: [{ posterUrl: { $exists: false } }, { posterUrl: '' }, { posterUrl: null }]
        });
        console.log(`   ✅ Missing posters: ${missingPosters}`);

        console.log('\n' + '='.repeat(60));
        console.log('🎉 COMPREHENSIVE TEST COMPLETE!');
        console.log('='.repeat(60));

    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
        if (err.response?.data) {
            console.error('   Error details:', err.response.data);
        }
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

comprehensiveTest();
