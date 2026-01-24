const ContentItem = require('../models/ContentItem');

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

    if (!q) {
      return res.json({ ok: true, results: {} });
    }

    const regex = new RegExp(q, 'i');
    const results = {};

    for (const category of CATEGORIES) {
      results[category] = await ContentItem.find({
        category,
        title: regex
      })
        .sort({ popularityScore: -1 })
        .limit(5)
        .select(
          'title posterUrl year category overview averageRating'
        )
        .lean();
    }

    res.json({ ok: true, results });
  } catch (err) {
    console.error('GLOBAL SEARCH ERROR:', err);
    res.status(500).json({ ok: false, error: 'Global search failed' });
  }
};
