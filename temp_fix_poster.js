const mongoose = require('mongoose');
const UpcomingProject = require('./server/src/models/UpcomingProject');
const ContentItem = require('./server/src/models/ContentItem');
require('dotenv').config({ path: './server/.env' });

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/pickwise";

const fix = async () => {
    await mongoose.connect(MONGO_URI);
    const oldUrl = 'https://media-rockstargames-com.akamaized.net/tina-uploads/posts/4k5kk91475k2k4/850117ed5b81734f40447335ce5058c42b10a200.jpg';
    const newUrl = 'https://upload.wikimedia.org/wikipedia/en/a/a5/Grand_Theft_Auto_VI.png';
    
    await UpcomingProject.updateMany({ posterUrl: oldUrl }, { $set: { posterUrl: newUrl } });
    await ContentItem.updateMany({ posterUrl: oldUrl }, { $set: { posterUrl: newUrl } });
    
    console.log('Fixed GTA Poster URLs');
    process.exit(0);
};

fix();
