import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeIndianRupee,
  Filter,
  Fuel,
  GitCompareArrows,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import Loader from '../components/Common/Loader';
import { getBrands, getCars } from '../services/api';
import { formatPriceRange } from '../utils/formatters';
import './ExplorePage.css';

const ExplorePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [cars, setCars] = useState([]);
  const [allCars, setAllCars] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    fuelType: searchParams.get('fuelType') || '',
    segment: searchParams.get('segment') || '',
    search: searchParams.get('search') || '',
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  const debounceRef = useRef(null);

  // Load brands once on mount
  useEffect(() => {
    const loadBrands = async () => {
      try {
        const [brandsData, carsData] = await Promise.all([getBrands(), getCars()]);
        setBrands(brandsData.brands || []);
        setAllCars(carsData.cars || []);
      } catch {
        setBrands([]);
        setAllCars([]);
      }
    };

    loadBrands();
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [filters.search]);

  // Fetch cars when filters change (using debounced search)
  useEffect(() => {
    const loadCars = async () => {
      setLoading(true);
      try {
        const data = await getCars({ ...filters, search: debouncedSearch });
        setCars(data.cars || []);
      } catch {
        setCars([]);
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, [filters.brand, filters.fuelType, filters.segment, debouncedSearch]);

  const handleFilterChange = (key, value) => {
    const nextFilters = { ...filters, [key]: value };
    setFilters(nextFilters);

    const nextParams = {};
    Object.entries(nextFilters).forEach(([filterKey, filterValue]) => {
      if (filterValue) nextParams[filterKey] = filterValue;
    });
    setSearchParams(nextParams);
  };

  const clearFilters = () => {
    const emptyFilters = {
      brand: '',
      fuelType: '',
      segment: '',
      search: '',
    };
    setFilters(emptyFilters);
    setSearchParams({});
  };

  const segments = useMemo(
    () => [...new Set(allCars.map((car) => car.segment).filter(Boolean))].sort(),
    [allCars],
  );

  const fuelTypes = useMemo(
    () => [...new Set(allCars.flatMap((car) => (car.fuel_type || '').split('/').map((item) => item.trim())).filter(Boolean))].sort(),
    [allCars],
  );

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const featuredCar = cars[0];

  return (
    <div className="catalog-screen">
      <section className="catalog-hero">
        <div className="catalog-hero__copy">
          <div className="catalog-kicker">
            <Filter size={14} />
            Vehicle catalog
          </div>
          <h1>Recognition catalog built for choosing, not browsing forever.</h1>
          <p>
            Search models the scanner can identify, filter by what matters, then move directly into specs or comparison.
          </p>
        </div>

        <div className="catalog-signal-card">
          <span>Matched inventory</span>
          <strong>{loading ? '--' : cars.length}</strong>
          <p>{activeFilterCount ? `${activeFilterCount} active filters` : 'Ready for scanner handoff'}</p>
        </div>
      </section>

      <section className="catalog-layout">
        <aside className="catalog-filters">
          <div className="catalog-panel-heading">
            <div>
              <p>Filters</p>
              <h2>Find the right car</h2>
            </div>
            <SlidersHorizontal size={18} />
          </div>

          <div className="catalog-filter-stack">
            <label>
              <span>Search</span>
              <div className="catalog-search">
                <Search size={16} />
                <input
                  placeholder="Search by name"
                  value={filters.search}
                  onChange={(event) => handleFilterChange('search', event.target.value)}
                />
              </div>
            </label>

            <label>
              <span>Brand</span>
              <select
                value={filters.brand}
                onChange={(event) => handleFilterChange('brand', event.target.value)}
              >
                <option value="">All brands</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Fuel type</span>
              <select
                value={filters.fuelType}
                onChange={(event) => handleFilterChange('fuelType', event.target.value)}
              >
                <option value="">All fuel types</option>
                {fuelTypes.map((fuel) => (
                  <option key={fuel} value={fuel}>{fuel}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Segment</span>
              <select
                value={filters.segment}
                onChange={(event) => handleFilterChange('segment', event.target.value)}
              >
                <option value="">All segments</option>
                {segments.map((segment) => (
                  <option key={segment} value={segment}>{segment}</option>
                ))}
              </select>
            </label>
          </div>

          <button type="button" className="catalog-clear" onClick={clearFilters}>
            Clear filters
          </button>
        </aside>

        <div className="catalog-results">
          {loading ? (
            <Loader text="Loading catalog..." subtext="Syncing available models" />
          ) : (
            <>
              <div className="catalog-results-bar">
                <div>
                  <p>Results</p>
                  <strong>{cars.length} cars matched</strong>
                </div>
                <div>
                  <Fuel size={14} />
                  Live catalog API
                </div>
              </div>

              {featuredCar && (
                <article className="featured-catalog-card">
                  <div>
                    <p>{featuredCar.brand}</p>
                    <h2>{featuredCar.name}</h2>
                    <span>
                      {featuredCar.segment || featuredCar.body_type || 'Vehicle'} · {featuredCar.fuel_type || 'Fuel not listed'} · {featuredCar.year || 'Current'}
                    </span>
                  </div>
                  <div className="featured-actions">
                    <Link to={`/explore/${featuredCar.slug}`}>Open details <ArrowRight size={16} /></Link>
                    <Link to={`/compare?cars=${featuredCar.slug}`}>Compare <GitCompareArrows size={16} /></Link>
                  </div>
                </article>
              )}

              {cars.length === 0 ? (
                <div className="catalog-empty">
                  <h3>No cars found</h3>
                  <p>Try a broader search or reset the active filters.</p>
                </div>
              ) : (
                <div className="catalog-grid">
                  {cars.map((car, index) => (
                    <motion.article
                      key={car.slug}
                      className="catalog-card"
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.035, 0.22) }}
                    >
                      <div className="catalog-card__top">
                        <div>
                          <p>{car.brand}</p>
                          <h3>{car.name}</h3>
                        </div>
                        <span>{car.year || 'Current'}</span>
                      </div>

                      <div className="catalog-card__visual">
                        <div className="mini-car">
                          <span />
                        </div>
                        <BadgeIndianRupee size={17} />
                      </div>

                      <div className="catalog-card__chips">
                        {[car.segment, car.body_type, car.fuel_type, car.transmission].filter(Boolean).slice(0, 4).map((item, chipIndex) => (
                          <span key={`${car.slug}-${item}-${chipIndex}`}>{item}</span>
                        ))}
                      </div>

                      <div className="catalog-card__specs">
                        <div>
                          <p>Price band</p>
                          <strong>{formatPriceRange(car.price_min, car.price_max)}</strong>
                        </div>
                        <div>
                          <p>Engine</p>
                          <strong>{car.engine || 'Not listed'}</strong>
                        </div>
                      </div>

                      <div className="catalog-card__actions">
                        <Link to={`/explore/${car.slug}`}>
                          Details
                          <ArrowRight size={16} />
                        </Link>
                        <Link to={`/compare?cars=${car.slug}`}>
                          Compare
                          <GitCompareArrows size={16} />
                        </Link>
                      </div>
                    </motion.article>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ExplorePage;
