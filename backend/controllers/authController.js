const { createClient } = require('@supabase/supabase-js');
const { getUserFromLocalToken, signInLocal, signUpLocal } = require('../utils/localAuth');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

const validateAuthInput = (email, password, isSignUp = false) => {
  if (!email || !password) return 'Email and password are required.';
  if (!EMAIL_RE.test(email)) return 'Please provide a valid email address.';
  if (password.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  return null;
};

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

const authClient = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

const missingAuthMessage = 'Authentication is not configured. Add SUPABASE_URL and SUPABASE_ANON_KEY to the root .env file, then restart the backend.';

const requireAuthClient = (res) => {
  if (authClient) return true;
  res.status(503).json({ success: false, message: missingAuthMessage });
  return false;
};

const shouldUseLocalFallback = (error) => (
  !authClient || error?.message === 'fetch failed' || error?.name === 'AuthRetryableFetchError'
);

const sendLocalFallback = (res, data, status = 200) => {
  res.status(status).json({
    success: true,
    data,
    authMode: 'local',
    message: 'Using local development auth because Supabase is unreachable.',
  });
};

exports.signUp = async (req, res, next) => {
  try {
    const { email, password, fullName } = req.body;
    const validationError = validateAuthInput(email, password, true);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!authClient) {
      return sendLocalFallback(res, signUpLocal({ email, password, fullName }));
    }

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName || '' },
      },
    });

    if (shouldUseLocalFallback(error)) {
      return sendLocalFallback(res, signUpLocal({ email, password, fullName }));
    }

    if (error) {
      return res.status(400).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    if (shouldUseLocalFallback(err)) {
      try {
        return sendLocalFallback(res, signUpLocal(req.body));
      } catch (localErr) {
        return res.status(localErr.status || 400).json({ success: false, message: localErr.message });
      }
    }
    next(err);
  }
};

exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const validationError = validateAuthInput(email, password);
    if (validationError) {
      return res.status(400).json({ success: false, message: validationError });
    }

    if (!authClient) {
      return sendLocalFallback(res, signInLocal({ email, password }));
    }

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });

    if (shouldUseLocalFallback(error)) {
      return sendLocalFallback(res, signInLocal({ email, password }));
    }

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    if (shouldUseLocalFallback(err)) {
      try {
        return sendLocalFallback(res, signInLocal(req.body));
      } catch (localErr) {
        return res.status(localErr.status || 401).json({ success: false, message: localErr.message });
      }
    }
    next(err);
  }
};

exports.getAuthUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (!token) {
      return res.status(401).json({ success: false, message: 'Missing access token.' });
    }

    const localUser = getUserFromLocalToken(token);
    if (localUser) {
      return res.json({ success: true, data: { user: localUser }, authMode: 'local' });
    }

    if (!requireAuthClient(res)) return;

    const { data, error } = await authClient.auth.getUser(token);

    if (error) {
      return res.status(401).json({ success: false, message: error.message });
    }

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
};
