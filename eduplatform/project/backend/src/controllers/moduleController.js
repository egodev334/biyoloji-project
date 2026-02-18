const pool = require('../config/database');
const { getFileType } = require('../middleware/upload');
const fs = require('fs');
const path = require('path');

const getAllModules = async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = `
      SELECT m.id, m.title, m.description, m.category, m.order_index, m.is_published, m.created_at,
             u.name as author_name,
             COUNT(DISTINCT mf.id) as file_count,
             COUNT(DISTINCT mv.id) as view_count,
             COUNT(DISTINCT e.id) as exam_count
      FROM modules m
      LEFT JOIN users u ON u.id = m.created_by
      LEFT JOIN module_files mf ON mf.module_id = m.id
      LEFT JOIN module_views mv ON mv.module_id = m.id
      LEFT JOIN exams e ON e.module_id = m.id AND e.is_active = TRUE
      WHERE 1=1
    `;
    const params = [];
    let paramIdx = 1;

    // Students only see published
    if (!req.user || req.user.role !== 'admin') {
      query += ` AND m.is_published = TRUE`;
    }

    if (category) {
      query += ` AND m.category = $${paramIdx++}`;
      params.push(category);
    }

    if (search) {
      query += ` AND (m.title ILIKE $${paramIdx} OR m.description ILIKE $${paramIdx})`;
      params.push(`%${search}%`);
      paramIdx++;
    }

    query += ` GROUP BY m.id, u.name ORDER BY m.order_index ASC, m.created_at DESC`;

    const result = await pool.query(query, params);
    res.json({ modules: result.rows });
  } catch (error) {
    console.error('getAllModules hatası:', error);
    res.status(500).json({ error: 'Modüller alınamadı' });
  }
};

const getModuleById = async (req, res) => {
  try {
    const { id } = req.params;

    const moduleResult = await pool.query(
      `SELECT m.*, u.name as author_name
       FROM modules m
       LEFT JOIN users u ON u.id = m.created_by
       WHERE m.id = $1`,
      [id]
    );

    if (moduleResult.rows.length === 0) {
      return res.status(404).json({ error: 'Modül bulunamadı' });
    }

    const module = moduleResult.rows[0];

    if (!module.is_published && (!req.user || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Bu modüle erişim izniniz yok' });
    }

    // Files
    const filesResult = await pool.query(
      'SELECT * FROM module_files WHERE module_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Exams
    const examsResult = await pool.query(
      `SELECT e.id, e.title, e.duration_minutes, e.pass_score,
              COUNT(q.id) as question_count
       FROM exams e
       LEFT JOIN questions q ON q.exam_id = e.id
       WHERE e.module_id = $1 AND e.is_active = TRUE
       GROUP BY e.id`,
      [id]
    );

    // Record view
    if (req.user) {
      await pool.query(
        `INSERT INTO module_views (module_id, user_id) VALUES ($1, $2)
         ON CONFLICT (module_id, user_id) DO UPDATE SET viewed_at = NOW()`,
        [id, req.user.id]
      );
    }

    res.json({
      module,
      files: filesResult.rows,
      exams: examsResult.rows
    });
  } catch (error) {
    console.error('getModuleById hatası:', error);
    res.status(500).json({ error: 'Modül alınamadı' });
  }
};

const createModule = async (req, res) => {
  try {
    const { title, description, content, category, order_index, is_published } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Modül başlığı zorunlu' });
    }

    const result = await pool.query(
      `INSERT INTO modules (title, description, content, category, order_index, is_published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, description, content, category, order_index || 0, is_published === 'true' || is_published === true, req.user.id]
    );

    res.status(201).json({ message: 'Modül oluşturuldu', module: result.rows[0] });
  } catch (error) {
    console.error('createModule hatası:', error);
    res.status(500).json({ error: 'Modül oluşturulamadı' });
  }
};

const updateModule = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content, category, order_index, is_published } = req.body;

    const result = await pool.query(
      `UPDATE modules SET title=$1, description=$2, content=$3, category=$4,
       order_index=$5, is_published=$6 WHERE id=$7 RETURNING *`,
      [title, description, content, category, order_index, is_published, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Modül bulunamadı' });
    }

    res.json({ message: 'Modül güncellendi', module: result.rows[0] });
  } catch (error) {
    console.error('updateModule hatası:', error);
    res.status(500).json({ error: 'Modül güncellenemedi' });
  }
};

const deleteModule = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete associated files
    const files = await pool.query('SELECT * FROM module_files WHERE module_id = $1', [id]);
    for (const file of files.rows) {
      const filePath = path.join(__dirname, '../../', file.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await pool.query('DELETE FROM modules WHERE id = $1', [id]);
    res.json({ message: 'Modül silindi' });
  } catch (error) {
    console.error('deleteModule hatası:', error);
    res.status(500).json({ error: 'Modül silinemedi' });
  }
};

const uploadModuleFile = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Dosya yüklenmedi' });
    }

    const moduleCheck = await pool.query('SELECT id FROM modules WHERE id = $1', [id]);
    if (moduleCheck.rows.length === 0) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: 'Modül bulunamadı' });
    }

    const fileType = getFileType(req.file.mimetype);
    const url = `/${req.file.path.replace(/\\/g, '/')}`;

    const result = await pool.query(
      `INSERT INTO module_files (module_id, filename, original_name, file_type, file_size, mime_type, url)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [id, req.file.filename, req.file.originalname, fileType, req.file.size, req.file.mimetype, url]
    );

    res.status(201).json({ message: 'Dosya yüklendi', file: result.rows[0] });
  } catch (error) {
    console.error('uploadModuleFile hatası:', error);
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: 'Dosya yüklenemedi' });
  }
};

const deleteModuleFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await pool.query('SELECT * FROM module_files WHERE id = $1', [fileId]);

    if (file.rows.length === 0) {
      return res.status(404).json({ error: 'Dosya bulunamadı' });
    }

    const filePath = path.join(__dirname, '../../', file.rows[0].url);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await pool.query('DELETE FROM module_files WHERE id = $1', [fileId]);
    res.json({ message: 'Dosya silindi' });
  } catch (error) {
    console.error('deleteModuleFile hatası:', error);
    res.status(500).json({ error: 'Dosya silinemedi' });
  }
};

const getCategories = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT DISTINCT category FROM modules WHERE category IS NOT NULL AND is_published = TRUE ORDER BY category`
    );
    res.json({ categories: result.rows.map(r => r.category) });
  } catch (error) {
    res.status(500).json({ error: 'Kategoriler alınamadı' });
  }
};

module.exports = { getAllModules, getModuleById, createModule, updateModule, deleteModule, uploadModuleFile, deleteModuleFile, getCategories };
