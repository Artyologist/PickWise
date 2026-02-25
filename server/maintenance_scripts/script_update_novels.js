require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

const novelPosters = [
  { title: "Harry Potter and the Philosopher's Stone", file: "harry-potter-and-philosopher's-stone-novel.webp" },
  { title: "Harry Potter and the Chamber of Secrets", file: "harry-potter-and-the-chamber-of-secrets-novel.webp" },
  { title: "Harry Potter and the Prisoner of Azkaban", file: "harry-potter-and-the-prisoner-of-azkaban-novel.webp" },
  { title: "Harry Potter and the Goblet of Fire", file: "harry-potter-and-goblet-of-fire-novel.webp" },
  { title: "Harry Potter and the Order of the Phoenix", file: "harry-potter-and-the-order-of-the-phoenix-novel.webp" },
  { title: "Harry Potter and the Half-Blood Prince", file: "harry-potter-and-the-half-blood-prince-novel.webp" },
  { title: "Harry Potter and the Deathly Hallows", file: "harry-potter-and-the-deathly-hallows-novel.webp" }
];

async function updateNovels() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Updating novel posters...");
  
  for (const p of novelPosters) {
    await ContentItem.updateOne(
      { title: { $regex: new RegExp(`^${p.title}$`, 'i') }, category: 'novel' },
      { posterUrl: `/posters/${p.file}` }
    );
  }
  
  console.log("Novels updated.");
  process.exit();
}
updateNovels();
