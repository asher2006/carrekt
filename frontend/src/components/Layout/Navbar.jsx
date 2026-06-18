import { useState } from 'react';
import { Menu, ScanSearch, ShieldCheck, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Scan Dashboard' },
  { to: '/explore', label: 'Car Catalog' },
  { to: '/compare', label: 'Comparison Lab' },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link to="/" className="brand-lockup">
          <div className="brand-mark">
            <ScanSearch size={20} />
          </div>
          <div>
            <p>Vehicle Vision</p>
            <strong>CarRecog</strong>
          </div>
        </Link>

        {/* Desktop Navigation with Sliding Pill */}
        <nav className="desktop-nav">
          {navItems.map((item) => {
            const isActive =
              item.to === '/'
                ? currentPath === '/'
                : currentPath.startsWith(item.to);

            return (
              <Link
                key={item.to}
                to={item.to}
                className={`nav-link-item ${isActive ? 'is-active' : ''}`}
              >
                {isActive && (
                  <motion.div
                    layoutId="desktop-nav-pill"
                    className="nav-active-pill"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="nav-link-text">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="nav-actions">
          <div className="beta-chip">
            <span className="live-pulsing-bulb" />
            <ShieldCheck size={14} />
            AI Pipeline Active
          </div>
          {user ? (
            <button
              type="button"
              onClick={() => signOut()}
              className="nav-ghost"
            >
              Sign out
            </button>
          ) : (
            <Link
              to="/auth"
              className="nav-account"
            >
              Account
            </Link>
          )}
        </div>

        <button
          type="button"
          className="nav-toggle"
          aria-label="Toggle navigation"
          onClick={() => setMobileOpen((open) => !open)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="mobile-panel">
          <nav>
            {navItems.map((item) => {
              const isActive =
                item.to === '/'
                  ? currentPath === '/'
                  : currentPath.startsWith(item.to);

              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`nav-link-item ${isActive ? 'is-active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  <span className="nav-link-text">{item.label}</span>
                </Link>
              );
            })}
            {user ? (
              <button
                type="button"
                onClick={() => {
                  signOut();
                  setMobileOpen(false);
                }}
                className="nav-ghost w-full mt-2"
              >
                Sign out
              </button>
            ) : (
              <Link
                to="/auth"
                className="nav-account w-full mt-2 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
