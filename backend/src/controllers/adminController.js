const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const getStats = async (req, res) => {
  try {
    const [usersResult, modulesResult, examsResult, forumResult] = await Promise.all([
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE role=\'student\') as students, COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL \'7 days\') as new_this_week FROM users WHERE is_active = TRUE'),
      pool.query('SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_published = TRUE) as published FROM modules'),
      pool.query('SELECT COUNT(*) as total_exams, COUNT(DISTINCT ea.id) as total_attempts, ROUND(AVG(ea.score)) as avg_score FROM exams e LEFT JOIN exam_attempts ea ON ea.exam_id = e.id'),
      pool.query('SELECT COUNT(DISTINCT ft.id) as topics, COUNT(DISTINCT fr.id) as replies FROM forum_topics ft LEFT JOIN forum_replies fr ON fr.topic_id = ft.id WHERE ft.is_deleted = FALSE')
    ]);

    res.json({
      users: usersResult.rows[0],
      modules: modulesResult.rows[0],
      exams: examsResult.rows[0],
      forum: forumResult.rows[0]
    });
  } catch (error) {
    console.error('getStats hatası:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
};

const getUsers = async (req, res) => {
  try {
    const { search, role, page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT u.id, u.name, u.email, u.role, u.is_active, u.created_at,
             COUNT(DISTINCT ea.id) as exam_count,
             COUNT(DISTINCT ub.id) as badge_count
      FROM users u
      LEFT JOIN exam_attempts ea ON ea.user_id = u.id
      LEFT JOIN user_badges ub ON ub.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (search) {
      query += ` AND (u.name ILIKE $${idx} OR u.email ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }

    if (role) {
      query += ` AND u.role = $${idx++}`;
      params.push(role);
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    const countQuery = `SELECT COUNT(*) FROM users WHERE 1=1 ${search ? `AND (name ILIKE '%${search}%' OR email ILIKE '%${search}%')` : ''} ${role ? `AND role = '${role}'` : ''}`;
    const countResult = await pool.query(countQuery);

    res.json({
      users: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('getUsers hatası:', error);
    res.status(500).json({ error: 'Kullanıcılar alınamadı' });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Kendi hesabınızı devre dışı bırakamazsınız' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING is_active, name',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    res.json({
      message: result.rows[0].is_active ? 'Hesap aktifleştirildi' : 'Hesap devre dışı bırakıldı',
      is_active: result.rows[0].is_active
    });
  } catch (error) {
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi' });
  }
};

const changeUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['student', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Geçersiz rol' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Kendi rolünüzü değiştiremezsiniz' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING name, role',
      [role, userId]
    );

    res.json({ message: 'Rol güncellendi', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Rol güncellenemedi' });
  }
};

const createAdminUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Bu e-posta zaten kayıtlı' });
    }

    const hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, 'admin') RETURNING id, name, email, role`,
      [name, email.toLowerCase(), hash]
    );

    res.status(201).json({ message: 'Admin oluşturuldu', user: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Admin oluşturulamadı' });
  }
};

module.exports = { getStats, getUsers, toggleUserStatus, changeUserRole, createAdminUser };
