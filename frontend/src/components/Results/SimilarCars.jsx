import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getCars } from '../../services/api';
import { formatPriceRange } from '../../utils/formatters';
import './SimilarCars.css';

const SimilarCars = ({ currentCar }) => {
  const [similarCars, setSimilarCars] = useState([]);

  useEffect(() => {
    if (!currentCar) return;

    const fetchSimilar = async () => {
      try {
        const data = await getCars({ segment: currentCar.segment });
        const filtered = (data.cars || [])
          .filter(c => c.slug !== currentCar.slug)
          .slice(0, 4);
        setSimilarCars(filtered);
      } catch {
        // Silently fail — similar cars is optional
      }
    };

    fetchSimilar();
  }, [currentCar]);

  if (similarCars.length === 0) return null;

  return (
    <motion.div
      className="similar-cars"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      id="similar-cars"
    >
      <div className="similar-cars-header">
        <span>🔗</span>
        <h3 className="similar-cars-title">Similar Cars</h3>
      </div>

      <div className="similar-cars-grid">
        {similarCars.map((car, i) => (
          <motion.div
            key={car.slug}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + i * 0.1 }}
          >
            <Link to={`/explore/${car.slug}`} className="similar-car-card">
              <span className="similar-car-emoji">🚗</span>
              <p className="similar-car-name">{car.name}</p>
              <p className="similar-car-price">
                {formatPriceRange(car.price_min, car.price_max)}
              </p>
              <p className="similar-car-segment">{car.segment}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SimilarCars;
