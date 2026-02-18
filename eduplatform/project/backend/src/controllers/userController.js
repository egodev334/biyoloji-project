const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getProfile = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar_url, u.bio, u.created_at,
              COUNT(DISTINCT ea.id) as exam_count,
              COUNT(DISTINCT ub.id) as badge_count,
              COUNT(DISTINCT mv.id) as modules_viewed
       FROM users u
       LEFT JOIN exam_attempts ea ON ea.user_id = u.id
       LEFT JOIN user_badges ub ON ub.user_id = u.id
       LEFT JOIN module_views mv ON mv.user_id = u.id
       WHERE u.id = $1 AND u.is_active = TRUE
       GROUP BY u.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];

    // Don't expose email to other users
    if (!req.user || (req.user.id !== id && req.user.role !== 'admin')) {
      delete user.email;
    }

    // Badges
    const badgesResult = await pool.query(
      `SELECT b.*, ub.earned_at FROM user_badges ub
       JOIN badges b ON b.id = ub.badge_id
       WHERE ub.user_id = $1 ORDER BY ub.earned_at DESC`,
      [id]
    );

    // Recent exam attempts
    const attemptsResult = await pool.query(
      `SELECT ea.score, ea.correct_answers, ea.total_questions, ea.completed_at,
              e.title as exam_title, m.title as module_title
       FROM exam_attempts ea
       JOIN exams e ON e.id = ea.exam_id
       JOIN modules m ON m.id = e.module_id
       WHERE ea.user_id = $1
       ORDER BY ea.completed_at DESC LIMIT 10`,
      [id]
    );

    res.json({ user, badges: badgesResult.rows, attempts: attemptsResult.rows });
  } catch (error) {
    console.error('getProfile hatası:', error);
    res.status(500).json({ error: 'Profil alınamadı' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user.id;

    let avatarUrl = undefined;
    if (req.file) {
      avatarUrl = `/uploads/avatars/${req.file.filename}`;
    }

    const updates = [];
    const values = [];
    let idx = 1;

    if (name) { updates.push(`name = $${idx++}`); values.push(name.trim()); }
    if (bio !== undefined) { updates.push(`bio = $${idx++}`); values.push(bio); }
    if (avatarUrl) { updates.push(`avatar_url = $${idx++}`); values.push(avatarUrl); }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'Güncellenecek alan belirtilmedi' });
    }

    values.push(userId);
    const result = await pool.query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = $${idx} RETURNING id, name, email, avatar_url, bio`,
      values
    );

    res.json({ message: 'Profil güncellendi', user: result.rows[0] });
  } catch (error) {
    console.error('updateProfile hatası:', error);
    res.status(500).json({ error: 'Profil güncellenemedi' });
  }
};

const getUserBadges = async (req, res) => {
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
};

module.exports = { getProfile, updateProfile, getUserBadges };
