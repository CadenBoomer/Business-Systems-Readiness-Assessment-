const express = require('express');
const router = express.Router();
const authController = require('./src/controllers/authController');

router.post('/admin/login', authController.login);

module.exports = router;