const { predictWithAI } = require('../utils/aiClient');
const { findCar, localCars } = require('../utils/carCatalog');
const fs = require('fs');

exports.predict = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  const filePath = req.file.path;

  try {
    let prediction;
    try {
      prediction = await predictWithAI(filePath);
    } catch {
      // AI service down — return demo prediction
      const randomCar = localCars[Math.floor(Math.random() * localCars.length)];
      prediction = {
        model: randomCar.name,
        label: randomCar.ai_class_label,
        confidence: +(0.7 + Math.random() * 0.25).toFixed(3),
        topPredictions: [
          { model: randomCar.name, confidence: +(0.7 + Math.random() * 0.25).toFixed(3) },
          { model: localCars[(Math.floor(Math.random() * localCars.length))].name, confidence: +(0.05 + Math.random() * 0.1).toFixed(3) },
          { model: localCars[(Math.floor(Math.random() * localCars.length))].name, confidence: +(0.01 + Math.random() * 0.05).toFixed(3) },
        ],
        demo: true,
      };
    }

    const car = prediction.label ? await findCar(prediction.label) : null;

    res.json({
      success: true,
      prediction: {
        model: prediction.model,
        label: prediction.label,
        confidence: prediction.confidence,
        topPredictions: prediction.topPredictions || [],
        uncertain: Boolean(prediction.uncertain),
        threshold: prediction.threshold || 0.6,
        cached: Boolean(prediction.cached),
        demo: prediction.demo || false,
      },
      car,
    });
  } catch (err) {
    next(err);
  } finally {
    // Always clean up uploaded file, even on error
    try { fs.unlinkSync(filePath); } catch {}
  }
};

