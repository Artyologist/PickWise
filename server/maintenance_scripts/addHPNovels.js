require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function addMissingNovels() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const missingNovels = [
    {
      title: "Harry Potter and the Goblet of Fire",
      category: "novel",
      year: "2000",
      description: "Harry faces the Triwizard Tournament and the return of Lord Voldemort.",
      posterUrl: "/posters/harry-potter-and-goblet-of-fire-novel.jpeg",
      genres: ["Fantasy", "Young Adult", "Adventure"],
      ratings: { tmdb: 4.8, userAvg: 4.9 }
    },
    {
      title: "Harry Potter and the Order of the Phoenix",
      category: "novel",
      year: "2003",
      description: "Harry forms Dumbledore's Army to fight the Ministry's interference and Voldemort's return.",
      posterUrl: "/posters/harry-potter-and-the-order-of-the-phoenix-novel.jpeg",
      genres: ["Fantasy", "Young Adult", "Dystopian"],
      ratings: { tmdb: 4.7, userAvg: 4.8 }
    },
    {
      title: "Harry Potter and the Half-Blood Prince",
      category: "novel",
      year: "2005",
      description: "Harry learns about Voldemort's past and prepares for the final battle.",
      posterUrl: "/posters/harry-potter-and-the-half-blood-prince-novel.jpeg",
      genres: ["Fantasy", "Young Adult", "Mystery"],
      ratings: { tmdb: 4.9, userAvg: 4.9 }
    },
    {
      title: "Harry Potter and the Deathly Hallows",
      category: "novel",
      year: "2007",
      description: "The final battle between Harry and Lord Voldemort.",
      posterUrl: "/posters/harry-potter-and-the-deathly-hallows-novel.jpeg",
      genres: ["Fantasy", "Young Adult", "Action"],
      ratings: { tmdb: 4.9, userAvg: 5.0 }
    }
  ];

  for (const novel of missingNovels) {
    const exists = await ContentItem.findOne({ title: novel.title, category: 'novel' });
    if (!exists) {
      await ContentItem.create(novel);
      console.log(`Created novel: ${novel.title}`);
    } else {
        exists.posterUrl = novel.posterUrl;
        await exists.save();
        console.log(`Updated novel poster: ${novel.title}`);
    }
  }

  // Fix Return to Hogwarts extension
  const doc = await ContentItem.findOne({ title: /Return to Hogwarts/i });
  if (doc) {
    doc.posterUrl = "/posters/harry-potter-20th-anniversary-return-to-hogwarts.jpg";
    await doc.save();
    console.log("Fixed Return to Hogwarts poster extension.");
  }

  console.log("Missing Novels Added.");
  process.exit();
}

addMissingNovels().catch(err => {
  console.error(err);
  process.exit(1);
});
