const express = require('express')
const router = express.Router()
const questionController = require('../controllers/questionController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/questions', questionController.getQuestions)
// router.post('/questions', authMiddleware, questionController.createQuestion)
router.put('/questions/:id', authMiddleware,questionController.updateQuestion)
// router.delete('/questions/:id', authMiddleware, questionController.deleteQuestion)


module.exports = router;