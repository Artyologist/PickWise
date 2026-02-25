const ContentItem = require('../models/ContentItem');
const UpcomingProject = require('../models/UpcomingProject');
const {
  fetchMovies,
  fetchTV,
  fetchDocumentaries
} = require('../services/tmdb.service');
const { fetchAnime, fetchManga } = require('../services/jikan.service');
const { fetchGames } = require('../services/rawg.service');
const { fetchBooks } = require('../services/googleBooks.service');

/* =========================
   HOME MULTI-CATEGORY SEARCH
========================= */
const FETCHERS = {
  movie:       (p) => fetchMovies(p),
  tv:          (p) => fetchTV(p),
  documentary: (p) => fetchDocumentaries(p),
  anime:       (p) => fetchAnime(p),
  manga:       (p) => fetchManga(p),
  videogame:   (p) => fetchGames(p),
  novel:       (p) => fetchBooks({ ...p, type: 'novel' }),
  comic:       (p) => fetchBooks({ ...p, type: 'comic' })
};

// Categories using Jikan (rate-limited, must be sequential)
const JIKAN_CATEGORIES = new Set(['anime', 'manga']);

exports.homeSearchController = async (req, res) => {
  try {
    let rawGenres = req.body?.genres;
    const isSync = req.body?.sync === true;

    if (typeof rawGenres === 'string') rawGenres = rawGenres ? [rawGenres] : [];
    if (!Array.isArray(rawGenres)) rawGenres = [];
    const genres = rawGenres.map(g => g.trim()).filter(Boolean);

    const categories = ['movie', 'tv', 'anime', 'novel', 'comic', 'videogame', 'documentary', 'manga'];

    // ─── MODE 1: PAGE LOAD ───────────────────────────────────────────────────
    // Only fetch trending from DB for the hero section. No API calls.
    if (!isSync) {
      const trending = await ContentItem.find({
        description: { $exists: true, $ne: "" },
        posterUrl: { $exists: true, $ne: "/placeholder-poster.png" }
      })
        .sort({ popularityScore: -1 })
        .limit(10)
        .select('_id externalId title posterUrl year category averageRating popularityScore universe shortDescription')
        .lean();

      return res.json({
        ok: true,
        results: {},     // No category results on page load
        trending,
        upcoming: [],
        recent: [],
        spotlight: [],
        recommended: { hiddenGems: [], universeGems: [] }
      });
    }

    // ─── MODE 2: INTELLIGENCE SYNC ───────────────────────────────────────────
    // Called only when user clicks "Update Intelligence". Fetches live from APIs.
    const results = {};

    for (const category of categories) {
      try {
        // Jikan has a strict rate limit — add a delay before calling it
        if (JIKAN_CATEGORIES.has(category)) {
          await new Promise(r => setTimeout(r, 700));
        }

        const apiData = await FETCHERS[category]({ page: 1, genres });
        const items = (apiData?.results || []).filter(i => i.title && i.posterUrl);
        results[category] = items;

        // Save to DB silently in background (don't await — keep response fast)
        if (items.length) {
          ContentItem.insertMany(items.map(i => ({ ...i, category })), { ordered: false })
            .catch(() => {}); // Silently ignore duplicate errors
        }
      } catch (err) {
        console.warn(`[Intelligence] Failed to fetch ${category}:`, err.message);
        results[category] = [];
      }
    }

    // Still provide trending for the hero (from DB — fast)
    const trending = await ContentItem.find({
      description: { $exists: true, $ne: "" },
      posterUrl: { $exists: true, $ne: "/placeholder-poster.png" }
    })
      .sort({ popularityScore: -1 })
      .limit(10)
      .select('_id externalId title posterUrl year category averageRating popularityScore universe shortDescription')
      .lean();

    return res.json({
      ok: true,
      results,
      trending,
      upcoming: [],
      recent: [],
      spotlight: [],
      recommended: { hiddenGems: [], universeGems: [] }
    });

  } catch (err) {
    console.error('HOME SEARCH ERROR:', err);
    res.status(500).json({ ok: false, error: 'Home search failed' });
  }
};


/* =========================
   CATEGORY SEARCH (INFINITE)
========================= */

exports.searchController = async (req, res) => {
  try {
    let { category, page = 1, limit = 12, genres = [] } = req.body;

    // Handle aliases
    if (category === 'game') category = 'videogame';

    if (!category || !FETCHERS[category]) {
      return res.status(400).json({ ok: false, error: 'Invalid category' });
    }

    const query = { category };

    if (genres && genres.length) {
      query.genres = { $in: genres };
    }

    const items = await ContentItem.find(query)
      .sort({ averageRating: -1, popularityScore: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    if (items.length === limit) {
      return res.json({
        ok: true,
        results: items,
        page,
        totalPages: page + 1
      });
    }

    // 🔹 Fallback to External API
    // Pass genres to fetcher for narrowed results
    const apiData = await FETCHERS[category]({ page, genres });

    if (!apiData?.results?.length) {
      return res.json({
        ok: true,
        results: items,
        page,
        totalPages: page
      });
    }

    let enriched = apiData.results.map(i => ({
      ...i,
      category
    }));

    // 🔹 Upsert / Insert
    // We strive to return ITEMS WITH _id.
    const externalIds = enriched.map(i => i.externalId).filter(Boolean);
    
    if (externalIds.length > 0) {
       // Insert (ignore dups)
       await ContentItem.insertMany(enriched, { ordered: false }).catch(() => {});
       
       // Re-fetch from DB to get _ids
       const dbItems = await ContentItem.find({
         category,
         externalId: { $in: externalIds }
       }).lean();

       // Merge DB items into our response list, preferring DB version
       const dbMap = new Map(dbItems.map(i => [i.externalId, i]));
       
       // Replace enriched items with DB items (which have _id)
       enriched = enriched.map(i => dbMap.get(i.externalId) || i);
    }

    // 🔹 Deduplicate vs existing 'items'
    const existingIds = new Set(items.map(i => `${i.source}_${i.externalId}`));
    const uniqueEnriched = enriched.filter(i => !existingIds.has(`${i.source}_${i.externalId}`));

    res.json({
      ok: true,
      results: [...items, ...uniqueEnriched].slice(0, limit),
      page,
      totalPages: apiData.totalPages || page + 1
    });

  } catch (err) {
    console.error('SEARCH ERROR:', err);
    res.json({ ok: false, error: 'Search failed', results: [] }); 
  }
};
