import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompareArrows, MoveRight, Scale, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import Loader from '../components/Common/Loader';
import { compareCars, getCars } from '../services/api';
import { formatPriceRange } from '../utils/formatters';

const specRows = [
  { key: 'price', label: 'Price band' },
  { key: 'engine', label: 'Engine' },
  { key: 'power', label: 'Power' },
  { key: 'torque', label: 'Torque' },
  { key: 'transmission', label: 'Transmission' },
  { key: 'fuel_type', label: 'Fuel type' },
  { key: 'mileage', label: 'Mileage' },
  { key: 'fuel_tank', label: 'Fuel tank' },
  { key: 'seating', label: 'Seating' },
  { key: 'body_type', label: 'Body type' },
  { key: 'segment', label: 'Segment' },
  { key: 'year', label: 'Year' },
];

const ComparePage = () => {
  const [searchParams] = useSearchParams();
  const seededSlug = searchParams.get('cars') || '';
  const [allCars, setAllCars] = useState([]);
  const [selectedSlugs, setSelectedSlugs] = useState([seededSlug, '', '']);
  const [compareData, setCompareData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [carsLoading, setCarsLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      try {
        const data = await getCars();
        setAllCars(data.cars || []);
      } catch {
        setAllCars([]);
      } finally {
        setCarsLoading(false);
      }
    };

    loadCars();
  }, []);

  const validSlugsKey = selectedSlugs.filter(Boolean).join(',');
  const validSlugs = useMemo(() => selectedSlugs.filter(Boolean), [validSlugsKey]);

  useEffect(() => {
    if (validSlugs.length < 2) {
      return undefined;
    }

    let active = true;

    const loadComparison = async () => {
      setLoading(true);
      try {
        const data = await compareCars(validSlugs);
        if (!active) return;
        setCompareData(data.cars || []);
      } catch {
        if (!active) return;
        setCompareData([]);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadComparison();

    return () => {
      active = false;
    };
  }, [validSlugs]);

  const handleSlotChange = (index, slug) => {
    const next = [...selectedSlugs];
    next[index] = slug;
    setSelectedSlugs(next);
  };

  const selectedCars = useMemo(
    () => validSlugs.map((slug) => allCars.find((car) => car.slug === slug)).filter(Boolean),
    [allCars, validSlugs],
  );
  const visibleCompareData = validSlugs.length >= 2 ? compareData : [];
  const comparisonLoading = validSlugs.length >= 2 && loading;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
      <section className="rounded-[32px] border border-white/5 bg-gradient-to-b from-white/[0.04] to-white/[0.005] px-6 py-10 sm:px-8 shadow-2xl backdrop-blur-3xl">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 py-2 font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-sand)]">
            <Scale size={14} />
            Decision support
          </div>
          <h1 className="mt-6 text-2xl font-bold font-display uppercase tracking-wide text-white sm:text-3.5xl leading-tight">Compare cars side by side</h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--text-secondary)]">
            Pick two or three models from the catalog and line up the specs that matter before you publish or present recommendations.
          </p>
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-white/5 bg-white/[0.015] p-6 backdrop-blur-3xl shadow-xl">
        {carsLoading ? (
          <Loader text="Loading comparison catalog..." subtext="Preparing available vehicles" />
        ) : (
          <>
            <div className="grid gap-4 lg:grid-cols-3">
              {selectedSlugs.map((slug, index) => (
                <div key={`slot-${index}`} className="rounded-[22px] border border-white/5 bg-white/[0.015] p-4 hover:border-[var(--accent-sand)]/20 transition-colors duration-300">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Vehicle {index + 1}</p>
                  <select
                    className="mt-4 w-full rounded-xl border border-white/8 bg-[rgba(8,11,15,0.7)] px-4 py-3 text-sm text-white focus:border-[var(--accent-sand)]/50 focus:ring-1 focus:ring-[var(--accent-sand)]/20 outline-none transition-colors duration-300"
                    value={slug}
                    onChange={(event) => handleSlotChange(index, event.target.value)}
                  >
                    <option value="">Select a car</option>
                    {allCars
                      .filter((car) => !selectedSlugs.includes(car.slug) || car.slug === slug)
                      .map((car) => (
                        <option key={car.slug} value={car.slug}>{car.name}</option>
                      ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {selectedCars.map((car) => (
                  <span key={car.slug} className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs text-white font-mono">
                    {car.name}
                    <button
                      type="button"
                      aria-label={`Remove ${car.name}`}
                      onClick={() => setSelectedSlugs((current) => current.map((item) => (item === car.slug ? '' : item)))}
                      className="text-[var(--text-secondary)] hover:text-[var(--accent-red)] transition-colors duration-200"
                    >
                      <Trash2 size={13} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/8 bg-white/[0.03] px-4 py-1.5 text-xs text-[var(--text-secondary)] font-mono">
                <GitCompareArrows size={14} className="text-[var(--accent-sand)]" />
                {validSlugs.length < 2 ? 'Select at least 2 cars to compare' : `${validSlugs.length} cars selected`}
              </div>
            </div>
          </>
        )}
      </section>

      {comparisonLoading && (
        <div className="mt-8">
          <Loader text="Building comparison..." subtext="Fetching aligned specification rows" />
        </div>
      )}

      {!comparisonLoading && visibleCompareData.length >= 2 && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 overflow-hidden rounded-[28px] border border-white/5 bg-gradient-to-b from-white/[0.03] to-white/[0.005] shadow-2xl backdrop-blur-3xl"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead>
                <tr className="bg-white/[0.025]">
                  <th className="px-6 py-4 text-left font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Specification</th>
                  {visibleCompareData.map((car) => (
                    <th key={car.slug} className="min-w-[240px] px-6 py-4 text-left">
                      <div>
                        <p className="text-base font-semibold text-white">{car.name}</p>
                        <p className="mt-1 text-xs font-mono text-[var(--accent-sand)]">{formatPriceRange(car.price_min, car.price_max)}</p>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {specRows.map((row) => (
                  <tr key={row.key} className="align-top hover:bg-white/[0.01] transition-colors duration-150">
                    <td className="px-6 py-4.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--text-muted)]">{row.label}</td>
                    {visibleCompareData.map((car) => (
                      <td key={`${car.slug}-${row.key}`} className="px-6 py-4.5 text-xs text-white font-mono leading-relaxed">
                        {row.key === 'price' ? formatPriceRange(car.price_min, car.price_max) : car[row.key] || 'Not listed'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="border-t border-white/5 bg-white/[0.01] px-6 py-4.5 text-xs font-mono text-[var(--text-secondary)]">
            Use the comparison table as a final decision layer after recognition or catalog browsing.
          </div>
        </motion.section>
      )}

      {!comparisonLoading && visibleCompareData.length >= 2 && (
        <div className="mt-4 text-center">
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-mono">End of comparison sheet</p>
        </div>
      )}

      {!comparisonLoading && validSlugs.length >= 2 && visibleCompareData.length === 0 && (
        <div className="mt-8 rounded-[28px] border border-white/5 bg-white/[0.015] p-10 text-center">
          <p className="text-base font-semibold text-white">Comparison data is unavailable for this selection.</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">Try another pair from the catalog to continue.</p>
        </div>
      )}

      {!carsLoading && validSlugs.length < 2 && (
        <div className="mt-8 rounded-[28px] border border-dashed border-white/10 bg-white/[0.015] p-12 text-center shadow-lg">
          <p className="text-base font-semibold text-white">Start with at least two models</p>
          <p className="mt-2 text-xs text-[var(--text-secondary)]">The table will appear automatically once we have enough cars to compare.</p>
          <MoveRight className="mx-auto mt-6 text-[var(--accent-sand)] animate-pulse" size={24} />
        </div>
      )}
    </div>
  );
};

export default ComparePage;
