const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const UPDATES = [
    { title: 'Elden Ring', externalId: 'elden-ring' },
    { title: 'God of War Ragnarok', externalId: 'god-of-war-ragnarok' },
    { title: 'God of War', externalId: 'god-of-war-2' } // The 2018 one is often god-of-war-2 or 58175
];

async function run() {
  try {
    await mongoose.connect(MONGO);
    
    for (const u of UPDATES) {
        const item = await ContentItem.findOne({ title: { $regex: u.title, $options: 'i' } });
        if (item) {
            console.log(`Updating ${item.title}: ${item.externalId} -> ${u.externalId}`);
            item.externalId = u.externalId;
            await item.save();
        } else {
            console.log(`Item not found: ${u.title}`);
        }
    }
    
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
