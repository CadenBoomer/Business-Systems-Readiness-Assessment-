const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');


router.get('/results/:id/pdf', pdfController.downloadPDF)

module.exports = router;