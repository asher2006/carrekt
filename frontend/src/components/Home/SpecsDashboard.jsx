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

      <div className="dashboard-gauges-sleek">
        {/* Sleek Gauge 1: Power */}
        <div className="sleek-gauge-card">
          <div className="sleek-gauge-header">
            <span>OUTPUT POWER</span>
            <Gauge size={14} />
          </div>
          <div className="sleek-gauge-body">
            <strong>{powerVal}</strong>
            <span className="unit">BHP</span>
          </div>
          <div className="sleek-progress-track">
            <div className="sleek-progress-fill" style={{ width: `${powerPct}%` }} />
          </div>
        </div>

        {/* Sleek Gauge 2: Torque */}
        <div className="sleek-gauge-card">
          <div className="sleek-gauge-header">
            <span>PEAK TORQUE</span>
            <Zap size={14} />
          </div>
          <div className="sleek-gauge-body">
            <strong>{torqueVal}</strong>
            <span className="unit">NM</span>
          </div>
          <div className="sleek-progress-track">
            <div className="sleek-progress-fill" style={{ width: `${torquePct}%` }} />
          </div>
        </div>

        {/* Sleek Gauge 3: Fuel Efficiency */}
        <div className="sleek-gauge-card">
          <div className="sleek-gauge-header">
            <span>FUEL EFFICIENCY</span>
            <Droplet size={14} />
          </div>
          <div className="sleek-gauge-body">
            <strong>{mileageVal}</strong>
            <span className="unit">{activeCar.fuel_type?.toLowerCase().includes('electric') ? 'KM/CHARGE' : 'KMPL'}</span>
          </div>
          <div className="sleek-progress-track">
            <div className="sleek-progress-fill" style={{ width: `${mileagePct}%` }} />
          </div>
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
