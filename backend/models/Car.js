let CarModel = null;

const getCarModel = () => {
  if (CarModel) return CarModel;

  const { getMongoose } = require('../config/mongo');
  const mongoose = getMongoose();
  if (!mongoose) return null;

  const schema = new mongoose.Schema(
    {
      name: { type: String, required: true, index: true },
      slug: { type: String, required: true, unique: true, index: true },
      brand: { type: String, required: true, index: true },
      region: { type: String, enum: ['India', 'Global'], default: 'India', index: true },
      segment: String,
      year: Number,
      image_url: String,
      ai_class_label: { type: String, index: true },
      specs: {
        engine: String,
        mileage: String,
        fuel: String,
        transmission: String,
      },
      engine: String,
      mileage: String,
      fuel_type: String,
      transmission: String,
      body_type: String,
      seating: Number,
      features: [String],
      images: [String],
    },
    { timestamps: true, collection: 'cars' },
  );

  CarModel = mongoose.models.Car || mongoose.model('Car', schema);
  return CarModel;
};

module.exports = { getCarModel };
