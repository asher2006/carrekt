import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  ScanLine,
  Sparkles,
  UploadCloud,
  X,
  Cpu,
  RefreshCw,
  Gauge,
  ListFilter
} from 'lucide-react';
import { Link } from 'react-router-dom';

import CameraScanner from '../components/Camera/CameraScanner';
import { usePrediction } from '../hooks/usePrediction';
import { formatConfidence } from '../utils/formatters';

// Phase 2 Subcomponents
import InteractiveVisionPipeline from '../components/Home/InteractiveVisionPipeline';
import StatsSection from '../components/Home/StatsSection';
import HowItWorks from '../components/Home/HowItWorks';
import ExamplePredictions from '../components/Home/ExamplePredictions';
import SpecsDashboard from '../components/Home/SpecsDashboard';
import ComparisonPreview from '../components/Home/ComparisonPreview';
import BrandGrid from '../components/Home/BrandGrid';

import './HomePage.css';

const UploadPanel = ({ onFileSelect, onCameraOpen }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (event.type === 'dragenter' || event.type === 'dragover') {
      setIsDragActive(true);
    } else {
      setIsDragActive(false);
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className="upload-frame-deck">
      <div className="upload-frame-glow-effect" />
      <div
        className={`upload-dropzone-panel ${isDragActive ? 'is-drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />

        <div className="upload-deck-icon">
          <UploadCloud size={28} />
        </div>
        <p className="eyebrow upload-deck-eyebrow">Image Intake Bay</p>
        <h3>Drag & Drop Car Image</h3>
        <p className="upload-deck-copy">
          Exterior vehicle snapshots resolve into pricing, telemetry specs, and side-by-side rivals matrices.
        </p>

        <div className="upload-deck-actions">
          <button
            type="button"
            className="button-primary-glow"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Image
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            className="button-secondary-hologram"
            onClick={onCameraOpen}
          >
            <Camera size={15} />
            Use Camera
          </button>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraResult, setCameraResult] = useState(null);
  const { prediction, carDetails, loading, error, predict, reset } = usePrediction();

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : ''),
    [selectedFile],
  );

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const handleFileSelect = useCallback((file) => {
    setSelectedFile(file);
    setCameraOpen(false);
    setCameraResult(null);
    reset();
    predict(file);
  }, [predict, reset]);

  const handleCameraResult = useCallback((result) => {
    if (result?.success) {
      setSelectedFile(null);
      setCameraOpen(false);
      setCameraResult(result);
    }
  }, []);

  const handleNewScan = useCallback(() => {
    setSelectedFile(null);
    setCameraOpen(false);
    setCameraResult(null);
    reset();
  }, [reset]);

  const activePrediction = cameraResult?.prediction || prediction;
  const activeCar = cameraResult?.car || carDetails;
  const showResults = Boolean(activePrediction);

  const topPredictions = useMemo(
    () => activePrediction?.topPredictions?.slice(0, 3) || [],
    [activePrediction],
  );
  
  const predictionLabel = activePrediction?.label?.replace(/_/g, ' ') || '';
  const detectedName = activeCar?.name || activePrediction?.model || predictionLabel || 'Detected Vehicle';
  const detectedBrand = activeCar?.brand || detectedName.split(' ')[0] || 'Unknown';
  const detectedModel =
    activeCar?.model ||
    activePrediction?.model ||
    detectedName.replace(detectedBrand, '').trim() ||
    detectedName;

  return (
    <div className="home-screen">
      <div className="home-ambient" />

      <AnimatePresence mode="wait">
        {/* Idle Landing State */}
        {!showResults && !loading && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Hero Section */}
            <section className="hero-grid">
              <div className="hero-left-col">
                <div className="hero-status">
                  <span className="live-pulsing-bulb" />
                  PREMIUM ACCESS GRANTED
                </div>

                {!intakeOpen ? (
                  <>
                    <h1>
                      The Vanguard of <br />
                      <span>Automotive Intelligence.</span>
                    </h1>
                    
                    <p className="hero-copy">
                      Elevating vehicle recognition to an editorial standard. Our neural architecture processes reality with the precision of a master watchmaker, delivering deep-tissue telemetry in real-time.
                    </p>

                    <div className="hero-actions">
                      <button
                        type="button"
                        className="button-primary-glow"
                        onClick={() => setIntakeOpen(true)}
                      >
                        Initialize HUD
                        <ArrowRight size={15} />
                      </button>
                      <Link
                        to="/explore"
                        className="button-secondary-hologram"
                      >
                        Read Specifications
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="intake-title">Intake Terminal</h2>
                    <p className="intake-copy">Select an image or activate device camera scanner to run diagnostics.</p>
                    
                    {/* Intake Panel placed prominently in Left Hero Column */}
                    <div className="hero-intake-wrapper">
                      {cameraOpen ? (
                        <div className="camera-intake-shell">
                          <CameraScanner 
                            onResult={handleCameraResult} 
                            onClose={() => setCameraOpen(false)} 
                          />
                        </div>
                      ) : (
                        <div className="upload-intake-shell">
                          <UploadPanel 
                            onFileSelect={handleFileSelect} 
                            onCameraOpen={() => setCameraOpen(true)} 
                          />
                          <button
                            type="button"
                            className="cancel-intake-btn"
                            onClick={() => setIntakeOpen(false)}
                          >
                            <X size={14} />
                            Cancel & Return
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Live Interactive vision pipeline on Right Hero Column */}
              <div className="hero-visual">
                <InteractiveVisionPipeline />
              </div>
            </section>

            {/* Performance Statistics Grid */}
            <StatsSection />
          </motion.div>
        )}

        {/* Loading Scanner Phase */}
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="analysis-screen-overlay"
          >
            <div className="analysis-spinner-deck">
              <div className="analysis-dial-telemetry">
                <div className="dial-sweep-laser" />
              </div>
              <Cpu size={36} className="analysis-cpu-pulse" />
            </div>
            <h2>Running AI Diagnostics</h2>
            <div className="loading-steps-list">
              <div className="loading-step-item">
                <CheckCircle2 size={16} className="text-blue-500" />
                <span>Reading pixel data matrices...</span>
              </div>
              <div className="loading-step-item">
                <div className="btn-spinner mr-1" />
                <span>Extracting visual features and edge boundaries...</span>
              </div>
              <div className="loading-step-item text-muted">
                <span>Mapping properties against vehicle specs databases...</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Active Scan Results view */}
        {showResults && activePrediction && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="results-grid"
          >
            {/* Left Column: Bounding box image preview */}
            <div className="image-result-panel">
              <div className="image-stage-deck">
                <div className="image-stage-scanline-laser" />
                
                {/* Simulated Bounding Box on uploaded image */}
                <div className="uploaded-bounding-box">
                  <div className="bracket br-tl" />
                  <div className="bracket br-tr" />
                  <div className="bracket br-bl" />
                  <div className="bracket br-br" />
                  <div className="box-header-label">
                    <span>{detectedBrand} {detectedModel}</span>
                    <strong>{formatConfidence(activePrediction.confidence)}</strong>
                  </div>
                </div>

                <div className="image-stage-media-wrapper">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Analyzed car" />
                  ) : (
                    <div className="camera-placeholder-shell">
                      <ScanLine size={56} />
                    </div>
                  )}
                </div>

                <div className="image-stage-footer-tags">
                  <span className="confidence-pill-neon">
                    {formatConfidence(activePrediction.confidence)} Accuracy Match
                  </span>
                  {activePrediction.demo && (
                    <span className="demo-pill-hologram">
                      Simulated Response Mode
                    </span>
                  )}
                </div>
              </div>

              {/* Side-by-side comparisons displayed right below the image */}
              <ComparisonPreview car={activeCar} />
            </div>

            {/* Right Column: Specifications Dashboard & CTAs */}
            <div className="result-card-deck">
              <div className="result-card-header">
                <span className="eyebrow">Classified Target</span>
                <h2>{detectedName}</h2>
                <p className="result-card-summary">
                  {activeCar?.brand ? `${activeCar.brand} · ${activeCar.body_type || activeCar.segment || 'Vehicle'} · ${activeCar.year || 'Current Gen'}` : 'Inference successful'}
                </p>
              </div>

              {error && (
                <div className="error-card-panel">
                  {error}
                </div>
              )}

              {/* Gauge Specification Dashboard */}
              <SpecsDashboard car={activeCar} />

              {/* Top Alternatives Overlay */}
              {topPredictions.length > 0 && (
                <div className="alternatives-panel">
                  <span className="eyebrow">Decision Alternatives</span>
                  <div className="alternatives-list-box">
                    {topPredictions.map((candidate, index) => (
                      <div key={`${candidate.model}-${candidate.confidence}`} className="alternative-row-card">
                        <span className="alt-index">0{index + 1}</span>
                        <strong className="alt-model">{candidate.model}</strong>
                        <em className="alt-pct">{formatConfidence(candidate.confidence)}</em>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ActionCTAs */}
              <div className="results-cta-actions">
                <Link
                  to={activeCar?.slug ? `/explore/${activeCar.slug}` : '/explore'}
                  className="button-primary-glow w-full text-center"
                >
                  Inspect Catalog Profile
                  <ArrowRight size={16} />
                </Link>
                <Link
                  to={activeCar?.slug ? `/compare?cars=${activeCar.slug}` : '/compare'}
                  className="button-secondary-hologram w-full text-center"
                >
                  <ListFilter size={16} />
                  Launch Comparative Lab
                </Link>
              </div>

              <button
                type="button"
                onClick={handleNewScan}
                className="scan-again-btn"
              >
                <RefreshCw size={15} />
                Clear System & Scan Another Vehicle
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
