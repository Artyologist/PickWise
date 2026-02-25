const express = require('express');
const router = express.Router();
const ContentItem = require('../models/ContentItem');
const User = require('../models/User');
const auth = require('../middleware/auth.middleware');
const admin = require('../middleware/admin.js');

// Protect all admin routes
router.use(auth, admin);

// GET STATS
router.get('/stats', async (req, res) => {
    try {
        const contentCount = await ContentItem.countDocuments();
        const userCount = await User.countDocuments();
        const categoryStats = await ContentItem.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);

        res.json({
            ok: true,
            stats: {
                contentCount,
                userCount,
                categoryStats
            }
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// LIST ALL CONTENT (with pagination)
router.get('/content', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        const items = await ContentItem.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('title category source externalId createdAt');

        const total = await ContentItem.countDocuments();

        res.json({
            ok: true,
            items,
            total,
            pages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// DELETE CONTENT
router.delete('/content/:id', async (req, res) => {
    try {
        await ContentItem.findByIdAndDelete(req.params.id);
        res.json({ ok: true, message: 'Item deleted' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

module.exports = router;
