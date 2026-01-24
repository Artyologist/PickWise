const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');


router.post('/', async (req, res) => {
  try {
    const { userId, contentItemId, text } = req.body;
    if (!contentItemId || !text) return res.status(400).json({ ok:false, error:'missing' });
    const c = await Comment.create({ user: userId, contentItem: contentItemId, text });
    res.json({ ok:true, comment: c });
  } catch (e) {
    res.status(500).json({ ok:false, error:'server' });
  }
});


router.get('/', async (req, res) => {
  try {
    const { contentId } = req.query;
    if (!contentId) return res.status(400).json({ ok:false, error: 'missing contentId' });
    const comments = await Comment.find({ contentItem: contentId }).sort({ createdAt: -1 }).lean();
    res.json({ ok:true, comments });
  } catch (e) {
    res.status(500).json({ ok:false, error:'server' });
  }
});

module.exports = router;
