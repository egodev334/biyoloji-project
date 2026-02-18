const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getPracticeQuestions, createPracticeQuestion, deletePracticeQuestion } = require('../controllers/practiceController');

router.get('/', authenticate, getPracticeQuestions);
router.post('/', authenticate, requireAdmin, createPracticeQuestion);
router.delete('/:id', authenticate, requireAdmin, deletePracticeQuestion);

module.exports = router;
