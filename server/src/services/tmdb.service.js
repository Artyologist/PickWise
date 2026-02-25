const axios = require('axios');
const slugify = require('slugify');

const TMDB_KEY = process.env.TMDB_KEY;
const BASE = 'https://api.themoviedb.org/3';

const GENRE_IDS = {
  Action: 28, Adventure: 12, Animation: 16, Comedy: 35, Crime: 80, 
  Documentary: 99, Drama: 18, Family: 10751, Fantasy: 14, History: 36, 
  Horror: 27, Music: 10402, Mystery: 9648, Romance: 10749, 
  'Sci-Fi': 878, 'Science Fiction': 878, Thriller: 53, War: 10752, Western: 37,
  'Action & Adventure': 10759, Kids: 10762, News: 10763, Reality: 10764,
  'Sci-Fi & Fantasy': 10765, Soap: 10766, Talk: 10767, 'War & Politics': 10768
};

const GENRE_NAMES = Object.fromEntries(Object.entries(GENRE_IDS).map(([k, v]) => [v, k]));

function mapTMDB(item, category, yearField) {
  return {
    title: item.title || item.name,
    slug: slugify(item.title || item.name, { lower: true }),
    category,
    genres: (item.genre_ids || []).map(id => GENRE_NAMES[id]).filter(Boolean),
    shortDescription: item.overview,
    year: item[yearField]?.slice(0, 4),
    posterUrl: item.poster_path
      ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
      : null,
    ratings: [{ source: 'tmdb', value: item.vote_average?.toFixed(1) }],
    popularityScore: item.popularity,
    source: 'tmdb',
    externalId: String(item.id),
    sources: [{ name: 'tmdb', externalId: String(item.id) }]
  };
}

function getGenreIds(genres) {
  return genres
    .map(g => GENRE_IDS[g] || GENRE_IDS[Object.keys(GENRE_IDS).find(k => k.includes(g))])
    .filter(Boolean)
    .join('|');
}

async function fetchMovies({ page = 1, genres = [] }) {
  const params = { api_key: TMDB_KEY, sort_by: 'popularity.desc', page };
  if (genres.length) params.with_genres = getGenreIds(genres);

  const res = await axios.get(`${BASE}/discover/movie`, { params });

  return {
    results: res.data.results.map(m => mapTMDB(m, 'movie', 'release_date')),
    page: res.data.page,
    totalPages: res.data.total_pages
  };
}

async function fetchTV({ page = 1, genres = [] }) {
  const params = { api_key: TMDB_KEY, sort_by: 'popularity.desc', page };
  if (genres.length) params.with_genres = getGenreIds(genres);

  const res = await axios.get(`${BASE}/discover/tv`, { params });

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


async function fetchTMDBDetails(id, type) {
  // 'movie' or 'tv'
  const endpoint = type === 'documentary' ? 'movie' : type;
    const params = {
    api_key: TMDB_KEY,
    append_to_response: 'credits,videos,recommendations,similar,release_dates,content_ratings,external_ids,watch/providers,keywords,reviews'
  };

  try {
    const res = await axios.get(`${BASE}/${endpoint}/${id}`, { params });
    const data = res.data;

    // Standardize external reviews
    const externalReviews = (data.reviews?.results || []).map(r => ({
      author: r.author,
      content: r.content,
      source: 'TMDB',
      url: r.url,
      rating: r.author_details?.rating
    }));

    // Normalization
    return {
      tagline: data.tagline,
      budget: data.budget,
      revenue: data.revenue,
      runtime: data.runtime || (data.episode_run_time ? data.episode_run_time[0] : null),
      status: data.status,
      posterUrl: data.poster_path ? `https://image.tmdb.org/t/p/w500${data.poster_path}` : null,
      production_companies: data.production_companies,
      // Networks for TV
      networks: data.networks,
      
      // External Reviews
      externalReviews,

      // Cast & Crew
      cast: data.credits?.cast?.slice(0, 15).map(c => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      })) || [],
      crew: data.credits?.crew?.slice(0, 10).map(c => ({
        id: c.id,
        name: c.name,
        job: c.job,
        profilePath: c.profile_path ? `https://image.tmdb.org/t/p/w185${c.profile_path}` : null
      })) || [],

      // Media
      videos: data.videos?.results?.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser' || v.type === 'Featurette')) || [],
      backdropUrl: data.backdrop_path ? `https://image.tmdb.org/t/p/original${data.backdrop_path}` : null,
      
      // Recommendations & Similar
      recommendations: data.recommendations?.results?.slice(0, 10).map(item => mapTMDB(item, type === 'tv' ? 'tv' : 'movie', type === 'tv' ? 'first_air_date' : 'release_date')) || [],
      similar: data.similar?.results?.slice(0, 10).map(item => mapTMDB(item, type === 'tv' ? 'tv' : 'movie', type === 'tv' ? 'first_air_date' : 'release_date')) || [],

      // Keywords
      keywords: (data.keywords?.keywords || data.keywords?.results || []).map(k => k.name),

      // Certifications
      certification: getCertification(data, type),
      
      collection: data.belongs_to_collection,
      imdbId: data.external_ids?.imdb_id,
      homepage: data.homepage,
      
      // Watch Providers (US)
      watchProviders: data['watch/providers']?.results?.US || null,
      
      // Seasons (TV Only)
      seasons: type === 'tv' ? data.seasons : null,

      // Socials & External
      socials: {
        imdb_id: data.external_ids?.imdb_id,
        facebook_id: data.external_ids?.facebook_id,
        instagram_id: data.external_ids?.instagram_id,
        twitter_id: data.external_ids?.twitter_id,
        homepage: data.homepage
      }
    };
  } catch (error) {
    console.error(`TMDB Detail Fetch Error [${id}]:`, error.message);
    return null;
  }
}

function getCertification(data, type) {
  if (type === 'movie' || type === 'documentary') {
    const releases = data.release_dates?.results?.find(r => r.iso_3166_1 === 'US');
    return releases?.release_dates?.find(d => d.certification)?.certification || null;
  } else if (type === 'tv') {
    const ratings = data.content_ratings?.results?.find(r => r.iso_3166_1 === 'US');
    return ratings?.rating || null;
  }
  return null;
}


async function searchMulti(query) {
  const params = { api_key: TMDB_KEY, query, include_adult: false };
  const res = await axios.get(`${BASE}/search/multi`, { params });
  
  const movieResults = [];
  const tvResults = [];

  res.data.results.forEach(item => {
    if (item.media_type === 'movie') movieResults.push(mapTMDB(item, 'movie', 'release_date'));
    if (item.media_type === 'tv') tvResults.push(mapTMDB(item, 'tv', 'first_air_date'));
  });

  return { movie: movieResults, tv: tvResults };
}

module.exports = { fetchMovies, fetchTV, fetchDocumentaries, fetchTMDBDetails, searchMulti };
