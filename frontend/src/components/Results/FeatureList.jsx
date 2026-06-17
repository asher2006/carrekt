import { motion } from 'framer-motion';
import './FeatureList.css';

const FeatureList = ({ car }) => {
  if (!car) return null;

  const features = car.features || [];
  const pros = car.pros || [];
  const cons = car.cons || [];

  return (
    <motion.div
      className="feature-list"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      id="feature-list"
    >
      <div className="feature-list-header">
        <span>✨</span>
        <h3 className="feature-list-title">Key Features</h3>
      </div>

      {features.length > 0 && (
        <div className="feature-list-grid">
          {features.map((feature, i) => (
            <motion.div
              className="feature-item"
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.03 }}
            >
              <span className="feature-check">✓</span>
              {feature}
            </motion.div>
          ))}
        </div>
      )}

      {(pros.length > 0 || cons.length > 0) && (
        <div className="pros-cons">
          {pros.length > 0 && (
            <div>
              <h4 className="pros-title">👍 Pros</h4>
              <ul className="pros-list">
                {pros.map((pro, i) => <li key={i}>{pro}</li>)}
              </ul>
            </div>
          )}
          {cons.length > 0 && (
            <div>
              <h4 className="cons-title">👎 Cons</h4>
              <ul className="cons-list">
                {cons.map((con, i) => <li key={i}>{con}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default FeatureList;
