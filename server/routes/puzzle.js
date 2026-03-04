const express  = require('express');
const router   = express.Router();
const locations = require('../data/locations.json');

// ---------------------------------------------------------------------------
// Haversine great-circle distance (km)
// ---------------------------------------------------------------------------
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------
function calcScore(distKm) {
  return Math.round(1000 * Math.max(0, 1 - distKm / 2000));
}

// ---------------------------------------------------------------------------
// Seeded linear-congruential RNG — same date → same shuffle every time
// ---------------------------------------------------------------------------
function seededRng(seed) {
  let s = (Math.abs(seed) >>> 0) || 1;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

// ---------------------------------------------------------------------------
// Pick 5 random locations for a given date string (deterministic)
// ---------------------------------------------------------------------------
function getLocationsForDate(dateStr) {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = Math.imul(31, hash) + dateStr.charCodeAt(i) | 0;
  }

  // Fisher-Yates shuffle on a copy
  const arr  = [...locations];
  const rand = seededRng(hash);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.slice(0, 5);
}

// ---------------------------------------------------------------------------
// GET /api/puzzle/today
// ---------------------------------------------------------------------------
router.get('/today', (req, res) => {
  const today = new Date().toISOString().slice(0, 10);
  const locs  = getLocationsForDate(today);
  res.json({
    date:      today,
    locations: locs.map(({ name }) => ({ name })),
  });
});

// ---------------------------------------------------------------------------
// GET /api/puzzle/:date
// ---------------------------------------------------------------------------
router.get('/:date', (req, res) => {
  const { date } = req.params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'Invalid date format — use YYYY-MM-DD' });
  }
  const locs = getLocationsForDate(date);
  res.json({
    date,
    locations: locs.map(({ name }) => ({ name })),
  });
});

// ---------------------------------------------------------------------------
// POST /api/puzzle/:date/reveal/:round
// Body: { lat: number, lng: number }
// Returns: { actual: {lat, lng, name}, distanceKm, score }
// ---------------------------------------------------------------------------
router.post('/:date/reveal/:round', (req, res) => {
  const { date, round } = req.params;
  const { lat, lng }    = req.body;

  if (lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'Body must contain lat and lng' });
  }

  const roundIndex = parseInt(round, 10);
  if (isNaN(roundIndex) || roundIndex < 0 || roundIndex > 4) {
    return res.status(400).json({ error: 'round must be 0–4' });
  }

  const locs     = getLocationsForDate(date);
  const location = locs[roundIndex];
  if (!location) {
    return res.status(404).json({ error: 'Round not found' });
  }

  const distanceKm = haversine(lat, lng, location.lat, location.lng);
  const score      = calcScore(distanceKm);

  res.json({
    actual: { lat: location.lat, lng: location.lng, name: location.name },
    distanceKm: Math.round(distanceKm),
    score,
  });
});

module.exports = router;
