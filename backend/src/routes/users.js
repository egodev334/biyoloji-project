const express = require('express');
const router = express.Router();
const { authenticate, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { getProfile, updateProfile, getUserBadges } = require('../controllers/userController');

router.get('/badges', authenticate, getUserBadges);
router.get('/:id', optionalAuth, getProfile);
router.put('/profile', authenticate, upload.single('avatar'), updateProfile);

module.exports = router;
