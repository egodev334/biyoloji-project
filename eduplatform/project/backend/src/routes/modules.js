const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  getAllModules, getModuleById, createModule, updateModule, deleteModule,
  uploadModuleFile, deleteModuleFile, getCategories
} = require('../controllers/moduleController');

router.get('/categories', getCategories);
router.get('/', optionalAuth, getAllModules);
router.get('/:id', optionalAuth, getModuleById);

// Admin only
router.post('/', authenticate, requireAdmin, createModule);
router.put('/:id', authenticate, requireAdmin, updateModule);
router.delete('/:id', authenticate, requireAdmin, deleteModule);
router.post('/:id/files', authenticate, requireAdmin, upload.single('file'), uploadModuleFile);
router.delete('/:id/files/:fileId', authenticate, requireAdmin, deleteModuleFile);

module.exports = router;
