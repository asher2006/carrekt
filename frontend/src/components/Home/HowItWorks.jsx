import { UploadCloud, ScanLine, Database, LayoutDashboard } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    number: '01',
    icon: UploadCloud,
    title: 'Image Intake',
    description: 'Drop an exterior vehicle snapshot or start the camera capture pipeline directly from the dashboard.',
  },
  {
    number: '02',
    icon: ScanLine,
    title: 'Computer Vision Scan',
    description: 'The neural network model localizes bounding box coordinates and extracts high-dimensional visual signatures.',
  },
  {
    number: '03',
    icon: Database,
    title: 'Deep Lookup',
    description: 'CarRecog references the classified class against the spec sheet catalog to query brand and model mappings.',
  },
  {
    number: '04',
    icon: LayoutDashboard,
    title: 'Platform Telemetry',
    description: 'Displays a live dashboard with circular performance meters, alternatives list, and category comparison panels.',
  },
];

export default function HowItWorks() {
  return (
    <div className="how-container">
      <div className="how-header">
        <span className="eyebrow">Pipeline Sequence</span>
        <h2>How the Diagnostic System Operates</h2>
        <p>A seamless transition from raw pixel data into technical specifications and comparison graphs.</p>
      </div>

      <div className="how-grid">
        <div className="how-connect-line" />
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div key={step.number} className="how-card">
              <div className="how-step-badge">{step.number}</div>
              <div className="how-icon-box">
                <Icon size={24} />
              </div>
              <h3>{step.title}</h3>
              <p>{step.description}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
