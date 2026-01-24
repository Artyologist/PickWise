const express = require('express');
const auth = require('../middleware/auth.middleware');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express.Router();

/* =========================
   GET MY PROFILE
========================= */
router.get('/me', auth, async (req, res) => {
  try {
    const reviewCount = await Review.countDocuments({ user: req.user._id });

    res.json({
      ok: true,
      user: {
        id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        profileImage: req.user.profileImage || '',
        reviewCount
      }
    });
  } catch (err) {
    console.error('ME ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load profile' });
  }
});

/* =========================
   GET MY REVIEWS
========================= */
router.get('/me/reviews', auth, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user._id })
      .populate('content', 'title category posterUrl')
      .sort({ createdAt: -1 });

    res.json({
      ok: true,
      results: reviews
    });
  } catch (err) {
    console.error('MY REVIEWS ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load reviews' });
  }
});

/* =========================
   GET MY STATS
========================= */
router.get('/me/stats', auth, async (req, res) => {
  try {
    const stats = await Review.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: '$content',
          avgRating: { $avg: '$rating' }
        }
      }
    ]);

    const totalReviews = await Review.countDocuments({ user: req.user._id });

    const byCategory = await Review.aggregate([
      { $match: { user: req.user._id } },
      {
        $lookup: {
          from: 'contentitems',
          localField: 'content',
          foreignField: '_id',
          as: 'content'
        }
      },
      { $unwind: '$content' },
      {
        $group: {
          _id: '$content.category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      ok: true,
      totalReviews,
      byCategory,
      averageRating:
        stats.length > 0
          ? (
              stats.reduce((a, b) => a + b.avgRating, 0) /
              stats.length
            ).toFixed(1)
          : null
    });
  } catch (err) {
    console.error('STATS ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load stats' });
  }
});


/* =========================
   PUBLIC USER PROFILE
========================= */
router.get('/:id/public', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('username profileImage');

    if (!user) {
      return res.status(404).json({ ok: false, error: 'User not found' });
    }

    const reviewCount = await Review.countDocuments({ user: user._id });

    res.json({
      ok: true,
      user: {
        id: user._id,
        username: user.username,
        profileImage: user.profileImage || '',
        reviewCount
      }
    });
  } catch (err) {
    console.error('PUBLIC PROFILE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load user' });
  }
});

module.exports = router;
