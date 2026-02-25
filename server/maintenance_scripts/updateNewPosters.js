const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const newPosters = {
  // Movies
  "The Dark Knight": "the-dark-knight.jpeg",
  "Interstellar": "interstellar.jpeg",
  "Everything Everywhere All at Once": "everything-everywhere-all-at-once.jpeg",
  "The Conjuring": "the-conjuring.jpeg",
  "The Maze Runner": "the-maze-runner.jpeg",
  
  // TV Shows
  "Breaking Bad": "breaking-bad.jpeg",
  "Stranger Things": "stranger-things.jpeg",
  "The Bear": "the-bear.jpeg",
  
  // Games
  "Baldur's Gate 3": "baldur's-gate-3.jpeg",
  "Cyberpunk 2077": "cyberpunk-2077.jpeg",
  "Elden Ring": "elden-ring.jpeg",
  "Call of Duty: Modern Warfare 3": "call-of-duty-modern-warfare-3.jpeg",
  "Grand Theft Auto VI": "gta-vi.jpeg",
  
  // Novels
  "A Song of Ice and Fire": "a-song-of-ice-and-fire.jpeg",
  "The Odyssey": "the-odyssey.jpeg",
  "Listening": "listening.jpeg",
  "Prague: The Restless Heart of Europe": "prague-the-restless-heart-of-europe.jpeg",
  
  // Documentary
  "Planet Earth": "planet-earth.jpeg",
  
  // Harry Potter Movies
  "Harry Potter and the Sorcerer's Stone": "harry-potter-and-the-sorcerer's-stone.jpeg",
  "Harry Potter and the Philosopher's Stone": "harry-potter-and-philosopher's-stone.jpeg",
  "Harry Potter and the Chamber of Secrets": "harry-potter-and-the-chamber-of-secrets.jpeg",
  "Harry Potter and the Prisoner of Azkaban": "harry-potter-and-the-prisoner-of-azkaban.jpeg",
  "Harry Potter and the Goblet of Fire": "harry-potter-and-goblet-of-fire.jpeg",
  "Harry Potter and the Order of the Phoenix": "harry-potter-and-the-order-of-the-phoenix.jpeg",
  "Harry Potter and the Half-Blood Prince": "harry-potter-and-the-half-blood-prince.jpeg",
  "Harry Potter and the Deathly Hallows – Part 1": "harry-potter-and-the-deathly-hallows-part-1.jpeg",
  "Harry Potter and the Deathly Hallows – Part 2": "harry-potter-and-the-deathly-hallows-part-2.jpeg",
  "Harry Potter 20th Anniversary: Return to Hogwarts": "harry-potter-20th-anniversary-return-to-hogwarts.jpeg",
  
  // Harry Potter Novels
  "Harry Potter and the Philosopher's Stone": "harry-potter-and-philosopher's-stone-novel.jpeg",
  "Harry Potter and the Chamber of Secrets": "harry-potter-and-the-chamber-of-secrets-novel.jpeg",
  "Harry Potter and the Prisoner of Azkaban": "harry-potter-and-the-prisoner-of-azkaban-novel.jpeg",
  "Harry Potter and the Goblet of Fire": "harry-potter-and-goblet-of-fire-novel.jpeg",
  "Harry Potter and the Order of the Phoenix": "harry-potter-and-the-order-of-the-phoenix-novel.jpeg",
  "Harry Potter and the Half-Blood Prince": "harry-potter-and-the-half-blood-prince-novel.jpeg",
  "Harry Potter and the Deathly Hallows": "harry-potter-and-the-deathly-hallows-novel.jpeg",
  
  // Upcoming
  "Avengers: Doomsday": "avengers-doomsday.jpeg",
  "The Odyssey (2026)": "the-odyssey-2026.jpeg"
};

async function updatePosters() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise');
  console.log('Connected to DB\n');

  let updated = 0;
  let notFound = 0;

  for (const [title, file] of Object.entries(newPosters)) {
    const res = await ContentItem.updateMany(
      { title: title },
      { $set: { posterUrl: `/posters/${file}` } }
    );
    
    if (res.modifiedCount > 0) {
      console.log(`✅ Updated: ${title}`);
      updated++;
    } else {
      console.log(`⚠️  Not found: ${title}`);
      notFound++;
    }
  }

  console.log(`\n📊 Summary: ${updated} updated, ${notFound} not found`);
  process.exit();
}

updatePosters();
