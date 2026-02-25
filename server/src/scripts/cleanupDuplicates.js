require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function cleanup() {
  try {
    await mongoose.connect(MONGO);
    console.log('✅ Connected to MongoDB for cleanup');

    // Find all items
    const allItems = await ContentItem.find({}).lean();
    console.log(`Analyzing ${allItems.length} items...`);

    const seen = new Map();
    const toDelete = [];

    for (const item of allItems) {
      // Create a unique key based on title, category and year
      // Normalize title to lowercase and remove special characters for better matching
      const cleanTitle = item.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      const key = `${item.category}_${cleanTitle}_${item.year}`;

      if (seen.has(key)) {
        const existing = seen.get(key);
        
        // Decide which one to keep
        // Prefer the one with source/externalId
        if (!existing.source && item.source) {
          toDelete.push(existing._id);
          seen.set(key, item);
        } else if (existing.source && !item.source) {
          toDelete.push(item._id);
        } else {
          // Both have source or both don't, keep the older one (arbitrary)
          toDelete.push(item._id);
        }
      } else {
        seen.set(key, item);
      }
    }

    if (toDelete.length > 0) {
      console.log(`Found ${toDelete.length} duplicates. Deleting...`);
      const result = await ContentItem.deleteMany({ _id: { $in: toDelete } });
      console.log(`✅ Deleted ${result.deletedCount} items.`);
    } else {
      console.log('No duplicates found.');
    }

    // Also remove items where source/externalId are duplicates but wasn't caught by the title key
    // (though title key is pretty broad)
    
    process.exit(0);
  } catch (err) {
    console.error('Cleanup failed:', err);
    process.exit(1);
  }
}

cleanup();
