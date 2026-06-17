import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  Camera,
  ChartNoAxesCombined,
  CheckCircle2,
  Gauge,
  ListFilter,
  ScanLine,
  Sparkles,
  UploadCloud,
  X,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import CameraScanner from '../components/Camera/CameraScanner';
import { usePrediction } from '../hooks/usePrediction';
import { formatConfidence, formatPriceRange } from '../utils/formatters';
import './HomePage.css';

const stats = [
  { label: 'Model coverage', value: '20', detail: 'Trained vehicle classes' },
  { label: 'Decision view', value: 'Top 3', detail: 'Ranked recognition output' },
  { label: 'Catalog link', value: 'Live', detail: 'Specs and compare ready' },
];

const featureCards = [
  {
    icon: ScanLine,
    title: 'Image and camera intake',
    description: 'Upload stills or point the live camera feed at a vehicle for rapid classification.',
  },
  {
    icon: Gauge,
    title: 'Useful specs, not just a label',
    description: 'Each match resolves into pricing, engine, transmission, fuel and feature context.',
  },
  {
    icon: ChartNoAxesCombined,
    title: 'Built for evaluation',
    description: 'Move from a match into catalog browsing and side-by-side comparison without losing context.',
  },
];

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
    <div className="upload-frame">
      <div className="upload-frame__glow" />
      <div
        className={`upload-dropzone ${isDragActive ? 'is-active' : ''}`}
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

        <div className="upload-icon">
          <UploadCloud size={30} />
        </div>
        <p className="eyebrow upload-eyebrow">Image intake bay</p>
        <h2>Drop a car image for detection</h2>
        <p>
          Use a clean exterior shot and the scanner will return the detected brand, model, confidence score, and linked catalog context.
        </p>

        <div className="upload-actions">
          <button
            type="button"
            className="button-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            Choose image
            <ArrowRight size={16} />
          </button>
          <button
            type="button"
            className="button-secondary"
            onClick={onCameraOpen}
          >
            <Camera size={16} />
            Open camera
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultMetric = ({ label, value }) => (
  <div className="result-metric">
    <p>{label}</p>
    <strong>{value || 'N/A'}</strong>
  </div>
);

