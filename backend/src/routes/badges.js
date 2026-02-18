const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const pool = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM badges ORDER BY created_at ASC');
    res.json({ badges: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Rozetler alınamadı' });
  }
});

router.get('/mine', authenticate, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT b.*, ub.earned_at FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC`,
      [req.user.id]
    );
    res.json({ badges: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Rozetler alınamadı' });
  }
});

module.exports = router;
