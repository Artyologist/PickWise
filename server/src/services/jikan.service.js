const axios = require('axios');
const slugify = require('slugify');

const BASE = 'https://api.jikan.moe/v4';

const JIKAN_GENRES = {
  Action: 1, Adventure: 2, Comedy: 4, Drama: 8, Fantasy: 10,
  Horror: 14, Mystery: 7, Romance: 22, 'Sci-Fi': 24,
  'Slice of Life': 36, Sports: 30, Supernatural: 37, Suspense: 41
};

function getJikanGenreIds(genres = []) {
  return genres
    .map(g => JIKAN_GENRES[g] || JIKAN_GENRES[Object.keys(JIKAN_GENRES).find(k => k.includes(g))])
    .filter(Boolean)
    .join(',');
}

async function fetchAnime({ page = 1, genres = [] }) {
  const params = { page };
  const genreIds = getJikanGenreIds(genres);
  if (genreIds) params.genres = genreIds;

  const res = await axios.get(`${BASE}/anime`, { params });

  return {
    results: (res.data.data || []).map(a => ({
      title: a.title,
      slug: slugify(a.title, { lower: true }),
      category: 'anime',
      genres: a.genres?.map(g => g.name) || [],
      shortDescription: a.synopsis,
      year: a.aired?.from?.slice(0, 4),
      posterUrl: a.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(a.score) }],
      popularityScore: a.members,
      source: 'mal',
      externalId: String(a.mal_id),
      sources: [{ name: 'mal', externalId: String(a.mal_id) }]
    })),
    page,
    totalPages: res.data.pagination?.last_visible_page || page + 1
  };
}

async function fetchManga({ page = 1, genres = [] }) {
  const params = { page };
  const genreIds = getJikanGenreIds(genres);
  if (genreIds) params.genres = genreIds;

  const res = await axios.get(`${BASE}/manga`, { params });

  return {
    results: (res.data.data || []).map(m => ({
      title: m.title,
      slug: slugify(m.title, { lower: true }),
      category: 'manga',
      genres: m.genres?.map(g => g.name) || [],
      shortDescription: m.synopsis,
      year: m.published?.from?.slice(0, 4),
      posterUrl: m.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(m.score) }],
      popularityScore: m.members,
      source: 'mal',
      externalId: String(m.mal_id),
      sources: [{ name: 'mal', externalId: String(m.mal_id) }]
    })),
    page,
    totalPages: res.data.pagination?.last_visible_page || page + 1
  };
}


