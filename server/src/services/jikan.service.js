const axios = require('axios');
const slugify = require('slugify');

const BASE = 'https://api.jikan.moe/v4';

async function fetchAnime({ page = 1 }) {
  const res = await axios.get(`${BASE}/top/anime`, { params: { page } });

  return {
    results: res.data.data.map(a => ({
      title: a.title,
      slug: slugify(a.title, { lower: true }),
      category: 'anime',
      genres: a.genres?.map(g => g.name) || [],
      shortDescription: a.synopsis,
      year: a.aired?.from?.slice(0, 4),
      posterUrl: a.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(a.score) }],
      popularityScore: a.members,
      sources: [{ name: 'mal', externalId: a.mal_id }]
    })),
    page,
    totalPages: res.data.pagination?.last_visible_page || page + 1
  };
}

async function fetchManga({ page = 1 }) {
  const res = await axios.get(`${BASE}/top/manga`, { params: { page } });

  return {
    results: res.data.data.map(m => ({
      title: m.title,
      slug: slugify(m.title, { lower: true }),
      category: 'manga',
      genres: m.genres?.map(g => g.name) || [],
      shortDescription: m.synopsis,
      year: m.published?.from?.slice(0, 4),
      posterUrl: m.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(m.score) }],
      popularityScore: m.members,
      sources: [{ name: 'mal', externalId: m.mal_id }]
    })),
    page,
    totalPages: res.data.pagination?.last_visible_page || page + 1
  };
}

module.exports = { fetchAnime, fetchManga };
