import { useState } from 'react';
import { motion } from 'framer-motion';
import { LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user, hasSupabaseConfig } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  if (user) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setLoading(true);

    try {
      const result = isLogin
        ? await signIn(email, password)
        : await signUp(email, password, fullName);

      if (result?.error) throw result.error;

      if (!isLogin && !result?.data?.session) {
        setNotice('Account created. Check your email if confirmation is enabled, then sign in to access the scanner.');
        setIsLogin(true);
        return;
      }

      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-grid">
        <section className="auth-copy-panel">
          <div className="auth-kicker">
            <LockKeyhole size={14} />
            Secure operator access
          </div>
          <h1>Sign in before scanning vehicles.</h1>
          <p>
            CarRecog now requires an authenticated account for recognition, catalog browsing, and comparison so every scan belongs to a controlled session.
          </p>

          <div className="auth-feature-grid">
            <div>
              <p>Status</p>
              <strong>{hasSupabaseConfig ? 'Auth configured' : 'Auth setup required'}</strong>
              <span>
                {hasSupabaseConfig ? 'Supabase keys detected. Sign in to continue.' : 'Set Supabase frontend env vars before the protected app can be used.'}
              </span>
            </div>
            <div>
              <p>Access rule</p>
              <strong>Required</strong>
              <span>
                Scanner, catalog, details, and compare routes redirect here until a session exists.
              </span>
            </div>
          </div>

          <div className="auth-flow-card">
            <ShieldCheck size={18} />
            <div>
              <strong>Protected recognition flow</strong>
              <p>Authenticate, upload a car image, review brand/model confidence, then continue into specs or comparison.</p>
            </div>
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="auth-form-panel"
        >
          <div className="auth-form-heading">
            <p>{isLogin ? 'Sign in' : 'Create account'}</p>
            <h2>{isLogin ? 'Welcome back' : 'Create an operator account'}</h2>
          </div>

          {!hasSupabaseConfig && (
            <div className="auth-warning">
              <div>
                <ShieldAlert size={18} />
                <p>
                  Authentication is compulsory. Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` in the root `.env`, then restart the backend.
                </p>
              </div>
            </div>
          )}

          {location.state?.from && hasSupabaseConfig && (
            <div className="auth-required-note">
              Authentication required before using the scanner.
            </div>
          )}

          {error && (
            <div className="auth-error-message">
              {error}
            </div>
          )}

          {notice && (
            <div className="auth-success-message">
              {notice}
            </div>
          )}

          <form className="auth-form-fields" onSubmit={handleSubmit}>
            {!isLogin && (
              <label>
                <span>Full name</span>
                <input
                  type="text"
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Aarav Mehta"
                  required={!isLogin}
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Minimum 6 characters"
                required
                minLength="6"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !hasSupabaseConfig}
              className="auth-submit"
            >
              {loading ? 'Working...' : isLogin ? 'Sign in and scan' : 'Create account'}
            </button>
          </form>

          <p className="auth-toggle-copy">
            {isLogin ? 'Need an account?' : 'Already have an account?'}{' '}
            <button type="button" onClick={() => setIsLogin((value) => !value)}>
              {isLogin ? 'Create one' : 'Sign in instead'}
            </button>
          </p>
        </motion.section>
      </div>
    </div>
  );
};

export default AuthPage;
