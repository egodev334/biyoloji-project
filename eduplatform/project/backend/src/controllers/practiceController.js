const pool = require('../config/database');

const getPracticeQuestions = async (req, res) => {
  try {
    const { moduleId, difficulty } = req.query;
    let query = `
      SELECT pq.*, m.title as module_title
      FROM practice_questions pq
      LEFT JOIN modules m ON m.id = pq.module_id
      WHERE 1=1
    `;
    const params = [];
    let idx = 1;

    if (moduleId) {
      query += ` AND pq.module_id = $${idx++}`;
      params.push(moduleId);
    }
    if (difficulty) {
      query += ` AND pq.difficulty = $${idx++}`;
      params.push(difficulty);
    }

    query += ' ORDER BY pq.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ questions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Çalışma soruları alınamadı' });
  }
};

const createPracticeQuestion = async (req, res) => {
  try {
    const { module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({ error: 'Tüm zorunlu alanlar doldurulmalı' });
    }

    const result = await pool.query(
      `INSERT INTO practice_questions (module_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [module_id || null, question_text, option_a, option_b, option_c, option_d, correct_answer.toUpperCase(), explanation, difficulty || 'medium', req.user.id]
    );

    res.status(201).json({ message: 'Çalışma sorusu eklendi', question: result.rows[0] });
  } catch (error) {
    res.status(500).json({ error: 'Soru eklenemedi' });
  }
};

const deletePracticeQuestion = async (req, res) => {
  try {
    await pool.query('DELETE FROM practice_questions WHERE id = $1', [req.params.id]);
    res.json({ message: 'Soru silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Soru silinemedi' });
  }
};

module.exports = { getPracticeQuestions, createPracticeQuestion, deletePracticeQuestion };
