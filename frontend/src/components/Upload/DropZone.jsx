import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './DropZone.css';

const DropZone = ({ onFileSelect, disabled = false }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
    disabled,
  });

  return (
    <div className="dropzone-wrapper" id="upload-dropzone">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
      >
        <input {...getInputProps()} id="file-input" />

        <h3 className="dropzone-title">
          {isDragActive ? 'Drop image here' : 'Upload a car image'}
        </h3>

        <p className="dropzone-subtitle">
          {isDragActive
            ? 'Release to upload'
            : 'Drag and drop a photo, or browse from your device'}
        </p>

        <button className="dropzone-browse-btn" type="button">
          Browse Files
        </button>

        <div className="dropzone-formats">
          <span className="dropzone-format-tag">JPG</span>
          <span className="dropzone-format-tag">PNG</span>
          <span className="dropzone-format-tag">WEBP</span>
        </div>
      </div>
    </div>
  );
};

export default DropZone;
