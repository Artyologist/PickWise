require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const ContentItem = require('../models/ContentItem');

const TMDB_KEY = process.env.TMDB_KEY;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const GENRE_MAP = {
  10759: 'Action',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10765: 'Sci-Fi',
  9648: 'Mystery'
};

(async () => {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected (tv)');

  const res = await axios.get(
    'https://api.themoviedb.org/3/discover/tv',
    {
      params: {
        api_key: TMDB_KEY,
        sort_by: 'popularity.desc',
        page: 1
      }
    }
  );

  const shows = res.data.results.slice(0, 40).map(t => ({
    title: t.name,
    category: 'tv',
    year: t.first_air_date ? Number(t.first_air_date.slice(0, 4)) : null,
    overview: t.overview,
    posterUrl: t.poster_path
      ? `https://image.tmdb.org/t/p/w500${t.poster_path}`
      : '',
    genres: t.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean),
    popularityScore: t.popularity,
    averageRating: t.vote_average,
    source: 'tmdb',
    externalId: String(t.id),
    sources: [{ name: 'tmdb', externalId: String(t.id) }]
  }));

  await ContentItem.insertMany(shows, { ordered: false }).catch(() => {});
  console.log(`✅ Seeded ${shows.length} TV shows`);
  process.exit(0);
})();
