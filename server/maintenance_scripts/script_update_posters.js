require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

const posters = [
  { title: "Baldur's Gate 3", file: "baldur's-gate-3.jpg" },
  { title: "Call of Duty: Modern Warfare III", file: "call-of-duty-modern-warfare-iii.jpg" },
  { title: "Cyberpunk 2077", file: "cyberpunk-2077.png" },
  { title: "Elden Ring", file: "elden-ring.jpg" },
  { title: "Harry Potter and the Philosopher's Stone", file: "harry-potter-and-philosopher's-stone.webp", category: "movie" },
  { title: "Harry Potter and the Chamber of Secrets", file: "harry-potter-and-the-chamber-of-secrets.webp", category: "movie" },
  { title: "Harry Potter and the Prisoner of Azkaban", file: "harry-potter-and-the-prisoner-of-azkaban.webp", category: "movie" },
  { title: "Harry Potter and the Goblet of Fire", file: "harry-potter-and-goblet-of-fire.webp", category: "movie" },
  { title: "Harry Potter and the Order of the Phoenix", file: "harry-potter-and-the-order-of-the-phoenix.webp", category: "movie" },
  { title: "Harry Potter and the Half-Blood Prince", file: "harry-potter-and-the-half-blood-prince.webp", category: "movie" },
  { title: "Harry Potter and the Deathly Hallows – Part 1", file: "harry-potter-and-the-deathly-hallows-part-1jpeg.webp", category: "movie" },
  { title: "Harry Potter and the Deathly Hallows – Part 2", file: "harry-potter-and-the-deathly-hallows-part-2.webp", category: "movie" },
  { title: "Hogwarts Legacy", file: "hogwarts-legacy.webp" },
  { title: "Iron Man", file: "iron-man.webp" },
  { title: "Iron Man 2", file: "iron-man-2.webp" },
  { title: "Iron Man 3", file: "iron-man-3.webp" },
  { title: "Spider-Man: Homecoming", file: "spider-man-home-coming.webp" },
  { title: "Spider-Man: Far From Home", file: "spider-man-far-from-home.webp" },
  { title: "Spider-Man: No Way Home", file: "spider-man-no-way-home.webp" },
  { title: "The Amazing Spider-Man", file: "the-amazing-spider-man.jpg" },
  { title: "Star Wars: Episode I - The Phantom Menace", file: "star-wars-episode-i-phantom-menace.webp" },
  { title: "Star Wars: Episode II - Attack of the Clones", file: "star-wars-episode-ii-attack-of-clones.webp" },
  { title: "Star Wars: Episode III - Revenge of the Sith", file: "star-wars-episode-iii-revenge-of-the-sith.webp" },
  { title: "Star Wars: Episode IV - A New Hope", file: "star-wars-episode-iv-a-new-hope.webp" },
  { title: "Star Wars: Episode V - The Empire Strikes Back", file: "star-wars-episode-v-the-empire-strikes-back.webp" },
  { title: "Star Wars: Episode VI - Return of the Jedi", file: "star-wars-episode-vi-return-of-the-jedi.webp" },
  { title: "Star Wars: The Force Awakens", file: "star-wars-vii-the-force-awakens.jpg" },
  { title: "Star Wars: The Last Jedi", file: "star-wars-viii-the-last-jedi.jpg" },
  { title: "Star Wars: The Rise of Skywalker", file: "star-wars-ix-the-rise-of-skywalker.jpg" }
];

async function update() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Updating posters...");
  
  for (const p of posters) {
    const query = { title: { $regex: new RegExp(p.title, 'i') } };
    if (p.category) query.category = p.category;
    
    await ContentItem.updateOne(query, { posterUrl: `/posters/${p.file}` });
  }
  
  console.log("Posters updated.");
  process.exit();
}
update();
