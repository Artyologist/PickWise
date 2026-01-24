const express = require('express');
const mongoose = require('mongoose');
const router = express.Router();

const ContentItem = require('../models/ContentItem');
const Review = require('../models/Review');

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

    const content = await ContentItem.findById(id).lean();
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

    const similar = await ContentItem.find({
      _id: { $ne: id },
      category: content.category,
      genres: { $in: content.genres }
    })
      .sort({ popularityScore: -1 })
      .limit(10)
      .select('title posterUrl year category')
      .lean();

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
