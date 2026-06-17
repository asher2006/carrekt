import { motion } from 'framer-motion';
import { formatPriceRange } from '../../utils/formatters';
import './PriceTag.css';

const PriceTag = ({ car }) => {
  if (!car) return null;

  return (
    <motion.div
      className="price-tag"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      id="price-tag"
    >
      <p className="price-tag-label">💰 Price Range (Ex-Showroom)</p>
      <p className="price-tag-value gradient-text-gold">
        {formatPriceRange(car.price_min, car.price_max)}
      </p>
      <p className="price-tag-note">*Prices may vary by city and variant</p>
    </motion.div>
  );
};

export default PriceTag;
