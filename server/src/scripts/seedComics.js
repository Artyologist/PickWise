require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const ContentItem = require('../models/ContentItem');

const MONGO =
  process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const GOOGLE_KEY = process.env.GOOGLE_BOOKS_KEY;

const COMIC_GENRES = [
  'Superhero',
  'Manga',
  'Graphic Novel',
  'Fantasy',
  'Sci-Fi'
];

(async () => {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected (comics)');

  const res = await axios.get(
    'https://www.googleapis.com/books/v1/volumes',
    {
      params: {
        q: 'subject:comics',
        maxResults: 40,
        printType: 'books',
        key: GOOGLE_KEY
      }
    }
  );

  const comics = res.data.items
    .filter(b => b.volumeInfo?.imageLinks?.thumbnail)
    .map(b => ({
      title: b.volumeInfo.title,
      category: 'comic',
      year: b.volumeInfo.publishedDate
        ? Number(b.volumeInfo.publishedDate.slice(0, 4))
        : null,
      overview: b.volumeInfo.description || '',
      posterUrl: b.volumeInfo.imageLinks.thumbnail,
      genres:
        b.volumeInfo.categories?.slice(0, 2) ||
        [COMIC_GENRES[Math.floor(Math.random() * COMIC_GENRES.length)]],
      popularityScore: Math.random() * 100,
      averageRating: b.volumeInfo.averageRating || null,
      ratingCount: b.volumeInfo.ratingsCount || 0,
      source: 'google_books',
      externalId: String(b.id),
      sources: [{ name: 'google_books', externalId: String(b.id) }]
    }));

  await ContentItem.insertMany(comics, { ordered: false }).catch(() => {});
  console.log(`✅ Seeded ${comics.length} comics`);

  process.exit(0);
})();
