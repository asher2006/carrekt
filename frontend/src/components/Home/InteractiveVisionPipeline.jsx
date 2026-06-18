import { useEffect, useState, useRef } from 'react';
import { Scan, Radio, Shield, CheckCircle } from 'lucide-react';
import './InteractiveVisionPipeline.css';

const demoCars = [
  {
    brand: 'Hyundai',
    model: 'Creta',
    image: '/images/creta.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    confidence: 98.4,
    latency: '112ms',
    box: { top: '22%', left: '12%', width: '76%', height: '62%' },
    targets: [
      { name: 'Rear Axle', top: '72%', left: '26%' },
      { name: 'Chrome Badge', top: '52%', left: '50%' },
      { name: 'LED Projector', top: '48%', left: '78%' },
    ]
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    image: '/images/tesla.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    confidence: 99.1,
    latency: '98ms',
    box: { top: '28%', left: '8%', width: '84%', height: '52%' },
    targets: [
      { name: 'Front Hubcap', top: '68%', left: '20%' },
      { name: 'Radar Panel', top: '65%', left: '80%' },
      { name: 'Autopilot Cam', top: '38%', left: '48%' },
    ]
  },
  {
    brand: 'Toyota',
    model: 'Fortuner',
    image: '/images/fortuner.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=600',
    confidence: 97.6,
    latency: '134ms',
    box: { top: '18%', left: '14%', width: '72%', height: '68%' },
    targets: [
      { name: 'Rear Diff', top: '74%', left: '26%' },
      { name: 'Tach Badge', top: '55%', left: '50%' },
      { name: 'Fascia Grille', top: '60%', left: '72%' },
    ]
  }
];

export default function InteractiveVisionPipeline() {
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState('acquiring'); // acquiring -> scanning -> classified
  const [hovered, setHovered] = useState(false);
  const timeoutRef = useRef(null);

  const activeCar = demoCars[index];

  useEffect(() => {
    if (hovered) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }

    const runSequence = () => {
      // Step 1: Acquiring feed
      setPhase('acquiring');
      
      // Step 2: Sweep Scan
      timeoutRef.current = setTimeout(() => {
        setPhase('scanning');
        
        // Step 3: Reveal Classification
        timeoutRef.current = setTimeout(() => {
          setPhase('classified');
          
          // Step 4: Go to next car after showcase duration
          timeoutRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % demoCars.length);
            runSequence();
          }, 4500); // showcase for 4.5s
          
        }, 1500); // scanning for 1.5s
        
      }, 1200); // acquiring for 1.2s
    };

    runSequence();

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [index, hovered]);

  return (
    <div
      className="pipeline-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="pipeline-topbar">
        <div className="pipeline-title">
          <Scan size={14} className={phase === 'scanning' ? 'pulse-blue' : ''} />
          <span>Core Vision Pipeline</span>
        </div>
        <div className={`pipeline-status badge-${phase}`}>
          {phase === 'acquiring' && 'ACQUIRING FEED...'}
          {phase === 'scanning' && 'RUNNING SWEEP ANALYSIS...'}
          {phase === 'classified' && 'DIAGNOSTIC STABLE'}
        </div>
      </div>

      <div className="pipeline-viewport">
        {/* Real image display */}
        <div className="pipeline-media">
          <img
            src={activeCar.image}
            alt={`${activeCar.brand} ${activeCar.model}`}
            onError={(e) => {
              e.target.src = activeCar.fallbackImage;
            }}
          />
        </div>

        {/* Floating grid design overlay */}
        <div className="viewport-grid-lines" />

        {/* Laser scanner sweeps */}
        {phase === 'scanning' && <div className="laser-sweep" />}

        {/* Scanning noise/effects */}
        {phase === 'acquiring' && (
          <div className="acquiring-overlay">
            <Radio size={36} className="spin-slow text-blue-500" />
            <p>Syncing telemetry camera...</p>
          </div>
        )}

        {/* Dynamic Bounding Box Overlay */}
        {(phase === 'scanning' || phase === 'classified') && (
          <div
            className={`pipeline-bounding-box ${phase === 'scanning' ? 'is-scanning-box' : 'is-stable-box'}`}
            style={activeCar.box}
          >
            {/* Corner Bracket elements */}
            <div className="bracket br-tl" />
            <div className="bracket br-tr" />
            <div className="bracket br-bl" />
            <div className="bracket br-br" />

            {/* Bounding box header label */}
            <div className="box-header-label">
              <span>{activeCar.brand} {activeCar.model}</span>
              {phase === 'classified' && <strong>{activeCar.confidence}%</strong>}
            </div>

            {/* Dynamic targets inside bounding box */}
            {phase === 'classified' &&
              activeCar.targets.map((target, idx) => (
                <div
                  key={target.name}
                  className="target-node"
                  style={{ top: target.top, left: target.left }}
                >
                  <div className="target-dot" />
                  <div className="target-pulse" />
                  <div className="target-tooltip">
                    <span>NODE {idx + 1}</span>
                    <strong>{target.name}</strong>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Live console indicators */}
      <div className="pipeline-console">
        <div className="console-metric">
          <span>Target Classification</span>
          <strong>
            {phase === 'classified' ? `${activeCar.brand} ${activeCar.model}` : 'Detecting vehicle...'}
          </strong>
        </div>
        <div className="console-metric">
          <span>Inference Latency</span>
          <strong className="text-mono">
            {phase === 'classified' ? activeCar.latency : 'Calculating...'}
          </strong>
        </div>
        <div className="console-metric">
          <span>Confidence Score</span>
          <div className="console-bar-wrapper">
            <div className="console-track-bg">
              <div
                className="console-fill-bar"
                style={{
                  width: phase === 'classified' ? `${activeCar.confidence}%` : '0%',
                  transition: phase === 'classified' ? 'width 1s cubic-bezier(0.16, 1, 0.3, 1)' : 'none'
                }}
              />
            </div>
            <em>{phase === 'classified' ? `${activeCar.confidence}%` : '0.0%'}</em>
          </div>
        </div>
      </div>

      <div className="pipeline-footer">
        <div className="flex items-center gap-1">
          <Shield size={12} className="text-emerald-500" />
          <span>Security status: active</span>
        </div>
        <div>
          {hovered ? (
            <span className="text-amber-500 font-mono text-[10px] tracking-wide animate-pulse">
              PAUSED ON HOVER
            </span>
          ) : (
            <span>Auto-cycling examples</span>
          )}
        </div>
      </div>
    </div>
  );
}
