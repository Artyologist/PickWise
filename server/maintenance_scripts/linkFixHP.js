require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function linkAndFixHP() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Define HP Titles
  const hpTitles = [
    { movie: "Harry Potter and the Sorcerer's Stone", novel: "Harry Potter and the Philosopher's Stone", index: 1 },
    { movie: "Harry Potter and the Chamber of Secrets", novel: "Harry Potter and the Chamber of Secrets", index: 2 },
    { movie: "Harry Potter and the Prisoner of Azkaban", novel: "Harry Potter and the Prisoner of Azkaban", index: 3 },
    { movie: "Harry Potter and the Goblet of Fire", novel: "Harry Potter and the Goblet of Fire", index: 4 },
    { movie: "Harry Potter and the Order of the Phoenix", novel: "Harry Potter and the Order of the Phoenix", index: 5 },
    { movie: "Harry Potter and the Half-Blood Prince", novel: "Harry Potter and the Half-Blood Prince", index: 6 },
    { movie: "Harry Potter and the Deathly Hallows – Part 1", novel: "Harry Potter and the Deathly Hallows", index: 7, part: 1 },
    { movie: "Harry Potter and the Deathly Hallows – Part 2", novel: "Harry Potter and the Deathly Hallows", index: 7, part: 2 }
  ];

  const posterMapping = {
    "movie-1": "harry-potter-and-philosopher's-stone.webp",
    "movie-2": "harry-potter-and-the-chamber-of-secrets.webp",
    "movie-3": "harry-potter-and-the-prisoner-of-azkaban.webp",
    "movie-4": "harry-potter-and-goblet-of-fire.webp",
    "movie-5": "harry-potter-and-the-order-of-the-phoenix.webp",
    "movie-6": "harry-potter-and-the-half-blood-prince.webp",
    "movie-7-1": "harry-potter-and-the-deathly-hallows-part-1jpeg.webp",
    "movie-7-2": "harry-potter-and-the-deathly-hallows-part-2.webp",
    "novel-1": "harry-potter-and-philosopher's-stone-novel.jpeg",
    "novel-2": "harry-potter-and-the-chamber-of-secrets-novel.jpeg",
    "novel-3": "harry-potter-and-the-prisoner-of-azkaban-novel.jpeg",
    "novel-4": "harry-potter-and-goblet-of-fire-novel.jpeg",
    "novel-5": "harry-potter-and-the-order-of-the-phoenix-novel.jpeg",
    "novel-6": "harry-potter-and-the-half-blood-prince-novel.jpeg",
    "novel-7": "harry-potter-and-the-deathly-hallows-novel.jpeg"
  };

  const items = [];

  for (const entry of hpTitles) {
    // MOVIES
    let movie = await ContentItem.findOne({ title: entry.movie, category: 'movie' });
    if (!movie && entry.index === 1) {
       movie = await ContentItem.findOne({ title: "Harry Potter and the Philosopher's Stone", category: 'movie' });
    }
    
    if (movie) {
      movie.posterUrl = `/posters/${posterMapping[`movie-${entry.index}${entry.part ? '-' + entry.part : ''}`]}`;
      movie.crossIp = []; // Reset and rebuild
      await movie.save();
      items.push({ item: movie, index: entry.index, type: 'movie', part: entry.part });
    }

    // NOVELS
    let novel = await ContentItem.findOne({ title: entry.novel, category: 'novel' });
    if (novel) {
      novel.posterUrl = `/posters/${posterMapping[`novel-${entry.index}`]}`;
      novel.crossIp = []; // Reset and rebuild
      await novel.save();
      items.push({ item: novel, index: entry.index, type: 'novel' });
    }
  }

  // LINKING LOGIC
  for (let i = 0; i < items.length; i++) {
    const s = items[i];
    
    // Link Prequels/Sequels within same category
    for (let j = 0; j < items.length; j++) {
        const t = items[j];
        if (s.item._id.equals(t.item._id)) continue;

        // Same category (movies or novels)
        if (s.type === t.type) {
            // Sequel
            if (t.index === s.index + 1 || (s.index === 7 && s.part === 1 && t.index === 7 && t.part === 2)) {
                s.item.crossIp.push({ targetId: t.item._id, relationType: 'sequel' });
            }
            // Prequel
            if (t.index === s.index - 1 || (s.index === 7 && s.part === 2 && t.index === 7 && t.part === 1)) {
                s.item.crossIp.push({ targetId: t.item._id, relationType: 'prequel' });
            }
        }

        // Novel to Movie relation
        if (s.type === 'novel' && t.type === 'movie' && s.index === t.index) {
            s.item.crossIp.push({ targetId: t.item._id, relationType: 'adaptation' });
        }
        if (s.type === 'movie' && t.type === 'novel' && s.index === t.index) {
            s.item.crossIp.push({ targetId: t.item._id, relationType: 'novel' });
        }
    }
    await s.item.save();
  }

  console.log("HP Linking and Posters Fixed.");
  process.exit();
}

linkAndFixHP().catch(err => {
  console.error(err);
  process.exit(1);
});
