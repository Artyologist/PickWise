require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function testFix() {
    await mongoose.connect(process.env.MONGO_URI);
    const item = await ContentItem.findOne({ title: /Order of the Phoenix/i, category: 'movie' });
    item.crossIp = [];
    item.crossIp.push({ 
        targetId: new mongoose.Types.ObjectId(), 
        relationType: 'prequel' 
    });
    console.log("Before save:", item.crossIp[0].relationType);
    await item.save();
    const saved = await ContentItem.findById(item._id);
    console.log("After save:", saved.crossIp[0].relationType);
    process.exit();
}
testFix();
