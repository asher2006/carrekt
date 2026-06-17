const { supabase } = require('../config/supabase');
const { findCar } = require('../utils/carCatalog');

exports.compareCars = async (req, res, next) => {
  try {
    const { slugs } = req.body;
    if (!slugs || !Array.isArray(slugs) || slugs.length < 2) {
      return res.status(400).json({ success: false, message: 'Provide at least 2 car slugs' });
    }
    if (slugs.length > 5) {
      return res.status(400).json({ success: false, message: 'Cannot compare more than 5 cars at once' });
    }
    if (!slugs.every((slug) => typeof slug === 'string' && slug.length > 0 && slug.length <= 100)) {
      return res.status(400).json({ success: false, message: 'Each slug must be a non-empty string (max 100 chars)' });
    }

    let cars = [];
    if (supabase) {
      const { data } = await supabase.from('cars').select('*').in('slug', slugs);
      if (data) cars = data;
    }
    if (cars.length === 0) {
      cars = (await Promise.all(slugs.map((slug) => findCar(slug)))).filter(Boolean);
    }

    res.json({ success: true, cars });
  } catch (err) { next(err); }
};
