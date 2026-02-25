const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Review = require('../models/Review');
const authMiddleware = require('../middleware/auth.middleware');

/* =========================
   GET MY PROFILE
========================= */
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch profile' });
  }
});

/* =========================
   UPDATE MY PROFILE
========================= */
router.put('/me', authMiddleware, async (req, res) => {
  try {
    const { username, bio, profileImage } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { username, bio, profileImage } },
      { new: true }
    ).lean();
    res.json({ ok: true, user });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to update profile' });
  }
});

/* =========================
   GET MY REVIEWS
========================= */
router.get('/me/reviews', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id })
      .populate('content', 'title posterUrl category year')
      .sort({ createdAt: -1 })
      .lean();
    res.json({ ok: true, results: reviews });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch reviews' });
  }
});

/* =========================
   GET MY STATS
========================= */
router.get('/me/stats', authMiddleware, async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.user.id });
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.json({
      ok: true,
      totalReviews: reviews.length,
      averageRating: avgRating,
      watchlistCount: 0 // TODO: implement
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: 'Failed to fetch stats' });
  }
});

module.exports = router;
