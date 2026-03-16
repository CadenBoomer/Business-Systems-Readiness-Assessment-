const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

router.post('/admin/questions', authController.login);

module.exports = router;