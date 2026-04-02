const pool = require('../models/db');
const axios = require('axios');
const generatePDF = require('../services/pdfService');
const sendMail = require('../services/email');
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });



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

//         // After getting ML response, add Claude call here:
//         const claudeResponse = await client.messages.create({
//             model: 'claude-sonnet-4-20250514',
//             max_tokens: 1000,
//             system: [
//                 {
//                     type: 'text',
//                     text: `You are generating a Business Systems Readiness Assessment report for a service-based entrepreneur.

//                 Generate a personalized assessment report with exactly these four sections. Write in flowing prose with no markdown formatting, no section header symbols, and no bullet point symbols. Use plain text only:

//                 Personalized Intro
//                 Address the user by name. 2-3 warm, encouraging sentences acknowledging where they are and what that means. Normalize their current stage without judgment.

//                 Business Systems Narrative
//                 Two paragraphs. First paragraph describes the pattern across their answers and the central challenge they are facing. Second paragraph describes what changes when the right systems are in place — make it feel tangible and specific.

//                 Recommended Focus Areas
//                 5 bullet points. Each one has a bold title followed by a dash and a brief description. No numbering.

//                 Graduation Outlook
//                 2-3 sentences. Describe what becomes possible when the focus areas are in place. Forward looking and encouraging.

//                 Keep the tone warm, direct and non-judgmental. No jargon. Maximum 500 words total. Do not use any markdown symbols like #, ##, **, *, or ---`,
//                     cache_control: { type: 'ephemeral' }
//                 }
//             ],
//             messages: [
//                 {
//                     role: 'user',
//                     content: `The user's name is ${first_name}. They have been classified into the ${pathway} pathway.

//                 ML Reasoning signals:
//                 ${reasoning}

//                 Priority Actions:
//                 ${priority_actions.join('\n')}

//                 Anti-Priority Warnings:
//                 ${anti_priority_warnings.join('\n')}

//                 Graduation Outlook:
//                 ${graduation_outlook}`
//                 }
//             ]
//         });

//         const narrativeReport = claudeResponse.content[0].text;

//         //JSON.stringify(answers) converts the answers array into a string so MySQL can store it in the JSON column.
//         const [result] = await pool.query(
//             'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, class_probabilities, narrative_report) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [first_name, last_name, email, JSON.stringify(responses), pathway, reasoning, confidence_score, summary, JSON.stringify(priority_actions), JSON.stringify(anti_priority_warnings), graduation_outlook, JSON.stringify(class_probabilities), narrativeReport

//             ]
//         );

//         // Fetch CTA settings
//         const [settingsRows] = await pool.query('SELECT * FROM settings');
//         const settings = {};
//         settingsRows.forEach(row => {
//             settings[row.setting_key] = row.setting_value;
//         });

//         // Fire webhook to GoHighLevel via Zapier/Make
//         if (process.env.WEBHOOK_URL) {
//             await axios.post(process.env.WEBHOOK_URL, {
//                 first_name,
//                 last_name,
//                 email,
//                 pathway,
//                 reasoning,
//                 confidence_score,
//                 graduation_outlook
//             });
//         }


//         const pdfBuffer = await generatePDF(
//             first_name,
//             last_name,
//             pathway,
//             reasoning,
//             confidence_score,
//             summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook,
//             narrativeReport
//         )

//         await sendMail(
//             email,
//             first_name,
//             last_name,
//             pathway,
//             reasoning,
//             confidence_score,
//             summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook,
//             narrativeReport,
//             pdfBuffer,
//             settings
//         );


//         //Once everything is saved we send back a response to the frontend with the pathway, reasoning and confidence score so the results page can display them. 
//         // `result.insertId` is the id of the row we just inserted — useful to have in case you need to reference it later.
//         res.status(201).json({
//             message: 'Assessment submitted successfully',
//             submission_id: result.insertId,
//             pathway,
//             reasoning,
//             confidence_score,
//             summary,
//             priority_actions,
//             anti_priority_warnings,
//             graduation_outlook,
//             class_probabilities,
//             narrative_report: narrativeReport

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

        // Generate narrative report using Claude
        const claudeResponse = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1000,
            system: [
                {
                    type: 'text',
                    text: `You are generating a Business Systems Readiness Assessment report for a service-based entrepreneur.

                Generate a personalized assessment report with exactly these four sections. Write in flowing prose with no markdown formatting, no section header symbols, and no bullet point symbols. Use plain text only:

                Personalized Intro
                Address the user by name. 2-3 warm, encouraging sentences acknowledging where they are and what that means. Normalize their current stage without judgment.

                Business Systems Narrative
                Two paragraphs. First paragraph describes the pattern across their answers and the central challenge they are facing. Second paragraph describes what changes when the right systems are in place — make it feel tangible and specific.

                Recommended Focus Areas
                5 bullet points. Each one has a bold title followed by a dash and a brief description. No numbering.

                Graduation Outlook
                2-3 sentences. Describe what becomes possible when the focus areas are in place. Forward looking and encouraging.

                Keep the tone warm, direct and non-judgmental. No jargon. Maximum 500 words total. Do not use any markdown symbols like #, ##, **, *, or ---`,
                    cache_control: { type: 'ephemeral' }
                }
            ],
            messages: [
                {
                    role: 'user',
                    content: `The user's name is ${first_name}. They have been classified into the ${pathway} pathway.

                ML Reasoning signals:
                ${reasoning}

                Priority Actions:
                ${priority_actions.join('\n')}

                Anti-Priority Warnings:
                ${anti_priority_warnings.join('\n')}

                Graduation Outlook:
                ${graduation_outlook}`
                }
            ]
        });

        const narrativeReport = claudeResponse.content[0].text;

        const [result] = await pool.query(
            'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrative_report) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [first_name, last_name, email, JSON.stringify(responses), pathway, reasoning, confidence_score, summary, JSON.stringify(priority_actions), JSON.stringify(anti_priority_warnings), graduation_outlook, narrativeReport]
        );

        // Fetch CTA settings
        const [settingsRows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        settingsRows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        // Fire webhook to GoHighLevel via Make
        if (process.env.WEBHOOK_URL) {
            await axios.post(process.env.WEBHOOK_URL, {
                first_name,
                last_name,
                email,
                pathway,
                reasoning,
                confidence_score,
                graduation_outlook
            });
        }

        console.log('narrativeReport:', narrativeReport);
        const pdfBuffer = await generatePDF(first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport);

        await sendMail(email, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport, pdfBuffer, settings);

        res.status(201).json({
            message: 'Assessment submitted successfully',
            submission_id: result.insertId,
            pathway,
            reasoning,
            confidence_score,
            summary,
            priority_actions,
            anti_priority_warnings,
            graduation_outlook,
            narrative_report: narrativeReport
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getSubmissions = async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT id, first_name, last_name, email, pathway, confidence_score, created_at FROM submissions ORDER BY created_at DESC'
        );
        res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};