require('dotenv').config();

const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const { sequelize } = require('./models');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const bookingsRoutes = require('./routes/bookings');

const app = express();
const PORT = process.env.PORT || 5000;

// CSRF protection: state-changing requests from browsers must carry the
// custom X-Requested-With header, which cross-origin requests cannot set
// without a CORS preflight that our restrictive CORS policy will block.
function csrfGuard(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) return next();

  const requested = req.headers['x-requested-with'];
  if (!requested || requested.toLowerCase() !== 'xmlhttprequest') {
    return res.status(403).json({ error: 'Forbidden: missing CSRF header.' });
  }
  next();
}

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(csrfGuard);

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
