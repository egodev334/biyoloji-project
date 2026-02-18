const pool = require('../config/database');

const getExamById = async (req, res) => {
  try {
    const { id } = req.params;

    const examResult = await pool.query(
      `SELECT e.*, m.title as module_title FROM exams e
       JOIN modules m ON m.id = e.module_id
       WHERE e.id = $1 AND e.is_active = TRUE`,
      [id]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sınav bulunamadı' });
    }

    const questionsResult = await pool.query(
      `SELECT id, question_text, option_a, option_b, option_c, option_d, order_index
       FROM questions WHERE exam_id = $1 ORDER BY order_index ASC`,
      [id]
    );

    // Don't send correct_answer to frontend during exam
    res.json({
      exam: examResult.rows[0],
      questions: questionsResult.rows
    });
  } catch (error) {
    console.error('getExamById hatası:', error);
    res.status(500).json({ error: 'Sınav alınamadı' });
  }
};

const submitExam = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    // answers: { [questionId]: 'A'|'B'|'C'|'D' }

    const examResult = await pool.query(
      'SELECT * FROM exams WHERE id = $1 AND is_active = TRUE', [id]
    );

    if (examResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sınav bulunamadı' });
    }

    const exam = examResult.rows[0];

    const questionsResult = await pool.query(
      'SELECT id, correct_answer FROM questions WHERE exam_id = $1',
      [id]
    );

    const questions = questionsResult.rows;
    let correctCount = 0;

    const answerRecords = questions.map(q => {
      const selected = answers[q.id] || null;
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) correctCount++;
      return { questionId: q.id, selected, isCorrect, correctAnswer: q.correct_answer };
    });

    const score = Math.round((correctCount / questions.length) * 100);
    const isPerfect = correctCount === questions.length;

    // Save attempt
    const attemptResult = await pool.query(
      `INSERT INTO exam_attempts (exam_id, user_id, score, total_questions, correct_answers, time_taken_seconds)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [id, req.user.id, score, questions.length, correctCount, timeTaken || null]
    );

    const attemptId = attemptResult.rows[0].id;

    // Save individual answers
    for (const ar of answerRecords) {
      await pool.query(
        `INSERT INTO exam_answers (attempt_id, question_id, selected_answer, is_correct)
         VALUES ($1, $2, $3, $4)`,
        [attemptId, ar.questionId, ar.selected, ar.isCorrect]
      );
    }

    // Award badge if perfect score
    let badgeAwarded = null;
    if (isPerfect) {
      // Find or create badge for this module's exam
      let badgeResult = await pool.query(
        'SELECT * FROM badges WHERE module_id = $1 AND criteria_type = $2',
        [exam.module_id, 'perfect_exam']
      );

      if (badgeResult.rows.length === 0) {
        // Get module name
        const moduleResult = await pool.query('SELECT title FROM modules WHERE id = $1', [exam.module_id]);
        const moduleName = moduleResult.rows[0]?.title || 'Modül';

        badgeResult = await pool.query(
          `INSERT INTO badges (name, description, icon, color, criteria_type, module_id)
           VALUES ($1, $2, 'award', '#1a56db', 'perfect_exam', $3) RETURNING *`,
          [`${moduleName} Ustası`, `${moduleName} sınavını mükemmel tamamladı`, exam.module_id]
        );
      }

      const badge = badgeResult.rows[0];

      // Check if already awarded
      const existingBadge = await pool.query(
        'SELECT id FROM user_badges WHERE user_id = $1 AND badge_id = $2',
        [req.user.id, badge.id]
      );

      if (existingBadge.rows.length === 0) {
        await pool.query(
          'INSERT INTO user_badges (user_id, badge_id, attempt_id) VALUES ($1, $2, $3)',
          [req.user.id, badge.id, attemptId]
        );
        badgeAwarded = badge;
      }
    }

    res.json({
      score,
      correctCount,
      totalQuestions: questions.length,
      isPerfect,
      passed: score >= exam.pass_score,
      badgeAwarded,
      answers: answerRecords
    });
  } catch (error) {
    console.error('submitExam hatası:', error);
    res.status(500).json({ error: 'Sınav gönderilemedi' });
  }
};

const createExam = async (req, res) => {
  try {
    const { module_id, title, description, duration_minutes, pass_score } = req.body;

    if (!module_id || !title) {
      return res.status(400).json({ error: 'Modül ve başlık zorunlu' });
    }

    const result = await pool.query(
      `INSERT INTO exams (module_id, title, description, duration_minutes, pass_score)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [module_id, title, description, duration_minutes || 30, pass_score || 70]
    );

    res.status(201).json({ message: 'Sınav oluşturuldu', exam: result.rows[0] });
  } catch (error) {
    console.error('createExam hatası:', error);
    res.status(500).json({ error: 'Sınav oluşturulamadı' });
  }
};

const addQuestion = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const { question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index } = req.body;

    if (!question_text || !option_a || !option_b || !option_c || !option_d || !correct_answer) {
      return res.status(400).json({ error: 'Tüm soru alanları zorunlu' });
    }

    if (!['A', 'B', 'C', 'D'].includes(correct_answer.toUpperCase())) {
      return res.status(400).json({ error: 'Doğru cevap A, B, C veya D olmalı' });
    }

    const result = await pool.query(
      `INSERT INTO questions (exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [exam_id, question_text, option_a, option_b, option_c, option_d, correct_answer.toUpperCase(), explanation, order_index || 0]
    );

    res.status(201).json({ message: 'Soru eklendi', question: result.rows[0] });
  } catch (error) {
    console.error('addQuestion hatası:', error);
    res.status(500).json({ error: 'Soru eklenemedi' });
  }
};

const deleteQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    await pool.query('DELETE FROM questions WHERE id = $1', [question_id]);
    res.json({ message: 'Soru silindi' });
  } catch (error) {
    res.status(500).json({ error: 'Soru silinemedi' });
  }
};

const getUserAttempts = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ea.*, e.title as exam_title, m.title as module_title
       FROM exam_attempts ea
       JOIN exams e ON e.id = ea.exam_id
       JOIN modules m ON m.id = e.module_id
       WHERE ea.user_id = $1
       ORDER BY ea.completed_at DESC`,
      [req.user.id]
    );
    res.json({ attempts: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Sınav geçmişi alınamadı' });
  }
};

const getExamQuestions = async (req, res) => {
  try {
    const { exam_id } = req.params;
    const result = await pool.query(
      'SELECT * FROM questions WHERE exam_id = $1 ORDER BY order_index ASC',
      [exam_id]
    );
    res.json({ questions: result.rows });
  } catch (error) {
    res.status(500).json({ error: 'Sorular alınamadı' });
  }
};

module.exports = { getExamById, submitExam, createExam, addQuestion, deleteQuestion, getUserAttempts, getExamQuestions };
