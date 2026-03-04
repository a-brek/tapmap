'use strict';

const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/analytics/locations ─────────────────────────
// Average score per location across all players (hardest → easiest)
// Requires round_scores entries to have a `locationName` field
router.get('/locations', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         elem->>'locationName'              AS location,
         elem->>'country'                   AS country,
         COUNT(*)::int                      AS attempts,
         ROUND(AVG((elem->>'score')::int))::int AS avg_score,
         MAX((elem->>'score')::int)::int    AS best_score,
         MIN((elem->>'score')::int)::int    AS worst_score
       FROM daily_scores,
            jsonb_array_elements(round_scores) AS elem
       WHERE elem->>'locationName' IS NOT NULL
       GROUP BY location, country
       HAVING COUNT(*) >= 3
       ORDER BY avg_score ASC
       LIMIT 100`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch location analytics' });
  }
});

// ── GET /api/analytics/countries ─────────────────────────
// Average score aggregated by country
router.get('/countries', async (_req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         elem->>'country'                   AS country,
         COUNT(*)::int                      AS attempts,
         ROUND(AVG((elem->>'score')::int))::int AS avg_score,
         COUNT(DISTINCT ds.user_id)::int    AS unique_players
       FROM daily_scores ds,
            jsonb_array_elements(round_scores) AS elem
       WHERE elem->>'country' IS NOT NULL
       GROUP BY country
       HAVING COUNT(*) >= 5
       ORDER BY avg_score ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch country analytics' });
  }
});

// ── GET /api/analytics/trends ─────────────────────────────
// Score trend over time for the authenticated user
router.get('/trends', async (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ error: 'Authentication required' });

  try {
    const { rows } = await db.query(
      `SELECT
         date,
         total_score,
         ROUND(AVG(total_score) OVER (
           ORDER BY date ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
         ))::int AS rolling_7day
       FROM daily_scores
       WHERE user_id = $1
       ORDER BY date ASC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trends' });
  }
});

module.exports = router;
