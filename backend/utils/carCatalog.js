const indianCars = require('../data/indian-cars.json');
const globalCars = require('../data/global-cars.json');
const { getCarModel } = require('../models/Car');

const localCars = [...indianCars.map((car) => ({ region: 'India', ...car })), ...globalCars];

const normalize = (value = '') => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const escapeRegex = (value = '') => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const matchesCar = (car, query) => {
  const normalized = normalize(query);
  return (
    car.slug === normalized ||
    car.ai_class_label === query ||
    normalize(car.name) === normalized ||
    normalize(`${car.brand} ${car.name}`) === normalized
  );
};

const findLocalCar = (query) => localCars.find((car) => matchesCar(car, query)) || null;

const findCar = async (query) => {
  if (!query) return null;
  const Car = getCarModel();
  if (Car) {
    const normalized = normalize(query);
    const car = await Car.findOne({
      $or: [
        { slug: normalized },
        { ai_class_label: query },
        { name: new RegExp(`^${escapeRegex(query)}$`, 'i') },
      ],
    }).lean();
    if (car) return car;
  }
  return findLocalCar(query);
};

const listCars = async (filters = {}) => {
  const Car = getCarModel();
  if (Car) {
    const query = {};
    if (filters.brand) query.brand = filters.brand;
    if (filters.region) query.region = filters.region;
    if (filters.segment) query.segment = filters.segment;
    if (filters.fuelType) query.fuel_type = new RegExp(escapeRegex(filters.fuelType), 'i');
    if (filters.search) query.name = new RegExp(escapeRegex(filters.search), 'i');
    return Car.find(query).sort({ name: 1 }).lean();
  }

  let cars = localCars;
  if (filters.brand) cars = cars.filter((c) => c.brand === filters.brand);
  if (filters.region) cars = cars.filter((c) => c.region === filters.region);
  if (filters.fuelType) cars = cars.filter((c) => c.fuel_type && c.fuel_type.toLowerCase().includes(filters.fuelType.toLowerCase()));
  if (filters.segment) cars = cars.filter((c) => c.segment === filters.segment);
  if (filters.search) cars = cars.filter((c) => c.name.toLowerCase().includes(filters.search.toLowerCase()));
  if (filters.minPrice) cars = cars.filter((c) => c.price_min >= parseInt(filters.minPrice, 10));
  if (filters.maxPrice) cars = cars.filter((c) => c.price_max <= parseInt(filters.maxPrice, 10));
  return cars.sort((a, b) => a.name.localeCompare(b.name));
};

const getBrands = async () => {
  const cars = await listCars();
  return [...new Set(cars.map((car) => car.brand))].sort();
};

module.exports = { findCar, listCars, getBrands, localCars };
