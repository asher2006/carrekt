import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import { useAuth } from './context/AuthContext';
import './App.css';

const HomePage = lazy(() => import('./pages/HomePage'));
const ExplorePage = lazy(() => import('./pages/ExplorePage'));
const ComparePage = lazy(() => import('./pages/ComparePage'));
const CarDetailPage = lazy(() => import('./pages/CarDetailPage'));
const AuthPage = lazy(() => import('./pages/AuthPage'));

const RouteLoader = () => (
  <div className="mx-auto flex min-h-[50vh] w-full max-w-7xl items-center justify-center px-6">
    <div className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-[var(--text-secondary)]">
      Loading interface...
    </div>
  </div>
);

const RequireAuth = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <RouteLoader />;
  }

  if (!user) {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <div className="app-shell">
        <Navbar />
        <main className="app-main">
          <Suspense fallback={<RouteLoader />}>
            <Routes>
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/" element={<RequireAuth><HomePage /></RequireAuth>} />
              <Route path="/explore" element={<RequireAuth><ExplorePage /></RequireAuth>} />
              <Route path="/explore/:slug" element={<RequireAuth><CarDetailPage /></RequireAuth>} />
              <Route path="/compare" element={<RequireAuth><ComparePage /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
