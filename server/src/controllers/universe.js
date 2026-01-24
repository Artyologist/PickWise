const ContentItem = require('../models/ContentItem');

exports.getUniverse = async (req, res) => {
  try {
    const { slug } = req.params;

    const items = await ContentItem.find({ universe: slug })
      .sort({ timelineOrder: 1 })
      .lean();

    const grouped = items.reduce((acc, item) => {
      acc[item.category] = acc[item.category] || [];
      acc[item.category].push(item);
      return acc;
    }, {});

    res.json({ ok: true, results: grouped });
  } catch (e) {
    res.status(500).json({ ok: false });
  }
};
