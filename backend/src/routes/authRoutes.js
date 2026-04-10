const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes

router.post('/admin/login', authController.login);
router.put('/admin/credentials', authMiddleware, authController.updateCredentials);

module.exports = router;