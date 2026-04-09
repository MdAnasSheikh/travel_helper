const express = require('express');
const { Op } = require('sequelize');
const rateLimit = require('express-rate-limit');
const { Booking } = require('../models');
const auth = require('../middleware/auth');

const router = express.Router();

// Rate-limit booking writes to prevent abuse
const bookingsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

// Rate-limit all bookings routes to prevent brute-force and abuse
router.use(bookingsLimiter);
// All bookings routes require authentication
router.use(auth);

// POST /api/bookings — create a new booking
router.post('/', async (req, res) => {
  try {
    const { from_city, to_city, transport, price, date, company, duration, booking_url } = req.body;

    if (!from_city || typeof from_city !== 'string' || from_city.trim().length === 0) {
      return res.status(400).json({ error: 'Origin city (from_city) is required.' });
    }
    if (!to_city || typeof to_city !== 'string' || to_city.trim().length === 0) {
      return res.status(400).json({ error: 'Destination city (to_city) is required.' });
    }
    if (!transport || !['train', 'flight', 'bus', 'taxi'].includes(transport)) {
      return res
        .status(400)
        .json({ error: 'Transport must be one of: train, flight, bus, taxi.' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) <= 0) {
      return res.status(400).json({ error: 'A valid price is required.' });
    }
    if (!date) {
      return res.status(400).json({ error: 'Travel date is required.' });
    }

    // Validate booking_url if provided
    if (booking_url !== undefined && booking_url !== null) {
      if (typeof booking_url !== 'string' || booking_url.length > 2048) {
        return res.status(400).json({ error: 'Invalid booking URL.' });
      }
      try {
        const parsed = new URL(booking_url);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          return res.status(400).json({ error: 'booking_url must use http or https.' });
        }
      } catch {
        return res.status(400).json({ error: 'booking_url is not a valid URL.' });
      }
    }

    const booking = await Booking.create({
      user_id: req.user.id,
      from_city: from_city.trim(),
      to_city: to_city.trim(),
      transport,
      price: Number(price),
      date,
      company: company ? company.trim() : null,
      duration: duration ? String(duration).trim() : null,
      booking_url: booking_url || null,
    });

    return res.status(201).json({ booking });
  } catch (err) {
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: err.errors[0].message });
    }
    console.error('Create booking error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// GET /api/bookings — list bookings for authenticated user
router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
    });

    return res.json({ bookings });
  } catch (err) {
    console.error('List bookings error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

// DELETE /api/bookings/:id — delete a booking (owner only)
router.delete('/:id', async (req, res) => {
  try {
    const bookingId = parseInt(req.params.id, 10);
    if (isNaN(bookingId)) {
      return res.status(400).json({ error: 'Invalid booking ID.' });
    }

    const booking = await Booking.findOne({
      where: { id: bookingId, user_id: req.user.id },
    });

    if (!booking) {
      return res
        .status(404)
        .json({ error: 'Booking not found or you do not have permission to delete it.' });
    }

    await booking.destroy();

    return res.json({ message: 'Booking deleted successfully.' });
  } catch (err) {
    console.error('Delete booking error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
