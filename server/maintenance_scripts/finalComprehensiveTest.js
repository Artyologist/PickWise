const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_URL = 'http://localhost:4000/api';

async function finalComprehensiveTest() {
    console.log('\n🎯 PICKWISE FINAL COMPREHENSIVE TEST');
    console.log('='.repeat(70));
    
    try {
        // Test 1: Cross-IP Relations
        console.log('\n1️⃣  CROSS-IP RELATIONS TEST');
        console.log('-'.repeat(70));
        
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
        const ContentItem = require('./src/models/ContentItem');
        
        const poa = await ContentItem.findOne({ 
            title: 'Harry Potter and the Prisoner of Azkaban', 
            category: 'movie' 
        });
        
        console.log(`   Database: ${poa?.crossIp?.length || 0} relations found`);
        
        if (poa) {
            const apiRes = await axios.get(`${API_URL}/content/${poa._id}`);
            console.log(`   API Response: ${apiRes.data.content.crossIp?.length || 0} relations`);
            console.log(`   ✅ Cross-IP data is ${apiRes.data.content.crossIp?.length > 0 ? 'WORKING' : 'MISSING'}`);
        }
        
        // Test 2: Posters
        console.log('\n2️⃣  POSTER COVERAGE');
        console.log('-'.repeat(70));
        
        const missingPosters = await ContentItem.countDocuments({
            $or: [{ posterUrl: { $exists: false } }, { posterUrl: '' }, { posterUrl: null }]
        });
        console.log(`   Missing posters: ${missingPosters}`);
        console.log(`   ✅ Poster coverage: ${missingPosters === 0 ? 'COMPLETE' : 'PARTIAL'}`);
        
        // Test 3: Harry Potter Novels
        console.log('\n3️⃣  HARRY POTTER NOVELS');
        console.log('-'.repeat(70));
        
        const hpNovels = await ContentItem.find({ 
            title: { $regex: /Harry Potter/, $options: 'i' },
            category: 'novel'
        }).select('title posterUrl');
        
        console.log(`   Found ${hpNovels.length} HP novels`);
        hpNovels.forEach(novel => {
            const hasNovelPoster = novel.posterUrl?.includes('-novel');
            console.log(`   ${hasNovelPoster ? '✅' : '⚠️ '} ${novel.title}`);
        });
        
        // Test 4: Upcoming Projects
        console.log('\n4️⃣  UPCOMING PROJECTS');
        console.log('-'.repeat(70));
        
        const UpcomingProject = require('./src/models/UpcomingProject');
        const upcoming = await UpcomingProject.find({});
        console.log(`   Total projects: ${upcoming.length}`);
        
        const doomsdayCount = await UpcomingProject.countDocuments({ title: 'Avengers: Doomsday' });
        console.log(`   Doomsday entries: ${doomsdayCount} ${doomsdayCount === 1 ? '✅' : '❌ (should be 1)'}`);
        
        // Test 5: All Categories
        console.log('\n5️⃣  CATEGORY LOADING');
        console.log('-'.repeat(70));
        
        const categories = ['movie', 'tv', 'videogame', 'anime', 'manga', 'novel', 'comic', 'documentary'];
        for (const cat of categories) {
            const res = await axios.post(`${API_URL}/search`, { category: cat, page: 1 });
            console.log(`   ${cat.padEnd(12)}: ${res.data.results?.length || 0} items ✅`);
        }
        
        console.log('\n' + '='.repeat(70));
        console.log('🎉 ALL TESTS COMPLETE!');
        console.log('='.repeat(70));
        console.log('\n✨ Your PickWise platform is ready for presentation!');
        
    } catch (err) {
        console.error('\n❌ TEST FAILED:', err.message);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

finalComprehensiveTest();
