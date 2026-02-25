const mongoose = require('mongoose');

const UpcomingProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, unique: true },
  category: { 
    type: String, 
    enum: ['movie', 'tv', 'anime', 'videogame', 'novel'] 
  },
  releaseWindow: String, // e.g. "September 2026"
  releaseDate: Date,
  posterUrl: String,
  description: String,
  
  timeline: [{
    type: {
      type: String,
      enum: [
        'announcement', 'release_date_confirmed', 'cast_announced',
        'plot_reveal', 'trailer_release', 'teaser_release',
        'comic_con_panel', 'interview', 'delay', 'platform_confirmed',
        'first_look_images', 'director_statement', 'leak_rumor',
        'rating_prediction', 'soundtrack_announcement', 'preorder_opened'
      ],
      required: true
    },
    date: { type: Date, required: true },
    title: { type: String, required: true },
    summary: String,
    videoUrl: String, // YouTube or other video link for hover preview
    imageUrl: String, // Custom image for card (overrides default icon if no video)
    sources: [{
      name: String,
      url: String
    }]
  }],

  crossIp: [{
    title: String,
    url: String, // Full URL or relative path
    posterUrl: String,
    relationType: String
  }],

  platforms: [String], // e.g. ["PlayStation 5", "Xbox Series X"]

  popularityScore: { type: Number, default: 0 },
}, { 
  timestamps: true 
});

UpcomingProjectSchema.pre('save', function(next) {
  if (this.isModified('title') && !this.slug) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }
  next();
});

module.exports = mongoose.model('UpcomingProject', UpcomingProjectSchema);
