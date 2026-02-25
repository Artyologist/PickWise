require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

const hpData = [
  // MOVIES
  { title: "Harry Potter and the Philosopher's Stone", category: "movie", poster: "harry-potter-and-philosopher's-stone.webp" },
  { title: "Harry Potter and the Sorcerer's Stone", category: "movie", poster: "harry-potter-and-philosopher's-stone.webp" },
  { title: "Harry Potter and the Chamber of Secrets", category: "movie", poster: "harry-potter-and-the-chamber-of-secrets.webp" },
  { title: "Harry Potter and the Prisoner of Azkaban", category: "movie", poster: "harry-potter-and-the-prisoner-of-azkaban.webp" },
  { title: "Harry Potter and the Goblet of Fire", category: "movie", poster: "harry-potter-and-goblet-of-fire.webp" },
  { title: "Harry Potter and the Order of the Phoenix", category: "movie", poster: "harry-potter-and-the-order-of-the-phoenix.webp" },
  { title: "Harry Potter and the Half-Blood Prince", category: "movie", poster: "harry-potter-and-the-half-blood-prince.webp" },
  { title: "Harry Potter and the Deathly Hallows – Part 1", category: "movie", poster: "harry-potter-and-the-deathly-hallows-part-1jpeg.webp" },
  { title: "Harry Potter and the Deathly Hallows: Part 1", category: "movie", poster: "harry-potter-and-the-deathly-hallows-part-1jpeg.webp" },
  { title: "Harry Potter and the Deathly Hallows – Part 2", category: "movie", poster: "harry-potter-and-the-deathly-hallows-part-2.webp" },
  { title: "Harry Potter and the Deathly Hallows: Part 2", category: "movie", poster: "harry-potter-and-the-deathly-hallows-part-2.webp" },

  // NOVELS
  { title: "Harry Potter and the Philosopher's Stone", category: "novel", poster: "harry-potter-and-philosopher's-stone-novel.jpeg" },
  { title: "Harry Potter and the Chamber of Secrets", category: "novel", poster: "harry-potter-and-the-chamber-of-secrets-novel.jpeg" },
  { title: "Harry Potter and the Prisoner of Azkaban", category: "novel", poster: "harry-potter-and-the-prisoner-of-azkaban-novel.jpeg" },
  { title: "Harry Potter and the Goblet of Fire", category: "novel", poster: "harry-potter-and-goblet-of-fire-novel.jpeg" },
  { title: "Harry Potter and the Order of the Phoenix", category: "novel", poster: "harry-potter-and-the-order-of-the-phoenix-novel.jpeg" },
  { title: "Harry Potter and the Half-Blood Prince", category: "novel", poster: "harry-potter-and-the-half-blood-prince-novel.jpeg" },
  { title: "Harry Potter and the Deathly Hallows", category: "novel", poster: "harry-potter-and-the-deathly-hallows-novel.jpeg" }
];

async function cleanupAndFix() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  for (const item of hpData) {
    console.log(`Processing: ${item.title} (${item.category})`);
    
    // Find all matches for this title and category
    const matches = await ContentItem.find({
      title: item.title,
      category: item.category
    });

    if (matches.length > 0) {
      // Keep the first one and update it
      const primaryItem = matches[0];
      primaryItem.posterUrl = `/posters/${item.poster}`;
      await primaryItem.save();
      console.log(`  Updated primary item: ${primaryItem._id}`);

      // Delete the others if they are duplicates
      if (matches.length > 1) {
        const idsToDelete = matches.slice(1).map(m => m._id);
        await ContentItem.deleteMany({ _id: { $in: idsToDelete } });
        console.log(`  Deleted ${idsToDelete.length} duplicates`);
      }
    } else {
      console.log(`  No match found for ${item.title}`);
    }
  }

  // Final cleanup: Merge "Sorcerer's Stone" movie into "Philosopher's Stone" movie if both exist
  const philStone = await ContentItem.findOne({ title: "Harry Potter and the Philosopher's Stone", category: "movie" });
  const sorcStone = await ContentItem.findOne({ title: "Harry Potter and the Sorcerer's Stone", category: "movie" });

  if (philStone && sorcStone) {
    console.log("Merging Sorcerer's Stone into Philosopher's Stone...");
    // Keep Philosopher's Stone as primary
    await ContentItem.deleteOne({ _id: sorcStone._id });
  }

  // Handle Deathly Hallows colon vs dash variants
  const dh1Dash = await ContentItem.findOne({ title: "Harry Potter and the Deathly Hallows – Part 1", category: "movie" });
  const dh1Colon = await ContentItem.findOne({ title: "Harry Potter and the Deathly Hallows: Part 1", category: "movie" });

  if (dh1Dash && dh1Colon) {
    console.log("Merging Deathly Hallows Part 1 variants...");
    await ContentItem.deleteOne({ _id: dh1Colon._id });
  }

  const dh2Dash = await ContentItem.findOne({ title: "Harry Potter and the Deathly Hallows – Part 2", category: "movie" });
  const dh2Colon = await ContentItem.findOne({ title: "Harry Potter and the Deathly Hallows: Part 2", category: "movie" });

  if (dh2Dash && dh2Colon) {
    console.log("Merging Deathly Hallows Part 2 variants...");
    await ContentItem.deleteOne({ _id: dh2Colon._id });
  }

  console.log("Cleanup and fix complete.");
  process.exit();
}

cleanupAndFix().catch(err => {
  console.error(err);
  process.exit(1);
});
