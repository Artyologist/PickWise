const ContentItem = require('../models/ContentItem');

exports.getUniverse = async (req, res) => {
  try {
    const { slug } = req.params;

    // Support both name search and exact universe match
    const items = await ContentItem.find({ 
      $or: [
        { universe: slug },
        { universe: new RegExp(slug.replace('-', ' '), 'i') }
      ]
    })
    .sort({ timelineOrder: 1, year: 1 })
    .lean();

    if (!items.length) {
      return res.status(404).json({ ok: false, error: 'Universe not found' });
    }

    // Grouping for the hub view
    const grouped = items.reduce((acc, item) => {
      const cat = item.category || 'other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {});

    res.json({ 
      ok: true, 
      universe: items[0].universe, 
      results: items,
      grouped 
    });
  } catch (e) {
    console.error('UNIVERSE ERROR:', e);
    res.status(500).json({ ok: false, error: 'Failed to load universe' });
  }
};
