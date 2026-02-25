require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

(async () => {
    try {
        await mongoose.connect(MONGO);
        const items = await ContentItem.find({ 
            $or: [
                { posterUrl: { $exists: false } }, 
                { posterUrl: "" }, 
                { posterUrl: null }
            ] 
        }).select('title category').sort('category');

        console.log(`FOUND ${items.length} ITEMS MISSING POSTERS:\n`);
        
        let currentCat = '';
        items.forEach((item, index) => {
            if (item.category !== currentCat) {
                currentCat = item.category;
                console.log(`\n--- ${currentCat.toUpperCase()} ---`);
            }
            console.log(`${index + 1}. ${item.title}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
