require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const ContentItem = require('../models/ContentItem');

const TMDB_KEY = process.env.TMDB_KEY;
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  14: 'Fantasy',
  27: 'Horror',
  878: 'Sci-Fi',
  53: 'Thriller'
};

(async () => {
  await mongoose.connect(MONGO);
  console.log('✅ Mongo connected (movies)');

  const res = await axios.get(
    'https://api.themoviedb.org/3/discover/movie',
    {
      params: {
        api_key: TMDB_KEY,
        sort_by: 'popularity.desc',
        page: 1
      }
    }
  );

  const movies = res.data.results.slice(0, 40).map(m => ({
    title: m.title,
    category: 'movie',
    year: m.release_date ? Number(m.release_date.slice(0, 4)) : null,
    overview: m.overview,
    posterUrl: m.poster_path
      ? `https://image.tmdb.org/t/p/w500${m.poster_path}`
      : '',
    genres: m.genre_ids.map(id => GENRE_MAP[id]).filter(Boolean),
    popularityScore: m.popularity,
    averageRating: m.vote_average
  }));

  await ContentItem.insertMany(movies, { ordered: false }).catch(() => {});
  console.log(`✅ Seeded ${movies.length} movies`);
  process.exit(0);
})();
