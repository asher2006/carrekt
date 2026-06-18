import { useEffect, useState, useRef } from 'react';
import './InteractiveVisionPipeline.css';

const demoCars = [
  {
    brand: 'Porsche',
    model: '911 Carrera',
    image: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=800',
    fallbackImage: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=600',
    confidence: 99.98,
    latency: '08ms',
    box: { top: '24%', left: '12%', width: '76%', height: '58%' }
  },
  {
    brand: 'Tesla',
    model: 'Model 3',
    image: '/images/tesla.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=600',
    confidence: 99.10,
    latency: '98ms',
    box: { top: '28%', left: '8%', width: '84%', height: '52%' }
  },
  {
    brand: 'Hyundai',
    model: 'Creta',
    image: '/images/creta.jpg',
    fallbackImage: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=600',
    confidence: 98.40,
    latency: '112ms',
    box: { top: '22%', left: '12%', width: '76%', height: '62%' }
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
      setPhase('acquiring');
      
      timeoutRef.current = setTimeout(() => {
        setPhase('scanning');
        
        timeoutRef.current = setTimeout(() => {
          setPhase('classified');
          
          timeoutRef.current = setTimeout(() => {
            setIndex((prev) => (prev + 1) % demoCars.length);
            runSequence();
          }, 4500);
          
        }, 1500);
        
      }, 1200);
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

        {/* Live Telemetry Overlay Box */}
        <div className="telemetry-overlay-box">
          <span className="telemetry-header">CLASSIFIER_LOGS</span>
          <div className="telemetry-table">
            <div className="telemetry-row table-hdr">
              <span>PARAMETER</span>
              <span>VALUE</span>
            </div>
            <div className="telemetry-row">
              <span>DETECTED_CLASS</span>
              <span style={{ fontSize: '0.55rem' }}>{phase === 'classified' ? `${activeCar.brand} ${activeCar.model}` : 'DETECTING...'}</span>
            </div>
            <div className="telemetry-row">
              <span>GPU_LATENCY</span>
              <span>{phase === 'classified' ? activeCar.latency : '00ms'}</span>
            </div>
            <div className="telemetry-row">
              <span>MATCH_CONF</span>
              <span>{phase === 'classified' ? `${activeCar.confidence}%` : '0.00%'}</span>
            </div>
          </div>
        </div>

        {/* Laser scanner sweeps */}
        {phase === 'scanning' && <div className="laser-sweep" />}

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
          </div>
        )}

        {/* Scanner Active Overlay */}
        <div className="sync-overlay-box">
          <div className="sync-bar">
            <div
              className="sync-fill"
              style={{
                width: phase === 'classified' ? '100%' : phase === 'scanning' ? '60%' : '15%',
                transition: phase === 'acquiring' ? 'none' : 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)'
              }}
            />
          </div>
          <span className="sync-label">SCANNER_ONLINE</span>
        </div>
      </div>
    </div>
  );
}
