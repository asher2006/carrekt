import { motion } from 'framer-motion';
import ConfidenceMeter from '../Common/ConfidenceMeter';
import './PredictionCard.css';

const PredictionCard = ({ prediction, car }) => {
  if (!prediction) return null;
  const imageUrl = car?.image_url || car?.images?.[0];

  return (
    <motion.div
      className="prediction-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      id="prediction-card"
    >
      <div className="prediction-visual">
        {imageUrl && <img className="prediction-car-image" src={imageUrl} alt={car.name} />}
        <ConfidenceMeter confidence={prediction.confidence} />
      </div>

      <div className="prediction-main">
        <div className="prediction-badge-row">
          <span className={`badge ${prediction.uncertain ? 'badge-gold' : 'badge-blue'}`}>
            {prediction.uncertain ? 'Uncertain' : 'AI Detected'}
          </span>
          {car?.segment && (
            <span className="badge badge-gold">{car.segment}</span>
          )}
          {car?.fuel_type && (
            <span className="badge badge-green">{car.fuel_type}</span>
          )}
        </div>

        <div>
          <h2 className="prediction-car-name">{prediction.model}</h2>
          {prediction.uncertain && (
            <p className="prediction-car-brand">
              Confidence is below {Math.round((prediction.threshold || 0.6) * 100)}%. Try a clearer side/front view.
            </p>
          )}
          {car?.brand && (
            <p className="prediction-car-brand">by {car.brand}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default PredictionCard;
