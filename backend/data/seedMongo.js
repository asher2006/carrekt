const { connectMongo } = require('../config/mongo');
const { getCarModel } = require('../models/Car');
const indianCars = require('./indian-cars.json');
const globalCars = require('./global-cars.json');

const normalizeCar = (car) => ({
  ...car,
  region: car.region || 'India',
  specs: car.specs || {
    engine: car.engine,
    mileage: car.mileage,
    fuel: car.fuel_type,
    transmission: car.transmission,
  },
});

const seed = async () => {
  await connectMongo();
  const Car = getCarModel();
  if (!Car) {
    throw new Error('MongoDB is not configured. Set MONGODB_URI in .env.');
  }

  const cars = [...indianCars, ...globalCars].map(normalizeCar);
  await Car.bulkWrite(
    cars.map((car) => ({
      updateOne: {
        filter: { slug: car.slug },
        update: { $set: car },
        upsert: true,
      },
    })),
  );

  console.log(`[OK] Seeded ${cars.length} cars into MongoDB`);
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
