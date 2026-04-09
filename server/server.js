require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { doubleCsrf } = require('csrf-csrf');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const bookingsRoutes = require('./routes/bookings');

// Fail fast on missing required environment variables
const REQUIRED_ENV = ['JWT_SECRET', 'DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD'];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// CSRF protection using the double-submit cookie pattern.
// The client must read the `x-csrf-token` value from the `_csrf` cookie
// and send it back in the `x-csrf-token` request header for all
// state-changing requests (POST, PUT, PATCH, DELETE).
//
// Use the full csrfSetup object so we are compatible with both csrf-csrf v2
// (which exports `generateToken`) and v4 (which exports `generateCsrfToken`).
const csrfSetup = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET,
  // Use the JWT auth cookie as the session identifier when the user is logged in,
  // which binds the CSRF token to that specific authentication session.
  // For unauthenticated requests (login / register), fall back to an empty string
  // so tokens are still generated — the double-submit cookie pattern remains secure
  // because the token is also stored in a httpOnly cookie that the attacker cannot read.
  getSessionIdentifier: (req) => req.cookies?.token || '',
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});
const generateToken = csrfSetup.generateToken || csrfSetup.generateCsrfToken;
const { doubleCsrfProtection } = csrfSetup;

// Expose CSRF token to the SPA
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
});

// Root route — helpful hint for developers hitting localhost:5000 directly.
// Registered before CSRF protection so it is always accessible.
app.get('/', (req, res) => {
  res.json({ message: 'TravelCompare API — use /api/health to check status.' });
});

app.use(doubleCsrfProtection);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/bookings', bookingsRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler
app.use((err, req, res, next) => {
  // CSRF validation failures come through as ForbiddenError (status 403) from csrf-csrf.
  // Check both the numeric status and the error name / code for maximum compatibility
  // across csrf-csrf versions.
  if (
    err.status === 403 ||
    err.statusCode === 403 ||
    err.code === 'EBADCSRFTOKEN' ||
    err.name === 'ForbiddenError'
  ) {
    return res.status(403).json({ error: 'Invalid or missing CSRF token.' });
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error.' });
});

// Start server after syncing database
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Use `alter` in development to keep schema in sync with models.
    // In production, use proper migrations instead.
    const syncOptions = process.env.NODE_ENV === 'production' ? {} : { alter: true };
    await sequelize.sync(syncOptions);
    console.log('Database models synchronised.');

    app.listen(PORT, () => {
      console.log(`TravelCompare server running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
})();
