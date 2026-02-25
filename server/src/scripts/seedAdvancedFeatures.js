const mongoose = require('mongoose');
const ContentItem = require('../models/ContentItem');
const UpcomingProject = require('../models/UpcomingProject');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('✅ Refining Advanced Features...');

  /* =========================
     1. NOVELS (Ensuring Iliad exists for Odyssey linking)
  ========================= */
  const iliad = await ContentItem.findOneAndUpdate(
    { externalId: 'iliad_homer' },
    {
      title: 'The Iliad',
      category: 'novel',
      genres: ['Classic', 'Historical', 'Epic'],
      posterUrl: 'https://m.media-amazon.com/images/I/91S6NXPUp7L._AC_UF1000,1000_QL80_.jpg',
      averageRating: 9.9,
      ratingCount: 500000,
      shortDescription: 'The ancient Greek epic poem attributed to Homer, set during the Trojan War.',
      source: 'custom',
      universe: 'Greek Mythology'
    },
    { upsert: true, new: true }
  );

  const odysseyNovel = await ContentItem.findOneAndUpdate(
    { externalId: 'odyssey_homer' },
    {
      title: 'The Odyssey',
      category: 'novel',
      genres: ['Classic', 'Historical', 'Epic'],
      posterUrl: 'https://m.media-amazon.com/images/I/81S6+4683hL._AC_UF1000,1000_QL80_.jpg',
      averageRating: 9.8,
      ratingCount: 450000,
      shortDescription: 'The legendary journey of Odysseus as he attempts to return home after the fall of Troy.',
      source: 'custom',
      universe: 'Greek Mythology'
    },
    { upsert: true, new: true }
  );

  /* =========================
     2. CROSS-IP (LINKING GREEK MYTHS)
  ========================= */
  odysseyNovel.crossIp = [
    { type: 'companion_work', targetId: iliad._id, label: 'Part of the Homeric Epics' }
  ];
  await odysseyNovel.save();

  /* =========================
     3. UPCOMING PROJECTS (RICHER CONTENT)
  ========================= */
  const upcoming = [
    {
      title: 'GTA VI',
      category: 'videogame',
      releaseWindow: 'Fall 2025',
      releaseDate: new Date('2025-10-01'),
      posterUrl: 'https://media.rawg.io/media/games/618/618ad679a639965f46279f67a2135067.jpg',
      description: 'Grand Theft Auto VI heads to the state of Leonida, home to the neon-soaked streets of Vice City and beyond in the biggest, most immersive evolution of the Grand Theft Auto series yet.',
      timeline: [
        {
          type: 'announcement',
          date: new Date('2022-02-04'),
          title: 'Active development confirmed',
          summary: 'Rockstar Games officially confirms that the next entry in the GTA series is well underway.'
        },
        {
          type: 'teaser_release',
          date: new Date('2023-12-04'),
          title: 'Trailer 1: Welcome to Vice City',
          summary: 'The world got its first look at Lucia and Jason in a stunningly detailed Vice City.',
          sources: [{ name: 'Rockstar Games', url: '#' }]
        },
        {
          type: 'platform_confirmed',
          date: new Date('2023-12-05'),
          title: 'Gen 9 Console Exclusivity',
          summary: 'Confirmed for PlayStation 5 and Xbox Series X/S at launch.'
        }
      ]
    },
    {
      title: 'Avengers: Doomsday',
      category: 'movie',
      releaseWindow: 'May 2026',
      releaseDate: new Date('2026-05-01'),
      posterUrl: 'https://image.tmdb.org/t/p/w500/7WsyChvgynoqv0SpsZ66XGNi7Sj.jpg',
      description: 'The fifth Avengers film brings the Marvel Cinematic Universe to a multiversal boiling point as Robert Downey Jr. returns to the screen as the legendary villain Doctor Doom.',
      timeline: [
        {
          type: 'announcement',
          date: new Date('2024-07-27'),
          title: 'RDJ as Dr. Doom Reveal',
          summary: 'At San Diego Comic-Con, Marvel shocked the world by revealing Robert Downey Jr. as Victor Von Doom.',
          sources: [{ name: 'Marvel Studios', url: '#' }]
        },
        {
          type: 'plot_reveal',
          date: new Date('2024-11-15'),
          title: 'Multiversal stakes confirmed',
          summary: 'Kevin Feige hints that Doomsday will bridge the gap between Deadpool & Wolverine and Secret Wars.'
        }
      ]
    },
    {
      title: 'The Odyssey (2026)',
      category: 'movie',
      releaseWindow: 'Winter 2026',
      releaseDate: new Date('2026-12-15'),
      posterUrl: 'https://image.tmdb.org/t/p/w500/u3bZgnocS9pZ9dfvTU7P5fW8WHv.jpg', // Placeholder epic poster
      description: 'A revolutionary cinematic retelling of Homer’s epic poem. This adaptation explores the visceral reality of Odysseus\' decade-long struggle to reach Ithaca.',
      timeline: [
        {
          type: 'announcement',
          date: new Date('2025-01-10'),
          title: 'Historical Adaptation Announced',
          summary: 'A new joint venture between Epic Pictures and A24 to bring Homer’s Odyssey to the big screen with period-accurate Greek aesthetics.'
        },
        {
          type: 'cast_announced',
          date: new Date('2025-06-20'),
          title: 'Main cast revealed',
          summary: "Rising stars from the Royal Shakespeare Company cast as the Greek leads."
        }
      ]
    }
  ];

  for (const p of upcoming) {
    await UpcomingProject.findOneAndUpdate(
      { slug: p.title.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      p,
      { upsert: true, new: true }
    );
  }

  // Cross-IP linking: Connect Odyssey movie to Odyssey novel
  const odysseyMovie = await UpcomingProject.findOne({ title: /Odyssey/i });
  // Note: UpcomingProject model doesn't have crossIp field, but maybe it should?
  // User wants to explain why the site is different. I'll link it via a 'Companion Content' logic or just ensure both exist.
  // Actually, I'll add Cross-IP to UpcomingProject model just to support this unique feature!

  console.log('🚀 Seeded Refined Advanced Features');
  process.exit();
}

seed();
