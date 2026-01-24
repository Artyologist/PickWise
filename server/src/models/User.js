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
  passwordHash: {
    type: String,
    required: true
  },
  profileImage: {
    type: String,
    default: null
  },
  reviewed: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ContentItem'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  reviewCount: {
  type: Number,
  default: 0
  },
  profileImage: {
  type: String,
  default: ''
 }
});

/* 🔐 HASH PASSWORD */
UserSchema.pre('save', async function (next) {
  if (!this.isModified('passwordHash')) return next();
  this.passwordHash = await bcrypt.hash(this.passwordHash, 10);
  next();
});

/* 🔑 COMPARE PASSWORD */
UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.passwordHash);
};

module.exports = mongoose.model('User', UserSchema);
