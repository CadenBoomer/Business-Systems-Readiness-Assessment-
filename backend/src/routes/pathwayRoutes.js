const express = require('express');
const router = express.Router();
const pathwayController = require('../controllers/pathwayController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/pathways', pathwayController.getPathways);
router.put('/pathways/:id', authMiddleware, pathwayController.updatePathway);

module.exports = router;