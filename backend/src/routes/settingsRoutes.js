const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/settings', settingsController.getSettings);
router.put('/settings', authMiddleware, settingsController.updateSetting);

module.exports = router;