import { TrendingUp, Zap, Shield } from 'lucide-react';
import './StatsSection.css';

export default function StatsSection() {
  return (
    <div className="stats-container">
      <div className="stats-header">
        <div className="stats-header-left">
          <span className="eyebrow">OPERATIONAL BENCHMARKS</span>
          <h2>Model & Dataset Metrics</h2>
        </div>
        <div className="stats-header-right">
          <p>
            Key parameters validating classification accuracy, inference speed, and overall dataset scope.
          </p>
        </div>
      </div>
      
      <div className="stats-grid-three">
        {/* Card 1: Model Accuracy */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <TrendingUp size={20} />
          </div>
          <h3>Model Accuracy</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>Top-1 Accuracy</span>
              <strong>97.3%</strong>
            </div>
            <div className="stats-metric-row">
              <span>Validation Set</span>
              <strong>525 images</strong>
            </div>
          </div>
        </div>

        {/* Card 2: Inference Speed */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <Zap size={20} />
          </div>
          <h3>Inference Speed</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>GPU Latency</span>
              <strong>277ms</strong>
            </div>
            <div className="stats-metric-row">
              <span>Throughput</span>
              <strong>3.6 FPS</strong>
            </div>
          </div>
        </div>

        {/* Card 3: Dataset Coverage */}
        <div className="stats-card-premium">
          <div className="stats-card-icon">
            <Shield size={20} />
          </div>
          <h3>Dataset Coverage</h3>
          <div className="stats-metrics-rows">
            <div className="stats-metric-row">
              <span>Unique Classes</span>
              <strong>20 models</strong>
            </div>
            <div className="stats-metric-row">
              <span>Total Dataset</span>
              <strong>4,000 images</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
