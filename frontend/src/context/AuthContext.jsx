import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAuthUser, signInWithEmail, signUpWithEmail } from '../services/api';

const AuthContext = createContext();
const STORAGE_KEY = 'carrecog.auth.session';

const readStoredSession = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const writeStoredSession = (session) => {
  if (session?.access_token) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
};

const authError = (error) => {
  const message = error?.response?.data?.message || error?.message || 'Authentication failed.';
  return { data: null, error: new Error(message) };
};

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(() => readStoredSession());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(true);

  useEffect(() => {
    let active = true;

    const restoreSession = async () => {
      if (!session?.access_token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getAuthUser(session.access_token);
        if (!active) return;
        setUser(result.data?.user || null);
        setAuthReady(true);
      } catch (error) {
        if (!active) return;
        setSession(null);
        setUser(null);
        setAuthReady(error?.response?.status !== 503);
        writeStoredSession(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    restoreSession();

    return () => {
      active = false;
    };
  }, [session]);

  const commitAuth = useCallback((data) => {
    const nextSession = data?.session || null;
    setSession(nextSession);
    setUser(data?.user || null);
    writeStoredSession(nextSession);
  }, []);

  const signUp = useCallback(async (email, password, fullName) => {
    try {
      const result = await signUpWithEmail(email, password, fullName);
      commitAuth(result.data);
      setAuthReady(true);
      return result;
    } catch (error) {
      setAuthReady(error?.response?.status !== 503);
      return authError(error);
    }
  }, [commitAuth]);

  const signIn = useCallback(async (email, password) => {
    try {
      const result = await signInWithEmail(email, password);
      commitAuth(result.data);
      setAuthReady(true);
      return result;
    } catch (error) {
      setAuthReady(error?.response?.status !== 503);
      return authError(error);
    }
  }, [commitAuth]);

  const signOut = useCallback(() => {
    setSession(null);
    setUser(null);
    writeStoredSession(null);
    return Promise.resolve({ data: null, error: null });
  }, []);

  const value = useMemo(
    () => ({
      user,
      session,
      signUp,
      signIn,
      signOut,
      loading,
      hasSupabaseConfig: authReady,
    }),
    [authReady, loading, session, signIn, signOut, signUp, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
