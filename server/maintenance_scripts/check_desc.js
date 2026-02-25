require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function checkDesc() {
    await mongoose.connect(process.env.MONGO_URI);
    const items = await ContentItem.find({ 
        description: { $in: [null, ""] },
        title: { $regex: /Star Wars|Iron Man|Spider-Man/i }
    });
    console.log(items.map(i => i.title));
    process.exit();
}
checkDesc();
