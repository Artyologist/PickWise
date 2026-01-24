const axios = require('axios');
const slugify = require('slugify');

const RAWG_KEY = process.env.RAWG_KEY;
const BASE = 'https://api.rawg.io/api';

async function fetchGames({ page = 1 }) {
  if (!RAWG_KEY) {
    console.error('❌ RAWG_KEY missing');
    return { results: [], page, totalPages: page };
  }

  const res = await axios.get(`${BASE}/games`, {
    params: {
      key: RAWG_KEY,
      page,
      page_size: 20,
      ordering: '-added'
    }
  });

  const results = (res.data.results || []).map(g => ({
    title: g.name,
    slug: slugify(g.name, { lower: true }),
    category: 'videogame',
    genres: (g.genres || []).map(genre => genre.name),
    shortDescription: g.released
      ? `Released ${g.released}`
      : 'Release date unknown',
    year: g.released?.slice(0, 4),
    posterUrl: g.background_image,
    ratings: [{ source: 'rawg', value: String(g.rating || 0) }],
    popularityScore: g.added || 0,
    platforms: g.platforms?.map(p => p.platform?.name) || [],
    sources: [{ name: 'rawg', externalId: g.id }]
  }));

  return {
    results,
    page,
    totalPages: Math.ceil(res.data.count / 20)
  };
}

module.exports = { fetchGames };
