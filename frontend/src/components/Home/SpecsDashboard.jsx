import { Gauge, Zap, Droplet, Fuel, Activity, IndianRupee } from 'lucide-react';
import './SpecsDashboard.css';

const defaultDemoCar = {
  name: 'Hyundai Creta',
  brand: 'Hyundai',
  engine: '1.5L Turbo GDi Petrol',
  power: '158 bhp @ 5500 rpm',
  torque: '253 Nm @ 1500-3500 rpm',
  mileage: '17.4 kmpl',
  fuel_type: 'Petrol / Diesel',
  transmission: '7-Speed DCT / IVT',
  price_min: 1100000,
  price_max: 2000000,
};

export default function SpecsDashboard({ car }) {
  const activeCar = car || defaultDemoCar;

  // Helper parsers
  const getNumericValue = (str, regex, defaultVal = 0) => {
    if (!str) return defaultVal;
    const match = str.match(regex);
    return match ? parseFloat(match[0]) : defaultVal;
  };

  const powerVal = getNumericValue(activeCar.power, /[0-9]+/g, 100);
  const torqueVal = getNumericValue(activeCar.torque, /[0-9]+/g, 150);
  const mileageVal = getNumericValue(activeCar.mileage, /[0-9.]+/g, 15);

  // Percentages relative to caps
  const powerPct = Math.min((powerVal / 300) * 100, 100);
  const torquePct = Math.min((torqueVal / 500) * 100, 100);
  const mileagePct = Math.min((mileageVal / 25) * 100, 100);

  // Price formatting
  const formatLakhs = (val) => {
    if (!val) return 'N/A';
    return `₹${(val / 100000).toFixed(2)} Lakh`;
  };

  return (
    <div className="dashboard-console">
      <div className="dashboard-header">
        <span className="eyebrow">Diagnostic Output</span>
        <h3>Technical Telemetry</h3>
      </div>

      <div className="dashboard-gauges">
        {/* Gauge 1: Power */}
        <div className="gauge-box">
          <div className="gauge-svg-wrapper">
            <svg viewBox="0 0 100 100">
              <circle className="gauge-track" cx="50" cy="50" r="42" />
              <circle
                className="gauge-indicator color-red"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray={`${(powerPct * 263.8) / 100} 263.8`}
              />
            </svg>
            <div className="gauge-inner">
              <Gauge size={16} className="text-red-500" />
              <strong className="text-red-400">{powerVal}</strong>
              <span>BHP</span>
            </div>
          </div>
          <p className="gauge-label">Output Power</p>
        </div>

        {/* Gauge 2: Torque */}
        <div className="gauge-box">
          <div className="gauge-svg-wrapper">
            <svg viewBox="0 0 100 100">
              <circle className="gauge-track" cx="50" cy="50" r="42" />
              <circle
                className="gauge-indicator color-blue"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray={`${(torquePct * 263.8) / 100} 263.8`}
              />
            </svg>
            <div className="gauge-inner">
              <Zap size={16} className="text-blue-500" />
              <strong className="text-blue-400">{torqueVal}</strong>
              <span>NM</span>
            </div>
          </div>
          <p className="gauge-label">Peak Torque</p>
        </div>

        {/* Gauge 3: Mileage */}
        <div className="gauge-box">
          <div className="gauge-svg-wrapper">
            <svg viewBox="0 0 100 100">
              <circle className="gauge-track" cx="50" cy="50" r="42" />
              <circle
                className="gauge-indicator color-cyan"
                cx="50"
                cy="50"
                r="42"
                strokeDasharray={`${(mileagePct * 263.8) / 100} 263.8`}
              />
            </svg>
            <div className="gauge-inner">
              <Droplet size={16} className="text-cyan-500" />
              <strong className="text-cyan-400">{mileageVal}</strong>
              <span>KMPL</span>
            </div>
          </div>
          <p className="gauge-label">Fuel Efficiency</p>
        </div>
      </div>

      <div className="dashboard-grid-specs">
        <div className="dash-spec-tile">
          <div className="spec-tile-header">
            <Fuel size={14} className="text-blue-400" />
            <span>Power Plant</span>
          </div>
          <strong>{activeCar.engine || 'N/A'}</strong>
        </div>

        <div className="dash-spec-tile">
          <div className="spec-tile-header">
            <Activity size={14} className="text-cyan-400" />
            <span>Transmission</span>
          </div>
          <strong>{activeCar.transmission || 'N/A'}</strong>
        </div>

        <div className="dash-spec-tile col-span-2">
          <div className="spec-tile-header">
            <IndianRupee size={14} className="text-red-400" />
            <span>Est. Market Price Range</span>
          </div>
          <div className="price-slider-wrapper">
            <div className="price-labels">
              <span>{formatLakhs(activeCar.price_min)}</span>
              <span>{formatLakhs(activeCar.price_max)}</span>
            </div>
            <div className="price-track-bar">
              <div className="price-fill-bar" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
