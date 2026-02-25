const axios = require('axios');
const slugify = require('slugify');

const RAWG_KEY = process.env.RAWG_KEY;
const BASE = 'https://api.rawg.io/api';

const GENRE_MAP = {
  'Action': 'action',
  'Adventure': 'adventure',
  'RPG': 'role-playing-games-rpg',
  'Strategy': 'strategy',
  'Shooter': 'shooter',
  'FPS': 'shooter',
  'Puzzle': 'puzzle',
  'Racing': 'racing',
  'Sports': 'sports',
  'Simulation': 'simulation',
  'Arcade': 'arcade',
  'Casual': 'casual',
  'Indie': 'indie',
  'Family': 'family',
  'Fighting': 'fighting',
  'Card': 'card',
  'Educational': 'educational',
  'Board Games': 'board-games'
};

async function fetchGames({ page = 1, genres = [] }) {
  if (!RAWG_KEY) {
    console.error('❌ RAWG_KEY missing');
    return { results: [], page, totalPages: page };
  }

  const params = {
    key: RAWG_KEY,
    page,
    page_size: 20,
    ordering: '-added'
  };

  if (genres.length) {
    const slugs = genres
      .map(g => GENRE_MAP[g] || slugify(g, { lower: true }))
      .join(',');
    params.genres = slugs;
  }

  const res = await axios.get(`${BASE}/games`, { params });

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
    source: 'rawg',
    externalId: String(g.id),
    sources: [{ name: 'rawg', externalId: String(g.id) }]
  }));

  return {
    results,
    page,
    totalPages: Math.ceil(res.data.count / 20)
  };
}


async function fetchRAWGDetails(id) {
  if (!RAWG_KEY) return null;

  try {
    // Resilient fetch using Promise.allSettled
    const results = await Promise.allSettled([
      axios.get(`${BASE}/games/${id}`, { params: { key: RAWG_KEY } }),
      axios.get(`${BASE}/games/${id}/screenshots`, { params: { key: RAWG_KEY } }),
      axios.get(`${BASE}/games/${id}/movies`, { params: { key: RAWG_KEY } }),
      axios.get(`${BASE}/games/${id}/additions`, { params: { key: RAWG_KEY } }),
      axios.get(`${BASE}/games/${id}/game-series`, { params: { key: RAWG_KEY } }),
      axios.get(`${BASE}/games/${id}/development-team`, { params: { key: RAWG_KEY } })
    ]);

    const detailsRes = results[0].status === 'fulfilled' ? results[0].value : null;
    const screensRes = results[1].status === 'fulfilled' ? results[1].value : null;
    const moviesRes = results[2].status === 'fulfilled' ? results[2].value : null;
    const dlcRes = results[3].status === 'fulfilled' ? results[3].value : null;
    const teamRes = results[5].status === 'fulfilled' ? results[5].value : null;

    if (!detailsRes) {
      throw new Error("Main Game Details Not Found");
    }

    const data = detailsRes.data;

    return {
      description_raw: data.description_raw,
      metacritic: data.metacritic,
      released: data.released,
      website: data.website,
      posterUrl: data.background_image,
      // System Requirements
      platforms: data.platforms?.map(p => ({
        name: p.platform.name,
        requirements: p.requirements
      })) || [],

      // Developers & Publishers
      developers: data.developers || [],
      publishers: data.publishers || [],

      // Media
      screenshots: screensRes?.data?.results?.map(s => s.image) || [],
      movies: moviesRes?.data?.results?.map(m => m.data?.max || m.data?.['480']) || [],

      // DLCs
      dlcs: dlcRes?.data?.results?.map(d => ({
        name: d.name,
        released: d.released,
        image: d.background_image
      })) || [],

      // Cast & Crew (mapped from development team)
      cast: teamRes?.data?.results?.slice(0, 15).map(c => ({
        id: c.id,
        name: c.name,
        character: c.positions?.map(p => p.name).join(', '),
        profilePath: c.image
      })) || [],

      // Stores
      stores: data.stores?.map(s => ({
        store: s.store?.name,
        url: s.url,
        domain: s.store?.domain
      })) || [],

      esrb_rating: data.esrb_rating,
      playtime: data.playtime,
      genres: data.genres?.map(g => g.name) || [],
      tags: data.tags?.map(t => t.name) || [],

      // Series
      series: results[4]?.status === 'fulfilled' ? results[4].value.data.results.map(s => ({
        name: s.name,
        released: s.released,
        image: s.background_image,
        externalId: String(s.id)
      })) : []
    };

  } catch (error) {
    console.error(`RAWG Detail Fetch Error [${id}]:`, error.message);
    if (error.response) {
        console.error("Status:", error.response.status);
        console.error("URL:", error.config?.url);
    }
    return null;
  }
}


async function searchGames(query) {
  if (!RAWG_KEY) return [];
  const params = { key: RAWG_KEY, search: query, page_size: 10 };
  
  const res = await axios.get(`${BASE}/games`, { params });
  
  return (res.data.results || []).map(g => ({
    title: g.name,
    slug: slugify(g.name, { lower: true }),
    category: 'videogame',
    genres: (g.genres || []).map(genre => genre.name),
    shortDescription: g.released ? `Released ${g.released}` : 'Release date unknown',
    year: g.released?.slice(0, 4),
    posterUrl: g.background_image,
    ratings: [{ source: 'rawg', value: String(g.rating || 0) }],
    popularityScore: g.added || 0,
    platforms: g.platforms?.map(p => p.platform?.name) || [],
    source: 'rawg',
    externalId: String(g.id),
    sources: [{ name: 'rawg', externalId: String(g.id) }]
  }));
}

module.exports = { fetchGames, fetchRAWGDetails, searchGames };
