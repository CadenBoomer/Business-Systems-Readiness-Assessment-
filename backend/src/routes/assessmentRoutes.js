const express = require('express')
const router = express.Router()
const assessmentController = require('../controllers/assessmentController')
const authMiddleware = require('../middleware/authMiddleware');

router.post('/submit-assessment', assessmentController.submitAssessment)
router.get('/submissions', authMiddleware, assessmentController.getSubmissions);

module.exports = router;