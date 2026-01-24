const ContentItem = require('../models/ContentItem');
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
exports.homeSearchController = async (req, res) => {
  try {
    let rawGenres = req.body?.genres;

    // ✅ NORMALIZE GENRES SAFELY
    if (typeof rawGenres === 'string') {
      rawGenres = rawGenres ? [rawGenres] : [];
    }

    if (!Array.isArray(rawGenres)) {
      rawGenres = [];
    }

    const genres = rawGenres
      .map(g => g.trim())
      .filter(Boolean);

    const categories = [
      'movie',
      'tv',
      'anime',
      'novel',
      'comic',
      'videogame',
      'documentary',
      'manga'
    ];

    const results = {};

    for (const category of categories) {
      const query = { category };

      // ✅ Apply genre filter ONLY if valid genres exist
      if (genres.length) {
        query.genres = { $in: genres };
      }

      results[category] = await ContentItem.find(query)
        .sort({ popularityScore: -1 })
        .limit(8)
        .select(
          'title posterUrl year category overview averageRating ratingCount'
        )
        .lean();
    }

    res.json({ ok: true, results });

  } catch (err) {
    console.error('HOME SEARCH ERROR:', err);
    res.status(500).json({ ok: false, error: 'Home search failed' });
  }
};

/* =========================
   CATEGORY SEARCH (INFINITE)
========================= */
const FETCHERS = {
  movie: fetchMovies,
  tv: fetchTV,
  documentary: fetchDocumentaries,
  anime: fetchAnime,
  manga: fetchManga,
  videogame: fetchGames,
  novel: (p) => fetchBooks({ ...p, type: 'novel' }),
  comic: (p) => fetchBooks({ ...p, type: 'comic' })
};

exports.searchController = async (req, res) => {
  try {
    const { category, page = 1, limit = 12 } = req.body;

    if (!category || !FETCHERS[category]) {
      return res.status(400).json({ ok: false, error: 'Invalid category' });
    }

    const items = await ContentItem.find({ category })
      .sort({ popularityScore: -1 })
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

    const apiData = await FETCHERS[category]({ page });

    if (!apiData?.results?.length) {
      return res.json({
        ok: true,
        results: items,
        page,
        totalPages: page
      });
    }

    const enriched = apiData.results.map(i => ({
      ...i,
      category
    }));

    await ContentItem.insertMany(enriched, { ordered: false }).catch(() => {});

    res.json({
      ok: true,
      results: [...items, ...enriched].slice(0, limit),
      page,
      totalPages: apiData.totalPages || page + 1
    });

  } catch (err) {
    console.error('SEARCH ERROR:', err);
    res.status(500).json({ ok: false, error: 'Search failed' });
  }
};
