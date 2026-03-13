const express = require('express')
const router = express.Router()
const answerController = require('../controllers/answerController')

router.get('/questions/:id/answers', answerController.getAnswer)
router.post('/questions/:id/answers', answerController.createAnswer)
router.put('/answers/:id', answerController.updateAnswer)
router.delete('/answers/:id', answerController.deleteAnswer)

module.exports = router;