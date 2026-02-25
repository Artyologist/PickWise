const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const ContentItem = require('../models/ContentItem');
const Review = require('../models/Review');

const { fetchTMDBDetails } = require('../services/tmdb.service');
const { fetchRAWGDetails } = require('../services/rawg.service');
const { fetchJikanDetails } = require('../services/jikan.service');
const { fetchGoogleBookDetails } = require('../services/googleBooks.service');



/* =========================
   IMPORT CONTENT (from Search)
========================= */
router.post('/import', async (req, res) => {
  try {
    const item = req.body;
    if (!item.externalId || !item.source) {
      return res.status(400).json({ ok: false, error: 'Invalid content data' });
    }

    const exists = await ContentItem.findOne({
      source: item.source,
      externalId: item.externalId
    });

    if (exists) {
      return res.json({ ok: true, id: exists._id });
    }

    const newItem = await ContentItem.create(item);
    res.json({ ok: true, id: newItem._id });

  } catch (err) {
    console.error('IMPORT ERROR:', err);
    res.status(500).json({ ok: false, error: 'Import failed' });
  }
});

/* =========================
   GET CONTENT DETAIL
========================= */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        ok: false,
        error: 'Invalid content id'
      });
    }

    const content = await ContentItem.findById(id)
      .populate('crossIp.targetId', 'title posterUrl year category genres ratings')
      .lean();

    if (!content) {
      return res.status(404).json({
        ok: false,
        error: 'Content not found'
      });
    }

    const reviews = await Review.find({ content: id })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .lean();

    const avgRating =
      reviews.length > 0
        ? (
            reviews.reduce((sum, r) => sum + r.rating, 0) /
            reviews.length
          ).toFixed(1)
        : null;

    res.json({
      ok: true,
      content,
      reviews,
      stats: {
        reviewCount: reviews.length,
        averageRating: avgRating
      }
    });
  } catch (err) {
    console.error('CONTENT DETAIL ERROR:', err);
    res.status(500).json({
      ok: false,
      error: 'Failed to load content'
    });
  }
});

/* =========================
   GET FULL DETAILS (LIVE)
========================= */
router.get('/:id/details', async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ ok: false, error: 'Invalid content id' });
    }
    
    // 1. Get local data to find externalId
    const content = await ContentItem.findById(id)
      .populate('crossIp.targetId', 'title posterUrl year category genres ratings')
      .lean();

    if (!content) {
      return res.status(404).json({ ok: false, error: 'Content not found' });
    }

    let externalDetails = null;

    // 2. Fetch based on source
    // content.source might be 'tmdb', 'rawg', 'mal', 'google_books'
    
    if (content.source === 'tmdb') {
        // Map category to TMDB type
        const type = content.category === 'tv' ? 'tv' : 'movie';
        // If it's a documentary, it might be a movie or tv, but usually movie in our import logic for now unless specified
        // Our service handles 'documentary' -> 'movie' mapping too.
        externalDetails = await fetchTMDBDetails(content.externalId, content.category);
    } 
    else if (content.source === 'rawg') {
        externalDetails = await fetchRAWGDetails(content.externalId);
    }
    else if (content.source === 'mal') {
        // Map category to Jikan type
        // content.category could be 'anime', 'manga', 'novel'
        const type = (content.category === 'manga' || content.category === 'novel') ? 'manga' : 'anime';
        externalDetails = await fetchJikanDetails(content.externalId, type);
    }
    else if (content.source === 'google_books') {
        externalDetails = await fetchGoogleBookDetails(content.externalId);
    }

    // 3. Get Reviews (Internal)
    const internalReviews = await Review.find({ content: id })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 })
      .lean();

    // Standardize internal reviews for the UI
    const mappedInternal = internalReviews.map(r => ({
      ...r,
      source: 'PickWise', // Prioritize PickWise branding
      isInternal: true
    }));

    // Standardize external reviews (if any)
    const mappedExternal = (externalDetails?.externalReviews || []).map(r => ({
      _id: `ext_${Math.random().toString(36).substr(2, 9)}`,
      user: { username: r.author || 'External User' },
      rating: r.rating || 0,
      text: r.content,
      source: r.source || content.source.toUpperCase(),
      createdAt: new Date(), // Mock date for external
      isInternal: false,
      url: r.url
    }));

    // 4. Merge: Internal first, then external
    const allReviews = [...mappedInternal, ...mappedExternal];

    const avgRating =
      internalReviews.length > 0
        ? (internalReviews.reduce((sum, r) => sum + r.rating, 0) / internalReviews.length).toFixed(1)
        : null;

    res.json({
        ok: true,
        content,
        external: externalDetails,
        reviews: allReviews,
        stats: {
          reviewCount: allReviews.length,
          internalReviewCount: internalReviews.length,
          averageRating: avgRating
        }
    });

  } catch (err) {
    console.error('LIVE DETAILS ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to fetch details' });
  }
});

/* =========================
   GET SIMILAR CONTENT
========================= */
router.get('/:id/similar', async (req, res) => {
  try {
    const { id } = req.params;

    const content = await ContentItem.findById(id).lean();
    if (!content) {
      return res.status(404).json({
        ok: false,
        error: 'Content not found'
      });
    }

    // First try to find similar by category AND genres
    let similar = [];
    if (content.genres && content.genres.length > 0) {
      similar = await ContentItem.find({
        _id: { $ne: id },
        category: content.category,
        genres: { $in: content.genres }
      })
        .sort({ popularityScore: -1 })
        .limit(10)
        .select('title posterUrl year category genres ratings shortDescription')
        .lean();
    }

    // Fallback to same category if no genre matches found
    if (similar.length === 0) {
      similar = await ContentItem.find({
        _id: { $ne: id },
        category: content.category
      })
        .sort({ popularityScore: -1 })
        .limit(10)
        .select('title posterUrl year category genres ratings shortDescription')
        .lean();
    }

    res.json({
      ok: true,
      results: similar
    });
  } catch (err) {
    console.error('SIMILAR CONTENT ERROR:', err);
    res.status(500).json({
      ok: false,
      error: 'Failed to load similar content'
    });
  }
});

module.exports = router;
