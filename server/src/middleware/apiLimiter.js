const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  message: {
    ok: false,
    error: 'Too many requests. Please slow down.'
  }
});
