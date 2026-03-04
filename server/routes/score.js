const express = require('express');
const router = express.Router();

// Stub — score persistence planned for future DB integration
const notImplemented = (_req, res) => {
  res.status(501).json({
    error: 'Not Implemented',
    message: 'Score persistence is not yet available. Scores are client-side only.',
  });
};

router.post('/', notImplemented);   // POST /api/score
router.get('/', notImplemented);    // GET  /api/leaderboard (mounted at /api/leaderboard)

module.exports = router;
