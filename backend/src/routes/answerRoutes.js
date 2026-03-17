const express = require('express')
const router = express.Router()
const answerController = require('../controllers/answerController')
const authMiddleware = require('../middleware/authMiddleware')

router.get('/questions/:id/answers', answerController.getAnswer)
router.post('/questions/:id/answers', authMiddleware, answerController.createAnswer)
router.put('/answers/:id', authMiddleware, answerController.updateAnswer)
router.delete('/answers/:id', authMiddleware, answerController.deleteAnswer)

module.exports = router;