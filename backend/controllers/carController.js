const { findCar, listCars, getBrands: listBrands } = require('../utils/carCatalog');

// Get all cars with optional filters
exports.getCars = async (req, res, next) => {
  try {
    const cars = await listCars(req.query);

    res.json({ success: true, count: cars.length, cars });
  } catch (err) { next(err); }
};

// Get single car by slug, model name, or AI label
exports.getCarByModel = async (req, res, next) => {
  try {
    const { model, slug } = req.params;
    const car = await findCar(model || slug);
    if (!car) return res.status(404).json({ success: false, message: 'Car not found' });

    res.json({ success: true, car });
  } catch (err) { next(err); }
};

// Get all brands
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await listBrands();
    res.json({ success: true, brands });
  } catch (err) { next(err); }
};
