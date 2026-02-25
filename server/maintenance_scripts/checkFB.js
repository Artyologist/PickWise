require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function checkFB() {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
    const fb = await ContentItem.find({ 
        title: { $regex: /Fantastic Beasts/i } 
    }).select('title posterUrl');
    console.log(JSON.stringify(fb, null, 2));
    process.exit();
}
checkFB();
