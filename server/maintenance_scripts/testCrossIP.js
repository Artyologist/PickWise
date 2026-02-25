require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
const axios = require('axios');

async function testCrossIP() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
    
    console.log('🔍 Testing Cross-IP Relations\n');
    console.log('='.repeat(60));
    
    // Find POA
    const poa = await ContentItem.findOne({ 
        title: 'Harry Potter and the Prisoner of Azkaban', 
        category: 'movie' 
    }).populate('crossIp.targetId');
    
    if (!poa) {
        console.log('❌ POA not found in database');
        process.exit();
    }
    
    console.log(`\n✅ Found: ${poa.title}`);
    console.log(`   ID: ${poa._id}`);
    console.log(`   Cross-IP Relations: ${poa.crossIp?.length || 0}\n`);
    
    if (poa.crossIp && poa.crossIp.length > 0) {
        console.log('📋 Relations List:');
        poa.crossIp.forEach((rel, i) => {
            console.log(`   ${i+1}. [${rel.type}] ${rel.targetId?.title} (${rel.targetId?.category}) - ${rel.label}`);
        });
    } else {
        console.log('⚠️  No Cross-IP relations found!');
    }
    
    // Test API endpoint
    console.log('\n' + '='.repeat(60));
    console.log('🌐 Testing API Endpoint\n');
    
    try {
        const res = await axios.get(`http://localhost:4000/api/content/${poa._id}`);
        console.log(`✅ API Response OK: ${res.data.ok}`);
        console.log(`   Relations in API: ${res.data.content.crossIp?.length || 0}`);
        
        if (res.data.content.crossIp && res.data.content.crossIp.length > 0) {
            console.log('\n📋 API Relations:');
            res.data.content.crossIp.forEach((rel, i) => {
                console.log(`   ${i+1}. [${rel.type}] ${rel.targetId?.title}`);
            });
        }
    } catch (err) {
        console.log(`❌ API Error: ${err.message}`);
    }
    
    console.log('\n' + '='.repeat(60));
    process.exit();
}

testCrossIP();
