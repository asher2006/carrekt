require('dotenv').config({ path: '../.env' });

module.exports = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  mongoUri: process.env.MONGODB_URI || '',
  predictionCacheTtlMs: parseInt(process.env.PREDICTION_CACHE_TTL_MS || '300000', 10),
  demoMode: !process.env.SUPABASE_URL,
};
