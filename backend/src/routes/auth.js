const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { register, login, getMe, changePassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Ad 2-100 karakter arasında olmalı'),
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('password').isLength({ min: 8 }).withMessage('Şifre en az 8 karakter olmalı')
], register);

router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Geçerli bir e-posta adresi girin'),
  body('password').notEmpty().withMessage('Şifre gerekli')
], login);

router.get('/me', authenticate, getMe);
router.put('/change-password', authenticate, changePassword);

module.exports = router;
