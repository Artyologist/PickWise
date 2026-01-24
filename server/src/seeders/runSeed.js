require('dotenv').config();
console.log('TMDB_KEY LOADED =', process.env.TMDB_KEY);
const mongoose = require('mongoose');
const slugify = require('slugify');
const axios = require('axios');
const ContentItem = require('../models/ContentItem');

const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function connect() {
  await mongoose.connect(MONGO, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('connected to mongo for seeding');
}

function buildItemFromTMDBMovie(m) {
  return {
    title: m.title || m.name,
    slug: slugify(m.title || m.name || 'item', { lower: true }),
    category: 'movie',
    genres: (m.genre_names) ? m.genre_names : [],
    shortDescription: m.overview || '',
    fullDescription: m.overview || '',
    releaseDate: m.release_date ? new Date(m.release_date) : null,
    year: m.release_date ? new Date(m.release_date).getFullYear() : null,
    posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
    backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/w780${m.backdrop_path}` : '',
    ratings: [{ source: 'tmdb', value: m.vote_average?.toString() || '' }],
    popularityScore: m.popularity || 0,
    sources: [{ name: 'tmdb', url: `https://www.themoviedb.org/movie/${m.id}`, externalId: m.id }]
  };
}

async function seedMock() {
  const mock = [
    {
      title: 'Orion: A Sci-Fi Short',
      slug: 'orion-a-sci-fi-short',
      category: 'movie',
      genres: ['Sci-Fi', 'Adventure'],
      shortDescription: 'A quick sci-fi adventure across a dying star.',
      fullDescription: 'Orion is a short sci-fi film about a crew racing to harvest a dying star...',
      releaseDate: new Date('2021-05-17'),
      year: 2021,
      posterUrl: 'https://placehold.co/300x450?text=Orion',
      ratings: [{ source: 'imdb', value: '7.9' }, { source: 'rotten_tomatoes', value: '88%' }],
      popularityScore: 78
    },
    {
      title: 'Starfall - Anime OVA',
      slug: 'starfall-anime-ova',
      category: 'anime',
      genres: ['Sci-Fi', 'Action'],
      shortDescription: 'An OVA about starship ace pilots.',
      fullDescription: 'Starfall follows an ace team through space conflicts...',
      releaseDate: new Date('2019-09-01'),
      year: 2019,
      posterUrl: 'https://placehold.co/300x450?text=Starfall',
      ratings: [{ source: 'mal', value: '8.1' }],
      popularityScore: 62
    },
    {
      title: 'Eternal Blade (Game)',
      slug: 'eternal-blade-game',
      category: 'videogame',
      genres: ['Action', 'RPG', 'Adventure'],
      shortDescription: 'Action RPG with deep lore.',
      fullDescription: 'Eternal Blade is a story-driven action RPG with cinematic combat...',
      releaseDate: new Date('2023-11-01'),
      year: 2023,
      posterUrl: 'https://placehold.co/300x450?text=Eternal+Blade',
      platforms: ['PC', 'PS5'],
      minimumRequirements: { os: 'Windows 10', cpu: 'i5', ram: '8GB', gpu: 'GTX 1060' },
      ratings: [{ source: 'steam', value: '9/10' }],
      popularityScore: 90
    }
  ];

  await ContentItem.deleteMany({});
  await ContentItem.insertMany(mock);
  console.log('seeded mock content');
}

async function seedFromAPIs() {
  // Try TMDb (movies), Jikan (anime/manga), RAWG (games)
  const TMDB_KEY = process.env.TMDB_KEY;
  const RAWG_KEY = process.env.RAWG_KEY;
  const JIKAN_BASE = 'https://api.jikan.moe/v4';

  if (!TMDB_KEY && !RAWG_KEY) {
    console.log('No TMDB_KEY or RAWG_KEY in env - creating only mock seed');
    await seedMock();
    return;
  }

  const created = [];

  // small TMDB fetch (if key present)
  if (TMDB_KEY) {
    try {
      const discover = await axios.get('https://api.themoviedb.org/3/discover/movie', {
        params: { api_key: TMDB_KEY, sort_by: 'popularity.desc', page: 1 }
      });
      const movies = (discover.data.results || []).slice(0, 5);
      for (const m of movies) {
        // fetch genre names
        const movieWithDetails = {
          ...m,
          genre_names: (m.genre_ids || []).map(gid => gid.toString())
        };
        created.push(buildItemFromTMDBMovie(movieWithDetails));
      }
      console.log('fetched movies from TMDB');
    } catch (e) {
      console.warn('TMDB fetch failed', e.message);
    }
  }

  // RAWG games
  if (RAWG_KEY) {
    try {
      const g = await axios.get('https://api.rawg.io/api/games', {
        params: { key: RAWG_KEY, page_size: 5 }
      });
      for (const ga of g.data.results || []) {
        created.push({
          title: ga.name,
          slug: slugify(ga.name || 'game', { lower: true }),
          category: 'videogame',
          genres: (ga.genres || []).map(x => x.name),
          shortDescription: ga.released ? `Released ${ga.released}` : '',
          fullDescription: ga.description_raw || '',
          releaseDate: ga.released ? new Date(ga.released) : null,
          year: ga.released ? new Date(ga.released).getFullYear() : null,
          posterUrl: ga.background_image || '',
          platforms: (ga.platforms || []).map(p => p.platform?.name),
          ratings: ga.rating ? [{ source: 'rawg', value: ga.rating.toString() }] : [],
          popularityScore: ga.added || 0,
          sources: [{ name: 'rawg', url: ga.url || '', externalId: ga.id }]
        });
      }
      console.log('fetched games from RAWG');
    } catch (e) {
      console.warn('RAWG fetch failed', e.message);
    }
  }

  // Jikan anime sample
  try {
    const j = await axios.get(`${JIKAN_BASE}/top/anime`);
    const top = j.data.data.slice(0,3);
    for (const a of top) {
      created.push({
        title: a.title,
        slug: slugify(a.title, { lower: true }),
        category: 'anime',
        genres: (a.genres || []).map(g => g.name),
        shortDescription: a.synopsis || '',
        fullDescription: a.synopsis || '',
        year: a.aired?.from ? new Date(a.aired.from).getFullYear() : null,
        posterUrl: a.images?.jpg?.image_url || '',
        ratings: [{ source: 'mal', value: a.score?.toString() || '' }],
        popularityScore: a.members || 0,
        sources: [{ name: 'mal', url: a.url, externalId: a.mal_id }]
      });
    }
    console.log('fetched anime from Jikan');
  } catch (e) {
    console.warn('Jikan fetch failed', e.message);
  }

  // Persist: combine with mock if less than a few records
  if (created.length < 3) {
    console.log('not enough API results, adding mock seed');
    await seedMock();
    return;
  }

  await ContentItem.deleteMany({});
  await ContentItem.insertMany(created);
  console.log('seeded content from APIs (partial)');
}

(async () => {
  try {
    await connect();
    await seedFromAPIs();
    process.exit(0);
  } catch (e) {
    console.error('Seeder failed', e);
    process.exit(1);
  }
})();
