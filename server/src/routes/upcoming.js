const express = require('express');
const router = express.Router();
const UpcomingProject = require('../models/UpcomingProject');

/* =========================
   GET ALL UPCOMING
========================= */
router.get('/', async (req, res) => {
  try {
    const projects = await UpcomingProject.find().sort({ releaseDate: 1 }).lean();
    
    // Group by month
    const grouped = projects.reduce((acc, p) => {
      const month = p.releaseWindow || 'TBA';
      if (!acc[month]) acc[month] = [];
      acc[month].push(p);
      return acc;
    }, {});

    const results = Object.entries(grouped).map(([month, projects]) => ({
      month,
      projects
    }));

    res.json({ ok: true, results });
  } catch (err) {
    console.error('UPCOMING ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load upcoming projects' });
  }
});

/* =========================
   GET PROJECT DETAIL
========================= */
router.get('/:slug', async (req, res) => {
  try {
    const project = await UpcomingProject.findOne({ slug: req.params.slug }).lean();
    if (!project) return res.status(404).json({ ok: false, error: 'Project not found' });
    
    res.json({ ok: true, project });
  } catch (err) {
    console.error('PROJECT DETAIL ERROR:', err);
    res.status(500).json({ ok: false, error: 'Failed to load project details' });
  }
});

module.exports = router;
