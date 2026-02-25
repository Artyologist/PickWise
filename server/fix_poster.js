const mongoose = require('mongoose');
const UpcomingProject = require('./src/models/UpcomingProject');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickwise";

const fix = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        const oldUrl = 'https://media-rockstargames-com.akamaized.net/tina-uploads/posts/4k5kk91475k2k4/850117ed5b81734f40447335ce5058c42b10a200.jpg';
        const newUrl = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_VI.png';
        
        const res1 = await UpcomingProject.updateMany({ posterUrl: oldUrl }, { $set: { posterUrl: newUrl } });
        const res2 = await ContentItem.updateMany({ posterUrl: oldUrl }, { $set: { posterUrl: newUrl } });
        
        console.log(`Fixed ${res1.modifiedCount} project and ${res2.modifiedCount} content items.`);
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

fix();
