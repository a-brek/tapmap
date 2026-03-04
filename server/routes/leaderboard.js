'use strict';

const express = require('express');
const db      = require('../db');

const router = express.Router();

// ── GET /api/leaderboard/daily/:date ─────────────────────
// Rankings for a specific date (defaults to today)
router.get('/daily/:date?', async (req, res) => {
  const date = req.params.date || new Date().toISOString().slice(0, 10);

  if (req.params.date && !/^\d{4}-\d{2}-\d{2}$/.test(date))
    return res.status(400).json({ error: 'Invalid date format — use YYYY-MM-DD' });

  try {
    const { rows } = await db.query(
      `SELECT
         RANK() OVER (ORDER BY ds.total_score DESC)::int AS rank,
         u.username,
         u.avatar_url,
         ds.total_score,
         ds.round_scores
       FROM daily_scores ds
       JOIN users u ON u.id = ds.user_id
       WHERE ds.date = $1
         AND u.username IS NOT NULL
       ORDER BY ds.total_score DESC
       LIMIT 100`,
      [date]
    );

    const viewerRank = req.isAuthenticated()
      ? rows.find(r => r.username === req.user.username)?.rank ?? null
      : null;

    res.json({
      date,
      entries: rows.map(r => ({
        rank:        r.rank,
        username:    r.username,
        avatarUrl:   r.avatar_url,
        totalScore:  r.total_score,
        emojis:      (typeof r.round_scores === 'string'
          ? JSON.parse(r.round_scores)
          : r.round_scores).map(s => s.emoji).join(''),
      })),
      viewerRank,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// ── GET /api/leaderboard/alltime ──────────────────────────
// All-time rankings by cumulative score
router.get('/alltime', async (req, res) => {
  try {
    const { rows } = await db.query(
      `SELECT
         RANK() OVER (ORDER BY SUM(ds.total_score) DESC)::int AS rank,
         u.username,
         u.avatar_url,
         SUM(ds.total_score)::int          AS total_score,
         COUNT(ds.id)::int                 AS games_played,
         ROUND(AVG(ds.total_score))::int   AS avg_score,
         MAX(ds.total_score)::int          AS best_game
       FROM daily_scores ds
       JOIN users u ON u.id = ds.user_id
       WHERE u.username IS NOT NULL
       GROUP BY u.id, u.username, u.avatar_url
       ORDER BY total_score DESC
       LIMIT 100`
    );

    const viewerRank = req.isAuthenticated()
      ? rows.find(r => r.username === req.user.username)?.rank ?? null
      : null;

    res.json({ entries: rows, viewerRank });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch all-time leaderboard' });
  }
});

module.exports = router;
