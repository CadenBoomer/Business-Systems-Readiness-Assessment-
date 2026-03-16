const pool = require('../models/db');
const generatePDF = require('../services/pdfService');

exports.downloadPDF = async (req, res) => {
     const {id} = req.params;
    try{
        const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [id]

        );

        if(rows.length === 0){
            return res.status(404).json({error: 'Submission not found'});
        }

        const submission = rows[0];
        const pdfBuffer = await generatePDF(
            submission.first_name,
            submission.last_name,
            submission.pathway,
            submission.reasoning,
            submission.confidence_score
        
        )
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="results.pdf"`);
        res.send(pdfBuffer);
    } 
    catch(error){
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    }
};



// User submits assessment → gets back submission_id
// → frontend calls GET /api/results/:id/pdf
// → backend fetches that submission from DB
// → generates PDF → sends it back as download