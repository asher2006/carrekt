const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const crypto = require('crypto');
const config = require('../config/env');

const MAX_CACHE_SIZE = 250;
const cache = new Map();

const hashFile = (imagePath) =>
  new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(imagePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });

const getCached = (key) => {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() - cached.createdAt > config.predictionCacheTtlMs) {
    cache.delete(key);
    return null;
  }
  // LRU: move to end by re-inserting
  cache.delete(key);
  cache.set(key, cached);
  return { ...cached.value, cached: true };
};

const setCached = (key, value) => {
  // Evict oldest (first) entry if at capacity
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, { value, createdAt: Date.now() });
};

const predictWithAI = async (imagePath) => {
  try {
    const cacheKey = await hashFile(imagePath);
    const cached = getCached(cacheKey);
    if (cached) return cached;

    const form = new FormData();
    form.append('file', fs.createReadStream(imagePath));
    const response = await axios.post(`${config.aiServiceUrl}/predict`, form, {
      headers: form.getHeaders(),
      timeout: 30000,
    });
    setCached(cacheKey, response.data);
    return response.data;
  } catch (error) {
    console.error('AI Service error:', error.message);
    throw new Error('AI service unavailable');
  }
};

module.exports = { predictWithAI };

