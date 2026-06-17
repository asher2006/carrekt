import { Menu, ScanSearch, ShieldCheck, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const navItems = [
  { to: '/', label: 'Scan' },
  { to: '/explore', label: 'Catalog' },
  { to: '/compare', label: 'Compare' },
];

const navLinkClass = ({ isActive }) => `nav-link ${isActive ? 'is-active' : ''}`;

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, signOut } = useAuth();

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

        <nav className="desktop-nav">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-actions">
          <div className="beta-chip">
            <ShieldCheck size={14} />
            Public beta ready
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
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={navLinkClass}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}
            <Link
              to="/auth"
              className="nav-account"
              onClick={() => setMobileOpen(false)}
            >
              {user ? 'Account' : 'Sign in'}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
