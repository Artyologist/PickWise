const mongoose = require('mongoose');

const RatingSchema = new mongoose.Schema(
  {
    source: String, // imdb, tmdb, mal, rawg, google_books
    value: String,
    raw: mongoose.Schema.Types.Mixed
  },
  { _id: false }
);

const ContentItemSchema = new mongoose.Schema({
  // 🔹 Core identity
  title: { type: String, required: true, index: true },
  slug: { type: String, index: true },
  category: {
    type: String,
    required: true,
    index: true
  }, // movie, tv, anime, manga, comic, novel, videogame, documentary
 
  // 🔹 API deduplication (VERY IMPORTANT)
  source: {
    type: String,
    index: true
  }, // tmdb | mal | rawg | google_books
  externalId: {
    type: String,
    index: true
  }, // API-specific ID
  apiPage: {
    type: Number,
    default: 1
  },

  // 🔹 Cross-IP linking
  universe: {
    type: String,
    index: true
  },
  crossIp: [{
    relationType: {
      type: String,
      enum: [
        'prequel', 'sequel', 'spinoff', 'spin_off', 'same_universe', 
        'adaptation', 'based_on', 'inspired_by', 
        'documentary', 'video_game', 'game', 'novel', 'companion_work',
        'anime', 'manga', 'tv', 'comic', 'other_media'
      ]
    },
    targetId: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentItem' },
    label: String
  }],
  timelineOrder: Number,

  // 🔹 Metadata
  genres: [String],
  description: String,
  shortDescription: String,
  fullDescription: String,
  releaseDate: Date,
  year: Number,

  // 🔹 Media
  posterUrl: String,
  backdropUrl: String,

  // 🔹 People
  casts: [{ name: String, role: String, photoUrl: String }],

  // 🔹 Ratings & platforms
  ratings: [RatingSchema],
  platforms: [String],
  minimumRequirements: Object,

  // 🔹 External references
  sources: [
    {
      name: String,
      url: String,
      externalId: String
    }
  ],
  
  averageRating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },

  // 🔹 Ranking & timeline
  popularityScore: Number,
  milestones: [{ type: Object }],
}, { 
  timestamps: true 
});

/**
 * 🚫 Prevent duplicate API items
 */
ContentItemSchema.index(
  { source: 1, externalId: 1 },
  { unique: true, sparse: true }
);

/**
 * 🔍 Search index
 */
ContentItemSchema.index(
  { 'sources.name': 1, 'sources.externalId': 1 },
  { unique: true, sparse: true }
);

module.exports = mongoose.model('ContentItem', ContentItemSchema);
