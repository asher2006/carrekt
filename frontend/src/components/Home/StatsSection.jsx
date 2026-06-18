import { TrendingUp, Zap, Shield } from 'lucide-react';
import './StatsSection.css';

export default function StatsSection() {
  return (
    <div className="stats-container">
      <div className="stats-header">
        <div className="stats-header-left">
          <span className="eyebrow">OPERATIONAL STANDARDS</span>
          <h2>Precision Metrology</h2>
        </div>
        <div className="stats-header-right">
          <p>
            Our performance metrics are measured against industry-leading benchmarks for sub-second analysis.
          </p>
        </div>
      </div>
      
      <div className="stats-grid-three">
        {/* Card 1: Recognition Density */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <TrendingUp size={20} />
          </div>
          <h3>Recognition Density</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>Confidence</span>
              <strong>99.85%</strong>
            </div>
            <div className="stats-metric-row">
              <span>Sample Size</span>
              <strong>1.2M/day</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Throughput Rate */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <Zap size={20} />
          </div>
          <h3>Throughput Rate</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>Frame Latency</span>
              <strong>4.2ms</strong>
            </div>
            <div className="stats-metric-row">
              <span>Packet Loss</span>
              <strong>0.00%</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Vault Security */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <Shield size={20} />
          </div>
          <h3>Vault Security</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>Encryption</span>
              <strong>AES-256</strong>
            </div>
            <div className="stats-metric-row">
              <span>Uptime</span>
              <strong>99.999%</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
