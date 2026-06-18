import { useEffect, useState, useRef } from 'react';
import './StatsSection.css';

const AnimatedCounter = ({ target, duration = 1500, suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(0);
  const elementRef = useRef(null);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let start = 0;
    const end = parseFloat(target);
    if (isNaN(end)) return;

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Ease out quad formula
      const easeProgress = progress * (2 - progress);
      const currentValue = start + easeProgress * (end - start);
      
      countRef.current = currentValue;
      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return (
    <span ref={elementRef} className="counter-value">
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const statsData = [
  { label: 'Recognition Accuracy', value: '99.2', suffix: '%', decimals: 1, detail: 'Top-1 class classification accuracy' },
  { label: 'Supported Models', value: '250', suffix: '+', decimals: 0, detail: 'Trained vehicle configurations' },
  { label: 'Average Latency', value: '120', suffix: 'ms', decimals: 0, detail: 'GPU inference response time' },
  { label: 'Dataset Size', value: '50', suffix: 'K+', decimals: 0, detail: 'High-res annotated training samples' },
  { label: 'Top-3 Decision View', value: '99.8', suffix: '%', decimals: 1, detail: 'Cumulative probability validation' },
];

export default function StatsSection() {
  return (
    <div className="stats-container">
      <div className="stats-header">
        <span className="eyebrow">Platform Telemetry</span>
        <h2>Model Benchmarks & Performance</h2>
        <p>Real-time neural network statistics captured during validation cycles and production runtime.</p>
      </div>
      <div className="stats-grid">
        {statsData.map((stat) => (
          <div key={stat.label} className="stats-card">
            <div className="stats-glow" />
            <div className="stats-content">
              <p className="stats-label">{stat.label}</p>
              <strong className="stats-number">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimals={stat.decimals}
                />
              </strong>
              <span className="stats-detail">{stat.detail}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
