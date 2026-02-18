const pool = require('../config/database');

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT fc.*,
              COUNT(DISTINCT ft.id) as topic_count,
              COUNT(DISTINCT fr.id) as reply_count
       FROM forum_categories fc
       LEFT JOIN forum_topics ft ON ft.category_id = fc.id AND ft.is_deleted = FALSE
       LEFT JOIN forum_replies fr ON fr.topic_id = ft.id AND fr.is_deleted = FALSE
       WHERE fc.is_active = TRUE
       GROUP BY fc.id
       ORDER BY fc.order_index ASC`
    );
    res.json({ categories: result.rows });
  } catch (error) {
    console.error('getCategories hatası:', error);
    res.status(500).json({ error: 'Kategoriler alınamadı' });
  }
};

const getTopics = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const catCheck = await pool.query('SELECT id FROM forum_categories WHERE id = $1', [categoryId]);
    if (catCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Kategori bulunamadı' });
    }

    const result = await pool.query(
      `SELECT ft.id, ft.title, ft.is_pinned, ft.is_locked, ft.view_count, ft.created_at, ft.updated_at,
              u.name as author_name, u.avatar_url as author_avatar,
              COUNT(fr.id) as reply_count,
              MAX(fr.created_at) as last_reply_at
       FROM forum_topics ft
       JOIN users u ON u.id = ft.user_id
       LEFT JOIN forum_replies fr ON fr.topic_id = ft.id AND fr.is_deleted = FALSE
       WHERE ft.category_id = $1 AND ft.is_deleted = FALSE
       GROUP BY ft.id, u.name, u.avatar_url
       ORDER BY ft.is_pinned DESC, COALESCE(MAX(fr.created_at), ft.created_at) DESC
       LIMIT $2 OFFSET $3`,
      [categoryId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM forum_topics WHERE category_id = $1 AND is_deleted = FALSE',
      [categoryId]
    );

    res.json({
      topics: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: parseInt(limit)
    });
  } catch (error) {
    console.error('getTopics hatası:', error);
    res.status(500).json({ error: 'Konular alınamadı' });
  }
};

const getTopic = async (req, res) => {
  try {
    const { topicId } = req.params;

    await pool.query('UPDATE forum_topics SET view_count = view_count + 1 WHERE id = $1', [topicId]);

    const topicResult = await pool.query(
      `SELECT ft.*, u.name as author_name, u.avatar_url as author_avatar, u.role as author_role,
              fc.name as category_name, fc.slug as category_slug
       FROM forum_topics ft
       JOIN users u ON u.id = ft.user_id
       JOIN forum_categories fc ON fc.id = ft.category_id
       WHERE ft.id = $1 AND ft.is_deleted = FALSE`,
      [topicId]
    );

    if (topicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Konu bulunamadı' });
    }

    const repliesResult = await pool.query(
      `SELECT fr.id, fr.content, fr.created_at, fr.updated_at,
              u.name as author_name, u.avatar_url as author_avatar, u.role as author_role
       FROM forum_replies fr
       JOIN users u ON u.id = fr.user_id
       WHERE fr.topic_id = $1 AND fr.is_deleted = FALSE
       ORDER BY fr.created_at ASC`,
      [topicId]
    );

    res.json({ topic: topicResult.rows[0], replies: repliesResult.rows });
  } catch (error) {
    console.error('getTopic hatası:', error);
    res.status(500).json({ error: 'Konu alınamadı' });
  }
};

const createTopic = async (req, res) => {
  try {
    const { category_id, title, content } = req.body;

    if (!category_id || !title || !content) {
      return res.status(400).json({ error: 'Kategori, başlık ve içerik zorunlu' });
    }

    if (title.length < 5) {
      return res.status(400).json({ error: 'Başlık en az 5 karakter olmalı' });
    }

    if (content.length < 10) {
      return res.status(400).json({ error: 'İçerik en az 10 karakter olmalı' });
    }

    const result = await pool.query(
      `INSERT INTO forum_topics (category_id, user_id, title, content)
       VALUES ($1, $2, $3, $4) RETURNING id`,
      [category_id, req.user.id, title.trim(), content]
    );

    res.status(201).json({ message: 'Konu oluşturuldu', topicId: result.rows[0].id });
  } catch (error) {
    console.error('createTopic hatası:', error);
    res.status(500).json({ error: 'Konu oluşturulamadı' });
  }
};

const createReply = async (req, res) => {
  try {
    const { topicId } = req.params;
    const { content } = req.body;

    if (!content || content.length < 5) {
      return res.status(400).json({ error: 'Yanıt en az 5 karakter olmalı' });
    }

    const topicCheck = await pool.query(
      'SELECT id, is_locked FROM forum_topics WHERE id = $1 AND is_deleted = FALSE',
      [topicId]
    );

    if (topicCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Konu bulunamadı' });
    }

    if (topicCheck.rows[0].is_locked && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu konu kilitli' });
    }

    const result = await pool.query(
      `INSERT INTO forum_replies (topic_id, user_id, content) VALUES ($1, $2, $3) RETURNING id, content, created_at`,
      [topicId, req.user.id, content]
    );

    // Update topic's updated_at
    await pool.query('UPDATE forum_topics SET updated_at = NOW() WHERE id = $1', [topicId]);

    res.status(201).json({ message: 'Yanıt eklendi', reply: result.rows[0] });
  } catch (error) {
    console.error('createReply hatası:', error);
    res.status(500).json({ error: 'Yanıt eklenemedi' });
  }
};

const deleteTopic = async (req, res) => {
  try {
    const { topicId } = req.params;
    const topic = await pool.query('SELECT user_id FROM forum_topics WHERE id = $1', [topicId]);

    if (topic.rows.length === 0) return res.status(404).json({ error: 'Konu bulunamadı' });

    if (topic.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu konuyu silme yetkiniz yok' });
    }

    await pool.query('UPDATE forum_topics SET is_deleted = TRUE WHERE id = $1', [topicId]);
    res.json({ message: 'Konu silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Konu silinemedi' });
  }
};

const deleteReply = async (req, res) => {
  try {
    const { replyId } = req.params;
    const reply = await pool.query('SELECT user_id FROM forum_replies WHERE id = $1', [replyId]);

    if (reply.rows.length === 0) return res.status(404).json({ error: 'Yanıt bulunamadı' });

    if (reply.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Bu yanıtı silme yetkiniz yok' });
    }

    await pool.query('UPDATE forum_replies SET is_deleted = TRUE WHERE id = $1', [replyId]);
    res.json({ message: 'Yanıt silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Yanıt silinemedi' });
  }
};

const togglePin = async (req, res) => {
  try {
    const { topicId } = req.params;
    const result = await pool.query(
      'UPDATE forum_topics SET is_pinned = NOT is_pinned WHERE id = $1 RETURNING is_pinned',
      [topicId]
    );
    res.json({ is_pinned: result.rows[0].is_pinned });
  } catch (error) {
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi' });
  }
};

const toggleLock = async (req, res) => {
  try {
    const { topicId } = req.params;
    const result = await pool.query(
      'UPDATE forum_topics SET is_locked = NOT is_locked WHERE id = $1 RETURNING is_locked',
      [topicId]
    );
    res.json({ is_locked: result.rows[0].is_locked });
  } catch (error) {
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi' });
  }
};

module.exports = { getCategories, getTopics, getTopic, createTopic, createReply, deleteTopic, deleteReply, togglePin, toggleLock };
