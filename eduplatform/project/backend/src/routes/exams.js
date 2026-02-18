const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const {
  getExamById, submitExam, createExam, addQuestion, deleteQuestion, getUserAttempts, getExamQuestions
} = require('../controllers/examController');

router.get('/my-attempts', authenticate, getUserAttempts);
router.get('/:id', authenticate, getExamById);
router.post('/:id/submit', authenticate, submitExam);

// Admin
router.post('/', authenticate, requireAdmin, createExam);
router.get('/:exam_id/questions', authenticate, requireAdmin, getExamQuestions);
router.post('/:exam_id/questions', authenticate, requireAdmin, addQuestion);
router.delete('/questions/:question_id', authenticate, requireAdmin, deleteQuestion);

module.exports = router;
