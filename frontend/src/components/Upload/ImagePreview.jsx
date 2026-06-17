import { useMemo } from 'react';
import { motion } from 'framer-motion';
import './ImagePreview.css';

const ImagePreview = ({ file, onRemove, onSubmit, loading }) => {
  const previewUrl = useMemo(() => {
    if (!file) return null;
    return URL.createObjectURL(file);
  }, [file]);

  const fileSize = useMemo(() => {
    if (!file) return '';
    const size = file.size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }, [file]);

  if (!file) return null;

  return (
    <motion.div
      className="image-preview"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      id="image-preview"
    >
      <div className="image-preview-card">
        <img
          src={previewUrl}
          alt="Car preview"
          className="image-preview-img"
          id="preview-image"
        />

        <div className="image-preview-overlay">
          <div className="image-preview-info">
            <span className="image-preview-name">{file.name}</span>
            <span className="image-preview-size">{fileSize}</span>
          </div>

          <div className="image-preview-actions">
            <button
              className="image-preview-remove"
              onClick={onRemove}
              disabled={loading}
              id="btn-remove-image"
            >
              Remove
            </button>
            <button
              className="image-preview-submit"
              onClick={onSubmit}
              disabled={loading}
              id="btn-identify-car"
            >
              {loading ? (
                <>Identifying...</>
              ) : (
                <>Identify Car</>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ImagePreview;
