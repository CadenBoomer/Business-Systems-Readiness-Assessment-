const pool = require('../models/db');
const generatePDF = require('../services/pdfService');

exports.downloadPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT * FROM submissions WHERE id = ?', [id]

        );

        if (rows.length === 0) {
            return res.status(404).json({ error: 'Submission not found' });
        }

        const submission = rows[0];

        const priority_actions = Array.isArray(submission.priority_actions)
            ? submission.priority_actions
            : JSON.parse(submission.priority_actions);

        const anti_priority_warnings = Array.isArray(submission.anti_priority_warnings)
            ? submission.anti_priority_warnings
            : JSON.parse(submission.anti_priority_warnings);

        const pdfBuffer = await generatePDF(
            submission.first_name,
            submission.last_name,
            submission.pathway,
            submission.reasoning,
            submission.confidence_score,
            submission.summary,
            priority_actions,
            anti_priority_warnings,
            submission.graduation_outlook
        );
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="results.pdf"`);
        res.send(pdfBuffer);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};



// User submits assessment → gets back submission_id
// → frontend calls GET /api/results/:id/pdf
// → backend fetches that submission from DB
// → generates PDF → sends it back as download


// Why const {id} = req.params
// When the frontend calls GET /api/results/:id/pdf the :id in the URL is a real number like
// GET /api/results/5/pdf. That 5 is the submission id. req.params is how you grab values out of the URL.
// So id will equal 5 in that example.
// We need it because we have to know which submission to fetch from the database — there could be hundreds of
// rows in submissions.


// Why const submission = rows[0]
// When you run a SELECT query it always returns an array of rows even if there's only one result.
// rows[0] just grabs the first (and only) item out of that array so you can access the fields directly
//  like submission.first_name instead of rows[0].first_name every time.


// The reason you use submission.pathway instead of placeholders is because at this point you're not inserting
// data, you're reading data that's already in the database.
// Here you just READ what's already there
// const submission = rows[0];
// submission.pathway   // just accessing the data you already fetched
// submission.reasoning


//Res.Header
//  it's instructions you send to the browser telling it what kind of file is coming and what to do with it:
// javascriptres.setHeader('Content-Type', 'application/pdf');
// // "Hey browser, what's coming is a PDF file"

// res.setHeader('Content-Disposition', `attachment; filename="results.pdf"`);
// // "Download it, don't open it in a tab, call it results.pdf"
// ```

// Without these headers the browser wouldn't know what to do with the data coming back.

// ---

// So the full flow in plain English:
// ```
// URL comes in with an id
// → fetch that submission from database
// → if not found, return 404
// → if found, pass the data into generatePDF
// → get PDF buffer back
// → tell browser it's a PDF and to download it
// → send the PDF


// Why JSON.parse on those two?
// When you saved priority_actions and anti_priority_warnings to the database you used JSON.stringify to convert the arrays into strings. Now when you read them back from the database they're still strings. JSON.parse converts them back into arrays so forEach can loop through them properly.
// So:

// JSON.stringify → array to string (when saving to DB)
// JSON.parse → string back to array (when reading from DB)