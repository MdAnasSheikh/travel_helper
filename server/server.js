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
const { generateToken, doubleCsrfProtection } = doubleCsrf({
  getSecret: () => process.env.JWT_SECRET,
  cookieName: '_csrf',
  cookieOptions: {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  },
  size: 64,
  ignoredMethods: ['GET', 'HEAD', 'OPTIONS'],
});

// Expose CSRF token to the SPA
app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: generateToken(req, res) });
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
