const mongoose = require('mongoose');
const ContentItem = require('./src/models/ContentItem');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function seedHarryPotter() {
  await mongoose.connect(MONGO_URI);
  console.log('🧹 Cleaning old HP data for fresh start...');
  await ContentItem.deleteMany({ title: { $regex: /Harry Potter|Fantastic Beasts|Hogwarts Legacy/i } });

  const items = [
    // 🎬 MOVIES
    { title: 'Harry Potter and the Sorcerer\'s Stone', year: 2001, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatv9rnqXmS7ioYJbp.jpg', externalId: 'hp_movie_1' },
    { title: 'Harry Potter and the Chamber of Secrets', year: 2002, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/sdEOH0YvnY7AF0sX5fU59p6H6Lx.jpg', externalId: 'hp_movie_2' },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: 2004, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/a96TzfyS9v9ONS9szF9vg1oJvWW.jpg', externalId: 'hp_movie_3' },
    { title: 'Harry Potter and the Goblet of Fire', year: 2005, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/fECBtHjSXYGRhBma9jh1RYq3S3P.jpg', externalId: 'hp_movie_4' },
    { title: 'Harry Potter and the Order of the Phoenix', year: 2007, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/599999.jpg', externalId: 'hp_movie_5' }, // Using dummy for IDs I don't know but need to be unique
    { title: 'Harry Potter and the Half-Blood Prince', year: 2009, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/z68O5p9mR5vW8fLekWvMAt7EBeW.jpg', externalId: 'hp_movie_6' },
    { title: 'Harry Potter and the Deathly Hallows – Part 1', year: 2010, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/iGoXIpFS7GlSrtvWVZ6KS0Ajz9n.jpg', externalId: 'hp_movie_7' },
    { title: 'Harry Potter and the Deathly Hallows – Part 2', year: 2011, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/daVoflF858qVat6f4lA9Yp_6vUu.jpg', externalId: 'hp_movie_8' },
    { title: 'Fantastic Beasts and Where to Find Them', year: 2016, category: 'movie', posterUrl: 'https://image.tmdb.org/t/p/w500/196PR9OCv6P3mKk4NreWAt8vD1b.jpg', externalId: 'fb_movie_1' },

    // 📚 NOVELS
    { title: 'Harry Potter and the Philosopher\'s Stone', year: 1997, category: 'novel', posterUrl: 'https://image.tmdb.org/t/p/w500/wuMc08IPKEatv9rnqXmS7ioYJbp.jpg', externalId: 'hp_book_1' },
    { title: 'Harry Potter and the Chamber of Secrets', year: 1998, category: 'novel', posterUrl: 'https://image.tmdb.org/t/p/w500/sdEOH0YvnY7AF0sX5fU59p6H6Lx.jpg', externalId: 'hp_book_2' },
    { title: 'Harry Potter and the Prisoner of Azkaban', year: 1999, category: 'novel', posterUrl: 'https://image.tmdb.org/t/p/w500/a96TzfyS9v9ONS9szF9vg1oJvWW.jpg', externalId: 'hp_book_3' },

    // 🎮 GAMES
    { title: 'Hogwarts Legacy', year: 2023, category: 'videogame', posterUrl: 'https://media.rawg.io/media/games/6cf/6cf09653066928e19e7cf930113f8983.jpg', externalId: 'hp_game_hl' },
    
    // 🎥 DOCUMENTARY
    { title: 'Harry Potter 20th Anniversary: Return to Hogwarts', year: 2022, category: 'documentary', posterUrl: 'https://image.tmdb.org/t/p/w500/7pMcAnvn8Y9Z8mYpXlp8mS9636v.jpg', externalId: 'hp_doc_1' }
  ];

  const createdItems = await ContentItem.insertMany(items.map(i => ({
    ...i,
    genres: ['Fantasy', 'Adventure'],
    source: 'seed',
    universe: 'Harry Potter'
  })));

  const poa = createdItems.find(i => i.title === 'Harry Potter and the Prisoner of Azkaban' && i.category === 'movie');
  const ss = createdItems.find(i => i.title === 'Harry Potter and the Sorcerer\'s Stone' && i.category === 'movie');
  const cos = createdItems.find(i => i.title === 'Harry Potter and the Chamber of Secrets' && i.category === 'movie');
  const gof = createdItems.find(i => i.title === 'Harry Potter and the Goblet of Fire' && i.category === 'movie');
  const hbp = createdItems.find(i => i.title === 'Harry Potter and the Half-Blood Prince' && i.category === 'movie');
  const fb1 = createdItems.find(i => i.title === 'Fantastic Beasts and Where to Find Them');
  const hl = createdItems.find(i => i.title === 'Hogwarts Legacy');
  const doc = createdItems.find(i => i.title.includes('20th Anniversary'));
  const book1 = createdItems.find(i => i.title === 'Harry Potter and the Philosopher\'s Stone' && i.category === 'novel');

  console.log('🔗 Linking POA Movie...');
  
  if (poa) {
    poa.crossIp = [
      { type: 'prequel', targetId: ss._id, label: 'Part 1' },
      { type: 'prequel', targetId: cos._id, label: 'Part 2' },
      { type: 'sequel', targetId: gof._id, label: 'Part 4' },
      { type: 'spin_off', targetId: fb1._id, label: 'Fantastic Beasts Series' },
      { type: 'video_game', targetId: hl._id, label: 'Hogwarts Legacy' },
      { type: 'documentary', targetId: doc._id, label: 'Reunion Special' },
      { type: 'adaptation', targetId: book1._id, label: 'Original Novel' }
    ];
    await poa.save();
  }

  console.log('✅ Harry Potter Universe Seeded!');
  process.exit();
}

seedHarryPotter();
