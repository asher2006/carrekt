const config = require('./env');

let connectionPromise = null;
let mongoose = null;

const connectMongo = async () => {
  if (!config.mongoUri) return null;
  if (connectionPromise) return connectionPromise;

  try {
    mongoose = require('mongoose');
  } catch {
    console.warn('[WARN] MONGODB_URI is set, but mongoose is not installed. Run npm install in backend/.');
    return null;
  }

  connectionPromise = mongoose.connect(config.mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });

  await connectionPromise;
  console.log('[OK] MongoDB connected');
  return mongoose;
};

const getMongoose = () => mongoose;

module.exports = { connectMongo, getMongoose };
