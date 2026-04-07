const express = require('express');
const { getDistance } = require('../utils/distance');
const { calculateScores } = require('../utils/scoring');
const trains = require('../data/trains');

const router = express.Router();

const FLIGHT_COMPANIES = ['IndiGo', 'Air India', 'SpiceJet'];
const BUS_COMPANIES = ['RedBus', 'VRL Travels', 'Raj National Express'];
const TAXI_COMPANIES = ['Ola Outstation', 'Uber Intercity', 'Zoomcar'];

// Flight pricing and emission constants
const FLIGHT_BASE_FARE = 1500;        // Base fare in INR regardless of distance
const FLIGHT_PRICE_PER_KM_MIN = 4;   // Minimum INR per km
const FLIGHT_PRICE_PER_KM_MAX = 6;   // Maximum INR per km
const FLIGHT_SPEED_KMH = 800;        // Approximate cruising speed
const FLIGHT_TURNAROUND_MIN = 90;    // Ground time added to block time (minutes)
// Source: ICAO Carbon Emissions Calculator methodology (~255 g CO₂ per passenger-km)
const FLIGHT_CO2_PER_KM = 0.255;

const BUS_PRICE_PER_KM = 1.2;
const BUS_BASE_FARE = 50;
const BUS_SPEED_KMH = 55;
// Source: EEA (European Environment Agency) — ~68 g CO₂/passenger-km for coaches
const BUS_CO2_PER_KM = 0.068;

const TAXI_PRICE_PER_KM = 14;
const TAXI_SPEED_KMH = 60;
// Source: EEA — ~171 g CO₂/passenger-km for petrol cars
const TAXI_CO2_PER_KM = 0.171;

function formatDuration(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h ${m.toString().padStart(2, '0')}m`;
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// GET /api/search/options?from=&to=&date=
router.get('/options', async (req, res) => {
  try {
    const { from, to, date } = req.query;

    if (!from || typeof from !== 'string' || from.trim().length === 0) {
      return res.status(400).json({ error: 'Origin city (from) is required.' });
    }
    if (!to || typeof to !== 'string' || to.trim().length === 0) {
      return res.status(400).json({ error: 'Destination city (to) is required.' });
    }
    if (from.trim().toLowerCase() === to.trim().toLowerCase()) {
      return res.status(400).json({ error: 'Origin and destination cannot be the same city.' });
    }

    const fromCity = from.trim();
    const toCity = to.trim();

    const distance = getDistance(fromCity, toCity);

    const options = [];

    // --- TRAINS ---
    const matchedTrains = trains.filter(
      (t) =>
        t.from.toLowerCase() === fromCity.toLowerCase() &&
        t.to.toLowerCase() === toCity.toLowerCase()
    );

    matchedTrains.forEach((t, idx) => {
      // Parse duration string (e.g. "5h 30m") into minutes
      const durationMatch = t.duration.match(/(\d+)h\s*(\d+)m/);
      const durationMin = durationMatch
        ? parseInt(durationMatch[1], 10) * 60 + parseInt(durationMatch[2], 10)
        : Math.round((distance / 80) * 60);

      options.push({
        id: `train-${idx}`,
        type: 'train',
        name: t.name,
        number: t.number,
        company: t.name,
        departure: t.departure,
        arrival: t.arrival,
        duration: durationMin,
        durationLabel: t.duration,
        price: t.price,
        class: t.class,
        comfort: t.class === 'AC' ? 4 : t.class === 'Sleeper' ? 3 : 2,
        co2: t.co2,
        rating: t.rating,
        distance,
      });
    });

    // If no trains found, generate a generic train option
    if (matchedTrains.length === 0) {
      const trainDuration = Math.round((distance / 80) * 60);
      const trainPrice = Math.round(distance * 1.8 + 200);
      options.push({
        id: 'train-0',
        type: 'train',
        name: 'Express Train',
        number: 'N/A',
        company: 'Indian Railways',
        departure: '06:00',
        arrival: '—',
        duration: trainDuration,
        durationLabel: formatDuration(trainDuration),
        price: trainPrice,
        class: 'AC',
        comfort: 4,
        co2: Math.round(distance * 0.04),
        rating: 4.0,
        distance,
      });
    }

    // --- FLIGHTS ---
    const numFlights = distance > 300 ? 3 : 2;
    for (let i = 0; i < numFlights; i++) {
      const pricePerKm = randomBetween(FLIGHT_PRICE_PER_KM_MIN, FLIGHT_PRICE_PER_KM_MAX);
      const flightPrice = Math.round(distance * pricePerKm + FLIGHT_BASE_FARE);
      const flightDuration = Math.round((distance / FLIGHT_SPEED_KMH) * 60 + FLIGHT_TURNAROUND_MIN);
      const co2 = Math.round(distance * FLIGHT_CO2_PER_KM);
      const company = FLIGHT_COMPANIES[i % FLIGHT_COMPANIES.length];

      options.push({
        id: `flight-${i}`,
        type: 'flight',
        name: `${company} Airlines`,
        company,
        departure: `${String(6 + i * 4).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`,
        arrival: '—',
        duration: flightDuration,
        durationLabel: formatDuration(flightDuration),
        price: flightPrice,
        class: 'Economy',
        comfort: 5,
        co2,
        rating: parseFloat((3.8 + Math.random() * 0.7).toFixed(1)),
        distance,
      });
    }

    // --- BUS ---
    const busDuration = Math.round((distance / BUS_SPEED_KMH) * 60);
    const busPrice = Math.round(distance * BUS_PRICE_PER_KM + BUS_BASE_FARE);
    const busCompany = BUS_COMPANIES[Math.floor(Math.random() * BUS_COMPANIES.length)];
    options.push({
      id: 'bus-0',
      type: 'bus',
      name: `${busCompany} Sleeper`,
      company: busCompany,
      departure: '21:00',
      arrival: '—',
      duration: busDuration,
      durationLabel: formatDuration(busDuration),
      price: busPrice,
      class: 'Sleeper',
      comfort: 3,
      co2: Math.round(distance * BUS_CO2_PER_KM),
      rating: parseFloat((3.5 + Math.random() * 0.5).toFixed(1)),
      distance,
    });

    // --- TAXI ---
    const taxiDuration = Math.round((distance / TAXI_SPEED_KMH) * 60);
    const taxiPrice = Math.round(distance * TAXI_PRICE_PER_KM);
    const taxiCompany = TAXI_COMPANIES[Math.floor(Math.random() * TAXI_COMPANIES.length)];
    options.push({
      id: 'taxi-0',
      type: 'taxi',
      name: `${taxiCompany}`,
      company: taxiCompany,
      departure: 'On demand',
      arrival: '—',
      duration: taxiDuration,
      durationLabel: formatDuration(taxiDuration),
      price: taxiPrice,
      class: 'Sedan/SUV',
      comfort: 5,
      co2: Math.round(distance * TAXI_CO2_PER_KM),
      rating: parseFloat((4.0 + Math.random() * 0.5).toFixed(1)),
      distance,
    });

    // --- AI Scoring ---
    const scored = calculateScores(options);

    return res.json({ options: scored, distance, from: fromCity, to: toCity, date: date || null });
  } catch (err) {
    console.error('Search error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});

module.exports = router;
