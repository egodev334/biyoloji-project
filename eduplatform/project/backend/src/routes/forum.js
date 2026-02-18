const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const {
  getCategories, getTopics, getTopic, createTopic, createReply,
  deleteTopic, deleteReply, togglePin, toggleLock
} = require('../controllers/forumController');

router.get('/categories', getCategories);
router.get('/categories/:categoryId/topics', getTopics);
router.get('/topics/:topicId', optionalAuth, getTopic);

router.post('/topics', authenticate, createTopic);
router.delete('/topics/:topicId', authenticate, deleteTopic);

router.post('/topics/:topicId/replies', authenticate, createReply);
router.delete('/replies/:replyId', authenticate, deleteReply);

// Admin moderation
router.patch('/topics/:topicId/pin', authenticate, requireAdmin, togglePin);
router.patch('/topics/:topicId/lock', authenticate, requireAdmin, toggleLock);

module.exports = router;