async function fetchJikanDetails(id, type) {
  // type: 'anime' or 'manga'
  try {
    // Jikan has rate limits, be careful.
    // Fetch full details
    const [fullRes, relationsRes, charRes, reviewsRes] = await Promise.all([
      axios.get(`${BASE}/${type}/${id}/full`),
      axios.get(`${BASE}/${type}/${id}/relations`),
      axios.get(`${BASE}/${type}/${id}/characters`),
      axios.get(`${BASE}/${type}/${id}/reviews`)
    ]);

    const data = fullRes.data.data;
    const relations = relationsRes.data.data;
    const characters = charRes.data.data;
    const reviewsData = reviewsRes.data.data;

    // Standardize external reviews
    const externalReviews = (reviewsData || []).map(r => ({
      author: r.user?.username,
      content: r.review,
      source: 'MAL',
      url: r.url,
      rating: r.score
    }));

    // Map Jikan relations to flattened structure (compatible with RelationsSection)
    const flatRelations = [];
    if (relations) {
      relations.forEach(group => {
         group.entry.forEach(entry => {
           flatRelations.push({
             relationType: group.relation.toLowerCase(), // 'sequel', 'prequel'
             targetId: {
               title: entry.name,
               id: entry.mal_id, // external ID
               _id: null, // No local DB ID yet
               category: entry.type, // 'anime', 'manga'
               source: 'mal',
               posterUrl: null // No poster available in this endpoint
             }
           });
         });
      });
    }

    return {
      englishTitle: data.title_english,
      japaneseTitle: data.title_japanese,
      synopsis: data.synopsis,
      background: data.background,
      
      // Status & Airing
      status: data.status,
      aired: data.aired?.string,
      duration: data.duration,
      episodes: data.episodes,
      volumes: data.volumes,
      chapters: data.chapters,

      // Media
      trailer: data.trailer?.youtube_id,
      images: data.images,
      
      // Music (Anime only)
      themeSongs: type === 'anime' ? { op: data.theme?.openings, ed: data.theme?.endings } : null,
      
      // Production
      studios: data.studios,
      authors: data.authors, // for manga
      serializations: data.serializations,

      // External Reviews
      externalReviews,

      // Relations (The "Family Tree")
      relations: flatRelations,
      
      // Cast (Characters)
      characters: characters?.slice(0, 15).map(c => ({
        character: {
          name: c.character.name,
          image: c.character.images?.jpg?.image_url,
          url: c.character.url
        },
        role: c.role,
        voiceActor: c.voice_actors?.find(v => v.language === 'Japanese') || c.voice_actors?.[0]
      })) || [],
      
      // Mapped fields for frontend consistency
      cast: characters?.slice(0, 15).map(c => ({
        id: c.character.mal_id,
        name: c.character.name,
        character: c.role,
        profilePath: c.character.images?.jpg?.image_url,
        voiceActor: c.voice_actors?.find(v => v.language === 'Japanese')?.person?.name
      })) || [],

      runtime: data.duration,
      videos: data.trailer?.youtube_id ? [{ key: data.trailer.youtube_id, name: 'Trailer', site: 'YouTube' }] : [],
      production_companies: data.studios?.map(s => ({ name: s.name, id: s.mal_id })) || [],
      
      // Watch Providers (Standardized)
      watchProviders: data.streaming?.length ? {
        flatrate: data.streaming.map(s => ({
          provider_name: s.name,
          logo_path: null, // Jikan doesn't provide logos
          url: s.url
        }))
      } : null,

      streaming: data.streaming, // Where to watch
      
      // Themes & Demographics
      themes: data.themes?.map(t => t.name) || [],
      demographics: data.demographics?.map(d => d.name) || [],
      source: data.source, // e.g. "Manga", "Light novel"

      // Socials & External
      socials: {
        homepage: data.url,
        official_site: data.external?.find(e => e.name === 'Official Site')?.url,
        twitter: data.external?.find(e => e.name === 'Twitter')?.url,
        wikipedia: data.external?.find(e => e.name === 'Wikipedia')?.url
      }
    };

  } catch (error) {
    if (error.response?.status === 429) {
      console.warn('Jikan Rate Limit Hit');
      return null;
    }
    console.error(`Jikan Detail Fetch Error [${id}]:`, error.message);
    return null;
  }
}


async function searchAnime(query) {
  try {
    const res = await axios.get(`${BASE}/anime`, { params: { q: query, limit: 10 } });
    return res.data.data.map(a => ({
      title: a.title,
      slug: slugify(a.title, { lower: true }),
      category: 'anime',
      genres: a.genres?.map(g => g.name) || [],
      shortDescription: a.synopsis,
      year: a.aired?.from?.slice(0, 4),
      posterUrl: a.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(a.score) }],
      popularityScore: a.members,
      source: 'mal',
      externalId: String(a.mal_id),
      sources: [{ name: 'mal', externalId: String(a.mal_id) }]
    }));
  } catch (e) { return []; }
}

async function searchManga(query) {
  try {
    const res = await axios.get(`${BASE}/manga`, { params: { q: query, limit: 10 } });
    return res.data.data.map(m => ({
      title: m.title,
      slug: slugify(m.title, { lower: true }),
      category: 'manga',
      genres: m.genres?.map(g => g.name) || [],
      shortDescription: m.synopsis,
      year: m.published?.from?.slice(0, 4),
      posterUrl: m.images?.jpg?.image_url,
      ratings: [{ source: 'mal', value: String(m.score) }],
      popularityScore: m.members,
      source: 'mal',
      externalId: String(m.mal_id),
      sources: [{ name: 'mal', externalId: String(m.mal_id) }]
    }));
  } catch (e) { return []; }
}

module.exports = { fetchAnime, fetchManga, fetchJikanDetails, searchAnime, searchManga };
