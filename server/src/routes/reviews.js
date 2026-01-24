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

    await ContentItem.findByIdAndUpdate(content._id, {
      averageRating: stats[0].avg,
      ratingCount: stats[0].count
    });

    res.json({ ok: true, review });

  } catch (err) {
    console.error('REVIEW ERROR:', err);
    res.status(500).json({ ok: false, error: 'Review failed' });
  }
});

/* =========================
   GET REVIEWS FOR CONTENT
========================= */
router.get('/:contentId', async (req, res) => {
  try {
    const reviews = await Review.find({
      content: req.params.contentId
    })
      .populate('user', 'username profileImage')
      .sort({ createdAt: -1 });

    res.json({ ok: true, reviews });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch reviews' });
  }
});

module.exports = router;
