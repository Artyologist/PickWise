const axios = require('axios');
const slugify = require('slugify');

const TMDB_KEY = process.env.TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';

function mapTMDB(item, category, yearField) {
  return {
    title: item.title || item.name,
    slug: slugify(item.title || item.name, { lower: true }),
    category,
    shortDescription: item.overview,
    year: item[yearField]?.slice(0, 4),
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    ratings: [{ source: 'tmdb', value: item.vote_average?.toFixed(1) }],
    popularityScore: item.popularity,
    sources: [{ name: 'tmdb', externalId: item.id }]
  };
}

async function fetchMovies({ page = 1 }) {
  const res = await axios.get(`${BASE}/discover/movie`, {
    params: { api_key: TMDB_KEY, sort_by: 'popularity.desc', page }
  });

  return {
    results: res.data.results.map(m => mapTMDB(m, 'movie', 'release_date')),
    page: res.data.page,
    totalPages: res.data.total_pages
  };
}

async function fetchTV({ page = 1 }) {
  const res = await axios.get(`${BASE}/discover/tv`, {
    params: { api_key: TMDB_KEY, sort_by: 'popularity.desc', page }
  });

  return {
    results: res.data.results.map(t => mapTMDB(t, 'tv', 'first_air_date')),
    page: res.data.page,
    totalPages: res.data.total_pages
  };
}

async function fetchDocumentaries({ page = 1 }) {
  const res = await axios.get(`${BASE}/discover/movie`, {
    params: { api_key: TMDB_KEY, with_genres: 99, page }
  });

  return {
    results: res.data.results.map(d => mapTMDB(d, 'documentary', 'release_date')),
    page: res.data.page,
    totalPages: res.data.total_pages
  };
}

module.exports = { fetchMovies, fetchTV, fetchDocumentaries };
