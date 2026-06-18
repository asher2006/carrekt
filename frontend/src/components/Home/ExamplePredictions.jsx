import { useState } from 'react';
import { ArrowRight, Play, Cpu } from 'lucide-react';
import './ExamplePredictions.css';

const exampleCars = [
  {
    name: 'Maruti Swift',
    slug: 'maruti-swift',
    image: '/images/swift.jpg',
    specs: '1.2L Petrol · 24.8 kmpl · ₹5.99L - ₹8.99L',
    details: 'Compact hatchback, highly rated for fuel efficiency and low maintenance.',
    filename: 'swift.jpg',
  },
  {
    name: 'Hyundai Creta',
    slug: 'hyundai-creta',
    image: '/images/creta.jpg',
    specs: '1.5L Diesel/Petrol · 17.4 kmpl · ₹11.00L - ₹20.00L',
    details: 'Premium compact SUV, loaded with high-end tech, ADAS L2, and sunroof.',
    filename: 'creta.jpg',
  },
  {
    name: 'Toyota Fortuner',
    slug: 'toyota-fortuner',
    image: '/images/fortuner.jpg',
    specs: '2.8L Diesel · 10.0 kmpl · ₹33.00L - ₹52.00L',
    details: 'Full-size robust SUV with bulletproof reliability, 4x4, and immense presence.',
    filename: 'fortuner.jpg',
  },
];

export default function ExamplePredictions({ onRunScan }) {
  const [loadingIndex, setLoadingIndex] = useState(null);

  const handleTestImage = async (car, index) => {
    try {
      setLoadingIndex(index);
      
      // Fetch the pre-loaded image from our public directory
      const response = await fetch(car.image);
      if (!response.ok) throw new Error('Image asset not found');
      
      const blob = await response.blob();
      const file = new File([blob], car.filename, { type: 'image/jpeg' });
      
      // Run the scan via parent handler
      await onRunScan(file);
      
      // Smoothly scroll back to the top upload panel where the active scan shows up
      window.scrollTo({ top: 120, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to parse example image:', error);
      alert('Could not resolve the local example image. Make sure assets are generated.');
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <div className="examples-container">
      <div className="examples-header">
        <span className="eyebrow">Interactive Testing</span>
        <h2>Verify the AI Model in Real-Time</h2>
        <p>No image handy? Trigger diagnostics on these pre-analyzed examples to run a real backend classification request.</p>
      </div>

      <div className="examples-grid">
        {exampleCars.map((car, index) => (
          <div key={car.name} className="example-card">
            <div className="example-image-wrapper">
              <img src={car.image} alt={car.name} onError={(e) => {
                // If local image fails, use a beautiful placeholder or let the user know
                e.target.src = `https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&q=80&w=600`;
              }} />
              <div className="example-image-overlay" />
              <div className="example-badge">
                <Cpu size={12} />
                <span>Ready to Analyze</span>
              </div>
            </div>

            <div className="example-info">
              <h3>{car.name}</h3>
              <p className="example-specs">{car.specs}</p>
              <p className="example-details">{car.details}</p>

              <button
                type="button"
                className="example-btn-primary"
                onClick={() => handleTestImage(car, index)}
                disabled={loadingIndex !== null}
              >
                {loadingIndex === index ? (
                  <>
                    <div className="btn-spinner" />
                    Analyzing pixels...
                  </>
                ) : (
                  <>
                    <Play size={14} fill="currentColor" />
                    Test AI Model
                    <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
