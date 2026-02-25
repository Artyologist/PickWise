const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
const UpcomingProject = require('./src/models/UpcomingProject');
require('dotenv').config();

const posterUpdates = {
  // Upcoming Projects
  "GTA VI": { file: "gta-vi.png", model: "upcoming" },
  "Avengers: Doomsday": { file: "avengers-doomsday.webp", model: "upcoming" },
  "The Odyssey (2026)": { file: "the-odyssey.webp", model: "upcoming" },
  
  // Movies
  "The Conjuring": { file: "the-conjuring.webp", model: "content" },
  "Interstellar": { file: "interstellar.webp", model: "content" },
  "It": { file: "it.png", model: "content" },
  "Dune": { file: "dune.jpeg", model: "content" },
  
  // Games
  "Call of Duty: Modern Warfare III": { file: "call-of-duty-modern-warfare-iii.jpeg", model: "content" },
  
  // Novels (make sure these go to novel category)
  "A Song of Ice and Fire": { file: "song-of-ice-and-fire.jpeg", model: "content", category: "novel" },
  "The Odyssey": { file: "the-odyssey-novel.jpeg", model: "content", category: "novel" },
  
  // Harry Potter - Movies (without -novel suffix)
  "Harry Potter and the Philosopher's Stone": { file: "harry-potter-and-philosopher's-stone.jpeg", model: "content", category: "movie" },
  "Harry Potter and the Chamber of Secrets": { file: "harry-potter-and-the-chamber-of-secrets.jpeg", model: "content", category: "movie" },
  "Harry Potter and the Prisoner of Azkaban": { file: "harry-potter-and-the-prisoner-of-azkaban.jpeg", model: "content", category: "movie" },
  "Harry Potter and the Goblet of Fire": { file: "harry-potter-and-goblet-of-fire.jpeg", model: "content", category: "movie" },
  "Harry Potter and the Order of the Phoenix": { file: "harry-potter-and-the-order-of-the-phoenix.jpeg", model: "content", category: "movie" },
  "Harry Potter and the Half-Blood Prince": { file: "harry-potter-and-the-half-blood-prince.jpeg", model: "content", category: "movie" },
};

const novelPosters = {
  // Harry Potter Novels (with -novel suffix in filename)
  "Harry Potter and the Philosopher's Stone": "harry-potter-and-philosopher's-stone-novel.jpeg",
  "Harry Potter and the Chamber of Secrets": "harry-potter-and-the-chamber-of-secrets-novel.jpeg",
  "Harry Potter and the Prisoner of Azkaban": "harry-potter-and-the-prisoner-of-azkaban-novel.jpeg",
  "Harry Potter and the Goblet of Fire": "harry-potter-and-goblet-of-fire-novel.jpeg",
  "Harry Potter and the Order of the Phoenix": "harry-potter-and-the-order-of-the-phoenix-novel.jpeg",
  "Harry Potter and the Half-Blood Prince": "harry-potter-and-the-half-blood-prince-novel.jpeg",
  "Harry Potter and the Deathly Hallows": "harry-potter-and-the-deathly-hallows-novel.jpeg",
};

async function updateAllPosters() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
  console.log('🔄 Updating all posters...\n');

  // Update regular content items
  for (const [title, config] of Object.entries(posterUpdates)) {
    if (config.model === 'content') {
      const query = { title };
      if (config.category) {
        query.category = config.category;
      }
      const res = await ContentItem.updateMany(query, { $set: { posterUrl: `/posters/${config.file}` } });
      console.log(`${res.modifiedCount > 0 ? '✅' : '⚠️ '} ${title} (${config.category || 'any'})`);
    } else if (config.model === 'upcoming') {
      const res = await UpcomingProject.updateMany({ title }, { $set: { posterUrl: `/posters/${config.file}` } });
      console.log(`${res.modifiedCount > 0 ? '✅' : '⚠️ '} ${title} (upcoming)`);
    }
  }

  // Update Harry Potter novels specifically
  console.log('\n📚 Updating Harry Potter Novels...');
  for (const [title, file] of Object.entries(novelPosters)) {
    const res = await ContentItem.updateMany(
      { title, category: 'novel' },
      { $set: { posterUrl: `/posters/${file}` } }
    );
    console.log(`${res.modifiedCount > 0 ? '✅' : '⚠️ '} ${title} (novel)`);
  }

  console.log('\n✨ Poster update complete!');
  process.exit();
}

updateAllPosters();
