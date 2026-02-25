require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
  
  const items = await ContentItem.find({ source: { $exists: true }, externalId: { $exists: true } }).lean();
  const seen = new Set();
  const dups = [];

  for (const item of items) {
     const key = `${item.source}_${item.externalId}`;
     if (seen.has(key)) {
       dups.push(item);
     }
     seen.add(key);
  }

  console.log(`Found ${dups.length} strictly source/externalId duplicates remaining.`);
  if (dups.length > 0) {
    console.log('Sample duplicates:', dups.slice(0, 5).map(d => ({ title: d.title, source: d.source, externalId: d.externalId })));
  }
  process.exit(0);
}
check();
