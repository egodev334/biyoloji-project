const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const { getStats, getUsers, toggleUserStatus, changeUserRole, createAdminUser } = require('../controllers/adminController');

router.use(authenticate, requireAdmin);

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:userId/status', toggleUserStatus);
router.patch('/users/:userId/role', changeUserRole);
router.post('/users', createAdminUser);

module.exports = router;