const RecognitionDisplay = () => (
  <div className="recognition-display" aria-label="Car recognition interface preview">
    <div className="recognition-topbar">
      <span>Vision pipeline</span>
      <strong>Live</strong>
    </div>

    <div className="recognition-viewport">
      <div className="scan-sweep" />
      <div className="road-grid" />
      <div className="vehicle-silhouette">
        <div className="vehicle-roof" />
        <div className="vehicle-body" />
        <div className="vehicle-window" />
        <div className="vehicle-light vehicle-light--left" />
        <div className="vehicle-light vehicle-light--right" />
        <div className="vehicle-wheel vehicle-wheel--left" />
        <div className="vehicle-wheel vehicle-wheel--right" />
      </div>
      <div className="detection-box">
        <span>Vehicle detected</span>
      </div>
      <div className="scan-target scan-target--brand">
        <span>Brand</span>
        <strong>Hyundai</strong>
      </div>
      <div className="scan-target scan-target--model">
        <span>Model</span>
        <strong>Creta</strong>
      </div>
    </div>

    <div className="recognition-console">
      <div>
        <span>Top match</span>
        <strong>Hyundai Creta</strong>
      </div>
      <div className="confidence-track" aria-hidden="true">
        <span />
      </div>
      <em>94.8%</em>
    </div>

    <div className="pipeline-chips">
      <span>Upload</span>
      <span>Classify</span>
      <span>Specs</span>
      <span>Compare</span>
    </div>
  </div>
);

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState(null);
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
  const detectedName = activeCar?.name || activePrediction?.model || predictionLabel || 'Detected vehicle';
  const detectedBrand = activeCar?.brand || detectedName.split(' ')[0] || 'Unknown';
  const detectedModel =
    activeCar?.model ||
    activePrediction?.model ||
    detectedName.replace(detectedBrand, '').trim() ||
    detectedName;

  return (
    <div className="home-screen">
      <div className="home-ambient" />

      <section className="hero-grid">
        <div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-status">
              <Sparkles size={14} />
              Image to brand, model and confidence
            </div>

            <h1>
              Car recognition built around the scan.
            </h1>
            <p className="hero-copy">
              Upload a car photo or use the camera, then CarRecog classifies the vehicle, surfaces the confidence score, and connects the result to specs, pricing, and comparison.
            </p>
          </motion.div>

          <div className="stat-strip">
            {stats.map((item, index) => (
              <motion.div
                key={item.label}
                className="stat-tile"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + index * 0.08 }}
              >
                <p>{item.label}</p>
                <strong>{item.value}</strong>
                <span>{item.detail}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="hero-visual"
        >
          <RecognitionDisplay />
        </motion.div>
      </section>

      <section className="scanner-section">
        <AnimatePresence mode="wait">
          {!showResults && !loading && !cameraOpen && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="scanner-grid"
            >
              <UploadPanel onFileSelect={handleFileSelect} onCameraOpen={() => setCameraOpen(true)} />

              {error && (
                <div className="error-card">
                  {error}
                </div>
              )}

              <div className="feature-stack">
                {featureCards.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <div key={feature.title} className="feature-card">
                      <div className="feature-card__icon">
                        <Icon size={20} />
                      </div>
                      <div>
                        <h3>{feature.title}</h3>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  );
                })}

                <div className="workflow-card">
                  <p className="eyebrow">Recognition flow</p>
                  <div className="workflow-list">
                    {['Upload or scan a vehicle', 'Review confidence and top alternatives', 'Jump into details or compare against rivals'].map((step) => (
                      <div key={step}>
                        <CheckCircle2 size={18} />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {cameraOpen && (
            <motion.div
              key="camera"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="camera-shell"
            >
              <CameraScanner onResult={handleCameraResult} onClose={() => setCameraOpen(false)} />
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="analysis-card"
            >
              <div className="analysis-dial" />
              <h2>Analyzing image</h2>
              <p>Running the recognition pipeline and matching the result against the catalog.</p>
            </motion.div>
          )}

          {showResults && activePrediction && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              className="results-grid"
            >
              <div className="image-result-panel">
                <div className="image-stage">
                  <div className="image-stage__scanline" />
                  <div className="image-stage__media">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Selected car" />
                    ) : (
                      <div className="camera-placeholder">
                        <ScanLine size={56} />
                      </div>
                    )}
                  </div>
                  <div className="image-stage__footer">
                    <span className="confidence-pill">
                      {formatConfidence(activePrediction.confidence)} confidence
                    </span>
                    {activePrediction.demo && (
                      <span className="demo-pill">
                        Demo fallback response
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="result-card">
                <p className="eyebrow">Detected vehicle</p>
                <h2>{detectedName}</h2>
                <p className="result-summary">
                  {activeCar?.brand ? `${activeCar.brand} · ${activeCar.body_type || activeCar.segment || 'Vehicle'} · ${activeCar.year || 'Current generation'}` : 'Prediction available'}
                </p>

                {error && (
                  <div className="error-card">
                    {error}
                  </div>
                )}

                <div className="identity-grid">
                  <ResultMetric label="Brand" value={detectedBrand} />
                  <ResultMetric label="Model" value={detectedModel} />
                  <ResultMetric label="Confidence" value={formatConfidence(activePrediction.confidence)} />
                </div>

                <div className="spec-grid">
                  <ResultMetric label="Price band" value={activeCar ? formatPriceRange(activeCar.price_min, activeCar.price_max) : 'N/A'} />
                  <ResultMetric label="Transmission" value={activeCar?.transmission} />
                  <ResultMetric label="Engine" value={activeCar?.engine} />
                  <ResultMetric label="Fuel" value={activeCar?.fuel_type} />
                </div>

                {topPredictions.length > 0 && (
                  <div className="alternatives">
                    <p className="eyebrow">Top alternatives</p>
                    <div>
                      {topPredictions.map((candidate, index) => (
                        <div key={`${candidate.model}-${candidate.confidence}`} className="alternative-row">
                          <span>{String(index + 1).padStart(2, '0')}</span>
                          <strong>{candidate.model}</strong>
                          <em>{formatConfidence(candidate.confidence)}</em>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="result-actions">
                  <Link
                    to={activeCar?.slug ? `/explore/${activeCar.slug}` : '/explore'}
                    className="button-primary"
                  >
                    View full specs
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    to={activeCar?.slug ? `/compare?cars=${activeCar.slug}` : '/compare'}
                    className="button-secondary"
                  >
                    <ListFilter size={16} />
                    Compare next
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={handleNewScan}
                  className="scan-again"
                >
                  <X size={16} />
                  Scan another car
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </div>
  );
}
