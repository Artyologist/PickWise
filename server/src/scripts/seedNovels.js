require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const ContentItem = require('../models/ContentItem');

const MONGO =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const GOOGLE_KEY = process.env.GOOGLE_BOOKS_KEY;

const GENRE_MAP = [
  'Fantasy',
  'Science Fiction',
  'Drama',
  'Romance',
  'Horror',
  'Adventure'
];

(async () => {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected (novels)');

  const res = await axios.get(
    'https://www.googleapis.com/books/v1/volumes',
    {
      params: {
        q: 'fiction',
        maxResults: 40,
        printType: 'books',
        key: GOOGLE_KEY
      }
    }
  );

  const novels = res.data.items
    .filter(b => b.volumeInfo?.imageLinks?.thumbnail)
    .map(b => ({
      title: b.volumeInfo.title,
      category: 'novel',
      year: b.volumeInfo.publishedDate
        ? Number(b.volumeInfo.publishedDate.slice(0, 4))
        : null,
      overview: b.volumeInfo.description || '',
      posterUrl: b.volumeInfo.imageLinks.thumbnail,
      genres:
        b.volumeInfo.categories?.slice(0, 2) ||
        [GENRE_MAP[Math.floor(Math.random() * GENRE_MAP.length)]],
      popularityScore: Math.random() * 100,
      averageRating: b.volumeInfo.averageRating || null,
      ratingCount: b.volumeInfo.ratingsCount || 0
    }));

  await ContentItem.insertMany(novels, { ordered: false }).catch(() => {});
  console.log(`✅ Seeded ${novels.length} novels`);

  process.exit(0);
})();
