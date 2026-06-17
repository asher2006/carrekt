import { motion } from 'framer-motion';
import './SpecsPanel.css';

const SpecsPanel = ({ car }) => {
  if (!car) return null;

  const specs = [
    { label: 'Engine', value: car.engine || car.specs?.engine, icon: '⚙️' },
    { label: 'Power', value: car.power, icon: '⚡' },
    { label: 'Torque', value: car.torque, icon: '🔧' },
    { label: 'Transmission', value: car.transmission || car.specs?.transmission, icon: '🔄' },
    { label: 'Fuel Type', value: car.fuel_type || car.specs?.fuel, icon: '⛽' },
    { label: 'Mileage', value: car.mileage || car.specs?.mileage, icon: '📊' },
    { label: 'Fuel Tank', value: car.fuel_tank, icon: '🛢️' },
    { label: 'Seating', value: car.seating ? `${car.seating} Seater` : null, icon: '💺' },
    { label: 'Body Type', value: car.body_type, icon: '🚗' },
    { label: 'Year', value: car.year, icon: '📅' },
  ].filter(s => s.value);

  return (
    <motion.div
      className="specs-panel"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      id="specs-panel"
    >
      <div className="specs-panel-header">
        <span>📋</span>
        <h3 className="specs-panel-title">Specifications</h3>
      </div>

      <div className="specs-grid">
        {specs.map((spec, i) => (
          <motion.div
            className="specs-item"
            key={spec.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.05 }}
          >
            <span className="specs-item-label">{spec.icon} {spec.label}</span>
            <span className="specs-item-value">{spec.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default SpecsPanel;
