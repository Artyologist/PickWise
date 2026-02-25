const ContentItem = require('../models/ContentItem');
const { searchMulti } = require('../services/tmdb.service');
const { searchAnime, searchManga } = require('../services/jikan.service');
const { searchGames } = require('../services/rawg.service');
const { searchBooks } = require('../services/googleBooks.service');

const CATEGORIES = [
  'movie',
  'tv',
  'anime',
  'novel',
  'comic',
  'videogame',
  'documentary',
  'manga'
];

exports.globalSearchController = async (req, res) => {
  try {
    const q = (req.query.q || '').trim();

    if (!q || q.length < 2) {
      return res.json({ ok: true, results: {} });
    }

    const results = {};
    
    // 1. IMPROVED LOCAL SEARCH WITH WEIGHTED SCORING
    // We'll search across all categories in parallel
    const localSearches = CATEGORIES.map(async (category) => {
      // Find items matching query in title
      const items = await ContentItem.find({
        category,
        title: { $regex: q, $options: 'i' }
      })
      .select('title posterUrl year category averageRating popularityScore externalId source crossIp')
      .limit(10)
      .lean();

      // Simple Scoring logic
      const scoredItems = items.map(item => {
        let score = 0;
        const titleLower = item.title.toLowerCase();
        const qLower = q.toLowerCase();

        if (titleLower === qLower) score += 100;
        else if (titleLower.startsWith(qLower)) score += 50;
        else score += 10;

        // Boost by popularity
        score += (item.popularityScore || 0) / 1000;

        return { ...item, _searchScore: score };
      });

      return {
        category,
        items: scoredItems.sort((a, b) => b._searchScore - a._searchScore).slice(0, 5)
      };
    });

    const localResults = await Promise.all(localSearches);
    localResults.forEach(r => {
      results[r.category] = r.items;
    });

    const totalLocal = localResults.reduce((sum, r) => sum + r.items.length, 0);

    // 2. INTELLIGENT EXTERNAL FALLBACK
    if (totalLocal < 10) {
      const [
        tmdbRes,
        animeRes,
        mangaRes,
        gameRes,
        bookRes,
        comicRes
      ] = await Promise.allSettled([
        searchMulti(q),
        searchAnime(q),
        searchManga(q),
        searchGames(q),
        searchBooks(q, 'novel'),
        searchBooks(q, 'comic')
      ]);


      const externalData = {
        movie: tmdbRes.status === 'fulfilled' ? tmdbRes.value.movie : [],
        tv: tmdbRes.status === 'fulfilled' ? tmdbRes.value.tv : [],
        anime: animeRes.status === 'fulfilled' ? animeRes.value : [],
        manga: mangaRes.status === 'fulfilled' ? mangaRes.value : [],
        videogame: gameRes.status === 'fulfilled' ? gameRes.value : [],
        novel: bookRes.status === 'fulfilled' ? bookRes.value : [],
        comic: comicRes.status === 'fulfilled' ? comicRes.value : [],
        documentary: [] // TMDB multi doesn't easily split docs, keeping empty for now
      };

      // Merge External with Local
      for (const cat of CATEGORIES) {
        if (!externalData[cat]) continue;
        
        const existingIds = new Set(results[cat].map(i => i.externalId || i.title.toLowerCase())); // Use externalId or title as key
        
        const newItems = externalData[cat].filter(ext => {
           // Avoid duplicates (simplistic title check + ID check)
           if (ext.externalId && existingIds.has(ext.externalId)) return false;
           return !existingIds.has(ext.title.toLowerCase());
        });

        // Add up to 5 total
        results[cat] = [...results[cat], ...newItems].slice(0, 5);
      }
    }

    res.json({ ok: true, results });
  } catch (err) {
    console.error('GLOBAL SEARCH ERROR:', err);
    res.status(500).json({ ok: false, error: 'Global search failed' });
  }
};
