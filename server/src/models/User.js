const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    select: false // 🔒 Never return password in queries
  },
  profileImage: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: ''
  },
  reviewed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  }],
  watchlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  }],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewCount: {
    type: Number,
    default: 0
  }
});

/* 🔐 HASH PASSWORD */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/* 🔑 COMPARE PASSWORD */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
