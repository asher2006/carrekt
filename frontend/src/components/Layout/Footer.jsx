import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="site-footer">
    <div className="footer-inner">
      <div>
        <p className="footer-kicker">CarRecog Platform</p>
        <p className="footer-copy">
          AI-assisted recognition, catalog exploration, and side-by-side car intelligence for Indian and global models.
        </p>
      </div>

      <div className="footer-links">
        <Link to="/">
          Scanner
        </Link>
        <Link to="/explore">
          Catalog
        </Link>
        <Link to="/compare">
          Compare
        </Link>
        <Link to="/auth">
          Account
        </Link>
      </div>
    </div>
  </footer>
);

export default Footer;
