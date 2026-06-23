const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const config = require('./config/env');
const { connectMongo } = require('./config/mongo');
const errorHandler = require('./middleware/errorHandler');
const predictRoutes = require('./routes/predict');
const carsRoutes = require('./routes/cars');
const compareRoutes = require('./routes/compare');
const authRoutes = require('./routes/auth');

const app = express();

// Ensure uploads dir
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// --- Security middleware ---
app.use(helmet());
app.use(compression());

// CORS: restrict to known origins in production
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    // Allow requests with no origin, wildcards, or any vercel subdomain
    if (
      !origin ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app')
    ) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Global rate limit: 100 requests per minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
}));

// Body parsing with size limits
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// --- Auth rate limit (stricter) ---
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 1000 : 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
});

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', mode: config.demoMode ? 'demo' : 'production', timestamp: new Date().toISOString() });
});

app.use('/api/predict', predictRoutes);
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/cars/compare', compareRoutes);
app.use('/api/cars', carsRoutes);
app.use('/api/car', carsRoutes);
app.use('/api/brands', (req, res, next) => {
  req.url = '/brands';
  carsRoutes(req, res, next);
});

// Error handler
app.use(errorHandler);

connectMongo().catch((err) => {
  console.warn(`[WARN] MongoDB unavailable, using local catalog fallback: ${err.message}`);
});

app.listen(config.port, () => {
  console.log(`\n🚗 CarRecog Backend running on http://localhost:${config.port}`);
  console.log(`   Mode: ${config.demoMode ? '🎮 DEMO (in-memory data)' : '🔗 Supabase'}`);
  console.log(`   AI Service: ${config.aiServiceUrl}\n`);
});
