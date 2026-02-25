const express = require('express');
const Review = require('../models/Review');
const ContentItem = require('../models/ContentItem');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');

const router = express.Router();

/* =========================
   POST REVIEW (AUTH)
========================= */
router.post('/:contentId', auth, async (req, res) => {
  try {
    const { rating, text } = req.body;
    const { contentId } = req.params;

    if (!rating || !text) {
      return res.status(400).json({ ok: false, error: 'Missing fields' });
    }

    const content = await ContentItem.findById(contentId);
    if (!content) {
      return res.status(404).json({ ok: false, error: 'Content not found' });
    }

    // ❌ Prevent duplicate review
    const existing = await Review.findOne({
      user: req.user._id,
      content: contentId
    });

    if (existing) {
      return res.status(400).json({
        ok: false,
        error: 'You already reviewed this content'
      });
    }

    const review = await Review.create({
      user: req.user._id,
      content: contentId,
      rating,
      text
    });

    // 🔢 Update user review count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { reviewCount: 1 }
    });

    // ⭐ Recalculate content rating
    const stats = await Review.aggregate([
      { $match: { content: content._id } },
      {
        $group: {
          _id: '$content',
          avg: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      }
    ]);

    if (stats.length > 0) {
      await ContentItem.findByIdAndUpdate(content._id, {
        averageRating: stats[0].avg.toFixed(1),
        ratingCount: stats[0].count
      });
    }

    res.json({ ok: true, review });

  } catch (err) {
    console.error('CRITICAL REVIEW ERROR:', {
      message: err.message,
      stack: err.stack,
      body: req.body,
      user: req.user?._id
    });
    res.status(500).json({ 
      ok: false, 
      error: 'Review failed', 
      details: err.message 
    });
  }
});

/* =========================
   GET REVIEWS FOR CONTENT
========================= */
router.get('/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await ContentItem.findById(contentId).lean();
    if (!content) {
      return res.status(404).json({ ok: false, error: 'Content not found' });
    }

    // 1. Get Internal Reviews
    const internalReviews = await Review.find({ content: contentId })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .lean();

    const mappedInternal = internalReviews.map(r => ({
      ...r,
      source: 'PickWise',
      isInternal: true
    }));

    // 2. Mock external fetching logic (similar to content.js)
    // For a cleaner approach, these services could be moved to a shared utility
    const { fetchTMDBDetails } = require('../services/tmdb.service');
    const { fetchJikanDetails } = require('../services/jikan.service');
    const { fetchRAWGDetails } = require('../services/rawg.service');
    const { fetchGoogleBookDetails } = require('../services/googleBooks.service');

    let externalDetails = null;
    try {
      if (content.source === 'tmdb') {
        externalDetails = await fetchTMDBDetails(content.externalId, content.category);
      } else if (content.source === 'mal') {
        const type = (content.category === 'manga' || content.category === 'novel') ? 'manga' : 'anime';
        externalDetails = await fetchJikanDetails(content.externalId, type);
      } else if (content.source === 'rawg') {
        externalDetails = await fetchRAWGDetails(content.externalId);
      } else if (content.source === 'google_books') {
        externalDetails = await fetchGoogleBookDetails(content.externalId);
      }
    } catch (e) {
      console.warn("External review fetch failed:", e.message);
    }

    const mappedExternal = (externalDetails?.externalReviews || []).map(r => ({
      _id: `ext_${Math.random().toString(36).substr(2, 9)}`,
      user: { username: r.author || 'External User' },
      rating: r.rating || 0,
      text: r.content,
      source: r.source || content.source.toUpperCase(),
      createdAt: new Date(),
      isInternal: false,
      url: r.url
    }));

    const allReviews = [...mappedInternal, ...mappedExternal];

    res.json({ ok: true, reviews: allReviews });
  } catch (err) {
    console.error("GET REVIEWS ERROR:", err);
    res.status(500).json({ ok: false, error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
