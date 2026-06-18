import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  CircleGauge,
  Fuel,
  GitCompareArrows,
  ListChecks,
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import Loader from '../components/Common/Loader';
import { getCarBySlug } from '../services/api';
import { formatPriceRange } from '../utils/formatters';

const specItems = [
  { label: 'Engine', key: 'engine', icon: CircleGauge },
  { label: 'Power', key: 'power', icon: CircleGauge },
  { label: 'Torque', key: 'torque', icon: CircleGauge },
  { label: 'Transmission', key: 'transmission', icon: GitCompareArrows },
  { label: 'Fuel Type', key: 'fuel_type', icon: Fuel },
  { label: 'Mileage', key: 'mileage', icon: Fuel },
  { label: 'Fuel Tank', key: 'fuel_tank', icon: Fuel },
  { label: 'Seating', key: 'seating', icon: ListChecks },
];

const CarDetailPage = () => {
  const { slug } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadCar = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await getCarBySlug(slug);
        setCar(data.car || null);
      } catch (err) {
        setCar(null);
        setError(err.response?.data?.message || 'Unable to load this vehicle.');
      } finally {
        setLoading(false);
      }
    };

    loadCar();
  }, [slug]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <Loader text="Loading vehicle details..." subtext="Fetching the selected car sheet" />
      </div>
    );
  }

  if (!car) {
    return (
      <div className="mx-auto max-w-7xl px-6 pb-16">
        <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-10 text-center">
          <h1 className="text-3xl font-bold text-white">Vehicle not found</h1>
          <p className="mt-3 text-sm text-[var(--text-secondary)]">{error || 'The selected car is not available in the catalog.'}</p>
          <Link to="/explore" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-white">
            <ArrowLeft size={16} />
            Back to catalog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-6 pb-16 pt-8">
      <Link to="/explore" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors">
        <ArrowLeft size={16} />
        Back to catalog
      </Link>

      <section className="mt-6 grid gap-8 lg:grid-cols-[1fr_420px]">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-8 sm:p-10 backdrop-blur-3xl shadow-none"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-[var(--accent-primary)]">{car.brand}</p>
          <h1 className="mt-4 text-2xl font-extrabold font-display tracking-tight text-white sm:text-4xl leading-tight">{car.name}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[var(--text-secondary)]">
            {car.body_type || car.segment || 'Vehicle'} for the market, catalogued with launch-year context, specifications and ownership-oriented highlights.
          </p>

          <div className="mt-8 flex flex-wrap gap-2">
            {[car.segment, car.body_type, car.fuel_type, car.transmission, car.year].filter(Boolean).map((item) => (
              <span key={item} className="rounded-none border border-[var(--border-color)] bg-white/[0.02] px-4 py-1.5 text-xs font-mono tracking-wide text-[var(--text-secondary)]">
                {item}
              </span>
            ))}
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {specItems.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.key} className="rounded-none border border-[var(--border-color)] bg-white/[0.015] p-5 hover:border-[var(--accent-primary)]/40 transition-all duration-300 hover:-translate-y-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-none bg-[rgba(229,184,59,0.05)] border border-[rgba(229,184,59,0.18)] text-[var(--accent-primary)]">
                    <Icon size={16} />
                  </div>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">{item.label}</p>
                  <p className="mt-1.5 text-base font-semibold text-white">{car[item.key] || 'Not listed'}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        <motion.aside
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-6"
        >
          <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 backdrop-blur-3xl shadow-none hover:border-[var(--accent-primary)]/20 transition-all duration-300">
            <div className="flex h-11 w-11 items-center justify-center rounded-none bg-[rgba(229,184,59,0.05)] border border-[rgba(229,184,59,0.18)] text-[var(--accent-primary)]">
              <BadgeIndianRupee size={18} />
            </div>
            <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Price band</p>
            <p className="mt-2 text-2.5xl font-bold text-white font-display tracking-tight">{formatPriceRange(car.price_min, car.price_max)}</p>
            <p className="mt-3 text-xs leading-5 text-[var(--text-secondary)]">Use this as the quick public-facing estimate range for the selected trim family.</p>
          </div>

          <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 backdrop-blur-3xl shadow-none hover:border-[var(--accent-primary)]/20 transition-all duration-300">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)]">Comparison tools</p>
            <h2 className="mt-3 text-lg font-bold font-display tracking-tight text-white leading-normal">Line up specs side-by-side</h2>
            <Link
              to={`/compare?cars=${car.slug}`}
              className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-none bg-[var(--accent-primary)] px-5 py-3 text-xs font-bold tracking-wider text-[#0a0b0c] hover:bg-[var(--accent-primary-dim)] transition-all duration-300 hover:-translate-y-0.5"
            >
              Compare this car
              <ArrowRight size={14} />
            </Link>
          </div>
        </motion.aside>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 backdrop-blur-3xl">
          <h2 className="text-lg font-bold font-display tracking-tight text-white">Features</h2>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(car.features || []).length > 0 ? (
              car.features.map((feature) => (
                <span key={feature} className="rounded-none border border-[var(--border-color)] bg-white/[0.015] px-3.5 py-1.5 text-xs text-[var(--text-secondary)] font-mono">
                  {feature}
                </span>
              ))
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">No feature list available.</p>
            )}
          </div>
        </div>

        <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 backdrop-blur-3xl">
          <h2 className="text-lg font-bold font-display tracking-tight text-white">Pros and cons</h2>
          <div className="mt-5 grid gap-5">
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-emerald-400 font-bold">Pros</p>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-[var(--text-secondary)] list-disc pl-4">
                {(car.pros || []).length > 0 ? car.pros.map((item) => <li key={item}>{item}</li>) : <li>No pros listed.</li>}
              </ul>
            </div>
            <div>
              <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-red-400 font-bold">Cons</p>
              <ul className="mt-2.5 space-y-1.5 text-xs leading-5 text-[var(--text-secondary)] list-disc pl-4">
                {(car.cons || []).length > 0 ? car.cons.map((item) => <li key={item}>{item}</li>) : <li>No cons listed.</li>}
              </ul>
            </div>
          </div>
        </div>

        <div className="rounded-none border border-[var(--border-color)] bg-[var(--bg-secondary)] p-6 backdrop-blur-3xl">
          <h2 className="text-lg font-bold font-display tracking-tight text-white">Available colors</h2>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {(car.colors || []).length > 0 ? (
              car.colors.map((color) => (
                <span key={color} className="rounded-none border border-[var(--border-color)] bg-white/[0.015] px-3.5 py-1.5 text-xs text-[var(--text-secondary)] font-mono">
                  {color}
                </span>
              ))
            ) : (
              <p className="text-xs text-[var(--text-secondary)]">No colors listed.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarDetailPage;
