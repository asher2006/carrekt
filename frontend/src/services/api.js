import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
  },
});

// Predict car from image
export const predictCar = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  
  const response = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Predict car from a webcam frame blob
export const predictCameraFrame = async (imageBlob) => {
  const formData = new FormData();
  formData.append('image', imageBlob, 'camera-frame.jpg');

  const response = await api.post('/predict/camera', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 15000,
  });
  return response.data;
};

// Get all cars with optional filters
export const getCars = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.brand) params.append('brand', filters.brand);
  if (filters.fuelType) params.append('fuelType', filters.fuelType);
  if (filters.segment) params.append('segment', filters.segment);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.search) params.append('search', filters.search);
  
  const response = await api.get(`/cars?${params.toString()}`);
  return response.data;
};

// Get single car by slug
export const getCarBySlug = async (slug) => {
  const response = await api.get(`/car/${slug}`);
  return response.data;
};

// Compare cars
export const compareCars = async (slugs) => {
  const response = await api.post('/cars/compare', { slugs });
  return response.data;
};

// Get all brands
export const getBrands = async () => {
  const response = await api.get('/brands');
  return response.data;
};

export const signInWithEmail = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  return response.data;
};

export const signUpWithEmail = async (email, password, fullName) => {
  const response = await api.post('/auth/signup', { email, password, fullName });
  return response.data;
};

export const getAuthUser = async (accessToken) => {
  const response = await api.get('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  return response.data;
};

export default api;
