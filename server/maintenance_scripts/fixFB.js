require('dotenv').config();
const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');

async function addFantasticBeasts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  const fbItems = [
    {
        title: "Fantastic Beasts: The Crimes of Grindelwald",
        category: "movie",
        year: "2018",
        description: "Newt Scamander is enlisted by Albus Dumbledore to thwart Gellert Grindelwald's plans.",
        posterUrl: "/posters/fantastic-beasts-the-crimes-of-grindelwald.webp",
        genres: ["Fantasy", "Adventure"],
        ratings: { tmdb: 4.0, userAvg: 3.5 }
    },
    {
        title: "Fantastic Beasts: The Secrets of Dumbledore",
        category: "movie",
        year: "2022",
        description: "Professor Albus Dumbledore knows the powerful Dark wizard Gellert Grindelwald is moving to seize control of the wizarding world.",
        posterUrl: "/posters/fantastic-beasts-the-secrets-of-dumbledore.webp",
        genres: ["Fantasy", "Adventure"],
        ratings: { tmdb: 4.2, userAvg: 4.0 }
    }
  ];

  for (const item of fbItems) {
    const exists = await ContentItem.findOne({ title: item.title, category: 'movie' });
    if (!exists) {
        await ContentItem.create(item);
        console.log(`Created FB movie: ${item.title}`);
    }
  }

  // LINKING
  const fb1 = await ContentItem.findOne({ title: "Fantastic Beasts and Where to Find Them", category: 'movie' });
  const fb2 = await ContentItem.findOne({ title: "Fantastic Beasts: The Crimes of Grindelwald", category: 'movie' });
  const fb3 = await ContentItem.findOne({ title: "Fantastic Beasts: The Secrets of Dumbledore", category: 'movie' });
  const hp1 = await ContentItem.findOne({ title: /Philosopher's Stone/i, category: 'movie' }) || await ContentItem.findOne({ title: /Sorcerer's Stone/i, category: 'movie' });

  if (fb1 && fb2) {
      fb1.crossIp = [{ targetId: fb2._id, relationType: 'sequel' }];
      fb2.crossIp = [{ targetId: fb1._id, relationType: 'prequel' }];
      if (fb3) fb2.crossIp.push({ targetId: fb3._id, relationType: 'sequel' });
      await fb1.save();
      await fb2.save();
  }
  if (fb3) {
      fb3.crossIp = [{ targetId: fb2._id, relationType: 'prequel' }];
      await fb3.save();
  }

  // Link FB1 to HP1 as spinoff/prequel
  if (fb1 && hp1) {
      fb1.crossIp.push({ targetId: hp1._id, relationType: 'spinoff' });
      hp1.crossIp.push({ targetId: fb1._id, relationType: 'spinoff' });
      await fb1.save();
      await hp1.save();
  }

  console.log("Fantastic Beasts Fixed and Linked.");
  process.exit();
}

addFantasticBeasts().catch(err => {
  console.error(err);
  process.exit(1);
});
