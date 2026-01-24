require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Mongo connected');

  const items = await ContentItem.find({
    $or: [{ genres: { $exists: false } }, { genres: { $size: 0 } }]
  });

  console.log(`Found ${items.length} items with missing genres`);

  for (const item of items) {
    if (!item.genres || item.genres.length === 0) {
      // fallback: category-based default
      if (item.category === 'movie') item.genres = ['General'];
      if (item.category === 'tv') item.genres = ['TV'];
      if (item.category === 'anime') item.genres = ['Anime'];
      if (item.category === 'manga') item.genres = ['Manga'];
      if (item.category === 'videogame') item.genres = ['Game'];
      if (item.category === 'novel') item.genres = ['Book'];
      if (item.category === 'comic') item.genres = ['Comic'];

      await item.save();
    }
  }

  console.log('Backfill complete');
  process.exit();
}

run();
