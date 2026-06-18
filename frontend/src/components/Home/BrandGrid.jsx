import './BrandGrid.css';

const brands = [
  { name: 'Hyundai', description: 'Creta, Venue, i20, Verna' },
  { name: 'Honda', description: 'City, Amaze, Elevate' },
  { name: 'Toyota', description: 'Fortuner, Camry, Corolla, RAV4' },
  { name: 'Tata', description: 'Nexon, Punch, Harrier, Safari' },
  { name: 'Mahindra', description: 'Thar, XUV700, Scorpio-N' },
  { name: 'Kia', description: 'Seltos, Sonet, Carens' },
  { name: 'Maruti Suzuki', description: 'Swift, Baleno, Brezza, Alto' },
  { name: 'MG', description: 'Hector, Astor, ZS EV' },
];

export default function BrandGrid() {
  return (
    <div className="brand-container">
      <div className="brand-header">
        <span className="eyebrow">Supported Inventory</span>
        <h2>Trained Brand Classifications</h2>
        <p>
          CarRecog is optimized for localized and global vehicle models. Swiping across these categories accesses structural data instantly.
        </p>
      </div>

      <div className="brand-grid">
        {brands.map((brand) => (
          <div key={brand.name} className="brand-card">
            <div className="brand-glow" />
            <div className="brand-content">
              <h3>{brand.name}</h3>
              <p>{brand.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
