const pool = require('../models/db');
const axios = require('axios');
const generatePDF = require('../services/pdfService');
const sendMail = require('../services/email');



// Axios = when a user submits the assessment, your backend receives the answers and then needs to forward them to the 
// ML endpoint. Axios is what does that forwarding.

// exports.submitAssessment = async (req, res) => {
//     const { first_name, last_name, email, responses } = req.body; // Grab the data coming in from the frontend. Frontend sends all that to this endpoint. We're pulling those values out of the request body. 

//     try {

//         const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
//             responses
//         });

//         const {
//             pathway,
//             reasoning,
//             confidence_score,
//             summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook,
//             class_probabilities
//         } = mlResponse.data;


//         //JSON.stringify(answers) converts the answers array into a string so MySQL can store it in the JSON column.
//         const [result] = await pool.query(
//             'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, class_probabilities) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [first_name, last_name, email, JSON.stringify(responses), pathway, reasoning, confidence_score, summary, JSON.stringify(priority_actions), JSON.stringify(anti_priority_warnings), graduation_outlook, JSON.stringify(class_probabilities)

//             ]
//         );

//         const pdfBuffer = await generatePDF(
//             first_name, 
//             last_name, 
//             pathway, 
//             reasoning, 
//             confidence_score,
//             summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook
//         )

//         await sendMail(
//         email, 
//         first_name, 
//         last_name, 
//         pathway, 
//         reasoning, 
//         confidence_score,
//         summary,
//         priority_actions,
//         anti_priority_warnings,
//         graduation_outlook,
//         pdfBuffer
//     );


//         //Once everything is saved we send back a response to the frontend with the pathway, reasoning and confidence score so the results page can display them. 
//         // `result.insertId` is the id of the row we just inserted — useful to have in case you need to reference it later.
//         res.status(201).json({
//             message: 'Assessment submitted successfully',
//             submission_id: result.insertId,
//             pathway,
//             reasoning,
//             confidence_score,
//              summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook,
//             class_probabilities

//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };


// Test for Postman

exports.submitAssessment = async (req, res) => {
    const { first_name, last_name, email, responses } = req.body;

    try {
        const mlResponse = {
            data: {
                pathway: "Growth",
                reasoning: "Predicted Growth from response pattern similarity.",
                confidence_score: 0.94,
                summary: "You have solid foundational systems in place with room to grow.",
                priority_actions: [
                    "Standardise your client onboarding workflow.",
                    "Connect your payment system to automated confirmations.",
                    "Launch a structured reactivation campaign.",
                    "Implement a consistent review request process.",
                    "Set up a regular metrics review cadence."
                ],
                anti_priority_warnings: [
                    "Don't invest heavily in AI tools until your CRM is consistent.",
                    "Don't build complex automations before core sequences are reliable.",
                    "Don't expand offers until primary offer systems are operational."
                ],
                graduation_outlook: "Once you have standardised delivery and integrated payments you'll be ready for the Optimization pathway."
            }
        };

        const { pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook } = mlResponse.data;

        const [result] = await pool.query(
            'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, JSON.stringify(responses), pathway, reasoning, confidence_score, summary, JSON.stringify(priority_actions), JSON.stringify(anti_priority_warnings), graduation_outlook]
        );

        const pdfBuffer = await generatePDF(first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook);

        await sendMail(email, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, pdfBuffer);

        res.status(201).json({
            message: 'Assessment submitted successfully',
            submission_id: result.insertId,
            pathway,
            reasoning,
            confidence_score,
            summary,
            priority_actions,
            anti_priority_warnings,
            graduation_outlook
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};