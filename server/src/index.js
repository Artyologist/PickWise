require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const searchRoutes = require('./routes/search');
const contentRoutes = require('./routes/content');
const authRoutes = require('./routes/auth');
const commentRoutes = require('./routes/comments');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const globalSearchRoutes = require('./routes/globalSearch');
const universeRoutes = require('./routes/universe');

const app = express();

// ✅ CORS FIRST
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ IMPORTANT: allow preflight
app.options("*", cors());

app.use(express.json());
app.use(morgan('dev'));

// ✅ rate limit AFTER cors
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150
});
app.use(limiter);

// Mongo
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';
mongoose.connect(MONGO)
  .then(() => console.log('MongoDB connected'))
  .catch(e => console.error('Mongo err', e));

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/global-search', globalSearchRoutes);
app.use('/api/universe', universeRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
