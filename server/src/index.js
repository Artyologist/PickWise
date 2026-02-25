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
const upcomingRoutes = require('./routes/upcoming');
const watchlistRoutes = require('./routes/watchlist');
const adminRoutes = require('./routes/admin');

const app = express();

// CORS Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,            // e.g. https://pickwise.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin (Postman, Railway health checks, etc.)
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS blocked: ${origin}`));
    },
    credentials: false,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Handle preflight requests
app.options("*", cors());

app.use(express.json());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 150
});
app.use(limiter);

// Mongo
const MONGO = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pickwise';
mongoose.connect(MONGO)
  .then(() => {
    const dbName = mongoose.connection.name;
    const host = mongoose.connection.host;
    console.log('------------------------------------------');
    console.log(`✅ SUCCESS: Connected to MongoDB!`);
    console.log(`📡 DB NAME: ${dbName}`);
    console.log(`🌐 HOST: ${host}`);
    console.log('------------------------------------------');
  })
  .catch(e => {
    console.log('------------------------------------------');
    console.log(`❌ ERROR: MongoDB Connection Failed!`);
    console.log(`Reason: ${e.message}`);
    console.log('------------------------------------------');
  });

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/global-search', globalSearchRoutes);
app.use('/api/universe', universeRoutes);
app.use('/api/upcoming', upcomingRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/admin', adminRoutes);

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));