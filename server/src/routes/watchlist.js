const express = require('express');
const router = express.Router();
const Watchlist = require('../models/Watchlist');
// The middleware exports the function directly
const verifyToken = require('../middleware/auth.middleware');

/* =========================
   GET MY WATCHLIST
========================= */
router.get('/', verifyToken, async (req, res) => {
  try {
    const items = await Watchlist.find({ user: req.user.id })
      .populate({
        path: 'content',
        select: 'title posterUrl category year ratings'
      })
      .sort({ createdAt: -1 });

    res.json({ ok: true, items });
  } catch (err) {
    console.error('WATCHLIST GET ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to get watchlist' });
  }
});

/* =========================
   ADD / UPDATE ITEM
========================= */
router.post('/:contentId', verifyToken, async (req, res) => {
  try {
    const { contentId } = req.params;
    const { status, progress, rating } = req.body;

    let item = await Watchlist.findOne({ user: req.user.id, content: contentId });

    if (item) {
      // Update existing
      if (status) item.status = status;
      if (progress !== undefined) item.progress = progress;
      if (rating !== undefined) item.rating = rating;
      await item.save();
    } else {
      // Create new
      item = await Watchlist.create({
        user: req.user.id,
        content: contentId,
        status: status || 'Plan to Watch',
        progress: progress || 0,
        rating
      });
    }

    res.json({ ok: true, item });
  } catch (err) {
    console.error('WATCHLIST UPDATE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to update watchlist' });
  }
});

/* =========================
   REMOVE ITEM
========================= */
router.delete('/:contentId', verifyToken, async (req, res) => {
  try {
    await Watchlist.findOneAndDelete({ 
      user: req.user.id, 
      content: req.params.contentId 
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('WATCHLIST DELETE ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to remove from watchlist' });
  }
});

module.exports = router;
