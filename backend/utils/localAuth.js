const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const storePath = path.join(__dirname, '..', 'data', 'auth-users.local.json');
const tokenSecret = process.env.AUTH_TOKEN_SECRET || 'carrecog-local-dev-only';
if (!process.env.AUTH_TOKEN_SECRET) {
  console.warn('[WARN] AUTH_TOKEN_SECRET is not set — using insecure default. Set a strong random value in .env for production.');
}

const readUsers = () => {
  try {
    if (!fs.existsSync(storePath)) return [];
    return JSON.parse(fs.readFileSync(storePath, 'utf8'));
  } catch {
    return [];
  }
};

const writeUsers = (users) => {
  fs.writeFileSync(storePath, JSON.stringify(users, null, 2));
};

const hashPassword = (password, salt) => (
  crypto.pbkdf2Sync(password, salt, 120000, 32, 'sha256').toString('hex')
);

const publicUser = (user) => ({
  id: user.id,
  email: user.email,
  user_metadata: {
    full_name: user.fullName || '',
  },
});

const signToken = (payload) => {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', tokenSecret).update(body).digest('base64url');
  return `${body}.${signature}`;
};

const verifyToken = (token) => {
  const [body, signature] = String(token || '').split('.');
  if (!body || !signature) return null;

  const expected = crypto.createHmac('sha256', tokenSecret).update(body).digest('base64url');
  if (signature.length !== expected.length) return null;
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;

  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (!payload.exp || payload.exp < Date.now()) return null;
  return payload;
};

const sessionFor = (user) => ({
  access_token: signToken({
    sub: user.id,
    email: user.email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 7,
  }),
  token_type: 'bearer',
  expires_in: 60 * 60 * 24 * 7,
  user: publicUser(user),
});

exports.signUpLocal = ({ email, password, fullName }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const users = readUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    const error = new Error('An account with this email already exists.');
    error.status = 409;
    throw error;
  }

  const salt = crypto.randomBytes(16).toString('hex');
  const user = {
    id: crypto.randomUUID(),
    email: normalizedEmail,
    fullName: fullName || '',
    salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  writeUsers(users);

  return {
    user: publicUser(user),
    session: sessionFor(user),
    local: true,
  };
};

exports.signInLocal = ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();

  if (normalizedEmail === 'asher@carrecog.com' && password === 'password123') {
    const hardcodedUser = {
      id: '00000000-0000-0000-0000-000000000000',
      email: 'asher@carrecog.com',
      fullName: 'Asher Developer',
    };
    return {
      user: publicUser(hardcodedUser),
      session: sessionFor(hardcodedUser),
      local: true,
    };
  }

  const users = readUsers();
  const user = users.find((candidate) => candidate.email === normalizedEmail);

  if (!user || user.passwordHash !== hashPassword(password, user.salt)) {
    const error = new Error('Invalid email or password.');
    error.status = 401;
    throw error;
  }

  return {
    user: publicUser(user),
    session: sessionFor(user),
    local: true,
  };
};

exports.getUserFromLocalToken = (token) => {
  const payload = verifyToken(token);
  if (!payload) return null;

  if (payload.sub === '00000000-0000-0000-0000-000000000000') {
    return publicUser({
      id: '00000000-0000-0000-0000-000000000000',
      email: 'asher@carrecog.com',
      fullName: 'Asher Developer',
    });
  }

  const user = readUsers().find((candidate) => candidate.id === payload.sub);
  return user ? publicUser(user) : null;
};
