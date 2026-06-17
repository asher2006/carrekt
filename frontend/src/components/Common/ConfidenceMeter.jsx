import { useMemo } from 'react';
import { formatConfidence, getConfidenceColor, getConfidenceLabel } from '../../utils/formatters';
import './ConfidenceMeter.css';

const ConfidenceMeter = ({ confidence = 0, size = 120 }) => {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const { dashOffset, color, label } = useMemo(() => {
    const offset = circumference - (confidence * circumference);
    return {
      dashOffset: offset,
      color: getConfidenceColor(confidence),
      label: getConfidenceLabel(confidence),
    };
  }, [confidence, circumference]);

  return (
    <div className="confidence-meter" id="confidence-meter">
      <div className="confidence-gauge" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120">
          <circle
            className="confidence-gauge-bg"
            cx="60"
            cy="60"
            r={radius}
          />
          <circle
            className="confidence-gauge-fill"
            cx="60"
            cy="60"
            r={radius}
            stroke={color}
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
          />
        </svg>
        <div className="confidence-gauge-value">
          <span className="confidence-percentage" style={{ color }}>
            {formatConfidence(confidence)}
          </span>
          <span className="confidence-label" style={{ color }}>
            {label}
          </span>
        </div>
      </div>
      <span className="confidence-text">AI Confidence</span>
    </div>
  );
};

export default ConfidenceMeter;
