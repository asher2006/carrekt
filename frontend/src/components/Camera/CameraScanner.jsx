import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { predictCameraFrame } from '../../services/api';
import './CameraScanner.css';

const FRAME_SIZE = 300;
const INTERVAL_MS = 1600;
const MIN_CONFIDENCE_TO_ACCEPT = 0.5;

const CameraScanner = ({ onResult, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const busyRef = useRef(false);
  const intervalRef = useRef(null);
  const [status, setStatus] = useState('Starting camera...');
  const [lastPrediction, setLastPrediction] = useState(null);

  const stopCamera = useCallback(() => {
    window.clearInterval(intervalRef.current);
    intervalRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const captureFrame = useCallback(async () => {
    if (!videoRef.current || !canvasRef.current || busyRef.current) return;
    if (videoRef.current.readyState < 2) return;

    busyRef.current = true;
    setStatus('Scanning...');

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d', { willReadFrequently: false });
    canvas.width = FRAME_SIZE;
    canvas.height = FRAME_SIZE;

    const video = videoRef.current;
    const side = Math.min(video.videoWidth, video.videoHeight);
    const sx = (video.videoWidth - side) / 2;
    const sy = (video.videoHeight - side) / 2;
    context.drawImage(video, sx, sy, side, side, 0, 0, FRAME_SIZE, FRAME_SIZE);

    canvas.toBlob(async (blob) => {
      if (!blob) {
        busyRef.current = false;
        return;
      }

      try {
        const result = await predictCameraFrame(blob);
        if (result.success) {
          setLastPrediction(result.prediction);
          if (result.prediction.confidence >= MIN_CONFIDENCE_TO_ACCEPT && !result.prediction.uncertain) {
            onResult(result);
            setStatus('Match found');
          } else {
            setStatus('Low confidence — keep the car centered');
          }
        }
      } catch (error) {
        setStatus(error.response?.data?.message || 'Camera prediction failed');
      } finally {
        busyRef.current = false;
      }
    }, 'image/jpeg', 0.82);
  }, [onResult]);

  useEffect(() => {
    let mounted = true;

    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }
        streamRef.current = stream;
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setStatus('Point camera at a car');
        intervalRef.current = window.setInterval(captureFrame, INTERVAL_MS);
      } catch {
        setStatus('Camera permission denied or unavailable');
      }
    };

    start();
    return () => {
      mounted = false;
      stopCamera();
    };
  }, [captureFrame, stopCamera]);

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  return (
    <motion.div
      className="camera-scanner"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
    >
      <div className="camera-header">
        <div>
          <h2>Scan via Camera</h2>
          <p>{status}</p>
        </div>
        <button type="button" className="camera-close" onClick={handleClose} aria-label="Close camera">
          Close
        </button>
      </div>

      <div className="camera-stage">
        <video ref={videoRef} className="camera-video" playsInline muted />
        <div className="camera-reticle" />
        <canvas ref={canvasRef} className="camera-canvas" aria-hidden="true" />
      </div>

      {lastPrediction && (
        <div className="camera-live-result">
          <strong>{lastPrediction.model}</strong>
          <span>{Math.round(lastPrediction.confidence * 100)}%</span>
        </div>
      )}
    </motion.div>
  );
};

export default CameraScanner;
