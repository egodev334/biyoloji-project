const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Yetkilendirme token\'ı gerekli' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const result = await pool.query(
      'SELECT id, name, email, role, avatar_url, is_active FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Kullanıcı bulunamadı' });
    }

    const user = result.rows[0];
    if (!user.is_active) {
      return res.status(403).json({ error: 'Hesabınız devre dışı bırakılmış' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Geçersiz token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token süresi dolmuş, lütfen tekrar giriş yapın' });
    }
    console.error('Auth middleware hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Bu işlem için admin yetkisi gerekli' });
  }
  next();
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, name, email, role, avatar_url FROM users WHERE id = $1 AND is_active = TRUE',
      [decoded.userId]
    );
    if (result.rows.length > 0) {
      req.user = result.rows[0];
    }
    next();
  } catch {
    next();
  }
};

module.exports = { authenticate, requireAdmin, optionalAuth };
