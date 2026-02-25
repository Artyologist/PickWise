const mongoose = require('mongoose');

const WatchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: mongoose.Schema.Types.ObjectId, ref: 'ContentItem', required: true },
  status: {
    type: String,
    // Unified status list for all media types
    enum: [
      'Plan to Watch', 
      'Watching', 
      'Completed', 
      'Dropped', 
      'On Hold', 
      'Playing', 
      'Beaten', 
      'Reading'
    ],
    default: 'Plan to Watch'
  },
  progress: { type: Number, default: 0 }, // Generic progress tracker (episodes, percent, etc)
  rating: { type: Number },
  createdAt: { type: Date, default: Date.now }
});

// Ensure a user can only add a content item once
WatchlistSchema.index({ user: 1, content: 1 }, { unique: true });

module.exports = mongoose.model('Watchlist', WatchlistSchema);
