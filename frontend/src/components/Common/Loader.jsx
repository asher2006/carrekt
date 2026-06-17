import { motion } from 'framer-motion';
import './Loader.css';

const Loader = ({ text = 'Analyzing image...', subtext = 'AI model processing' }) => {
  return (
    <motion.div
      className="loader-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      id="ai-loader"
    >
      <div className="loader-spinner">
        <div className="loader-ring loader-ring-outer"></div>
        <div className="loader-ring loader-ring-inner"></div>
        <div className="loader-dot"></div>
      </div>

      <p className="loader-text">{text}</p>
      <p className="loader-subtext">{subtext}</p>

      <div className="loader-progress">
        <div className="loader-progress-bar"></div>
      </div>
    </motion.div>
  );
};

export default Loader;
