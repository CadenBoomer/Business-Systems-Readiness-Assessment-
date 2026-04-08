const pool = require('../models/db');
const axios = require('axios');
const generatePDF = require('../services/pdfService');
const sendMail = require('../services/email');
const Anthropic = require('@anthropic-ai/sdk');
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });



// Axios = when a user submits the assessment, your backend receives the answers and then needs to forward them to the 
// ML endpoint. Axios is what does that forwarding.

exports.submitAssessment = async (req, res) => {
    const { first_name, last_name, email, responses } = req.body;

    try {
        // Call real ML API
        const mlResponse = await axios.post(`${process.env.ML_API_URL}/predict`, {
            first_name,
            responses
        });

        const {
            pathway,
            reasoning,
            confidence_score,
            summary,
            priority_actions,
            anti_priority_warnings,
            class_probabilities
        } = mlResponse.data;

        // Extract from summary object
        // const summaryIntro = summary.intro;
        // const summaryNarrative1 = summary.narrative_paragraph_1;
        // const summaryNarrative2 = summary.narrative_paragraph_2;
        // const summaryGraduationOutlook = summary.graduation_outlook;
        const summaryFull = summary.full_report_text;
        const strongestArea = summary.strongest_area;
        const weakestArea = summary.weakest_area;
        const graduation_outlook = summary.graduation_outlook; // ← add this


        // Generate narrative report using Claude
        const claudeResponse = await client.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 600,
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
            ${graduation_outlook}

            Strongest Area: ${strongestArea}
            Weakest Area: ${weakestArea}`
                }
            ]
        });

        const narrativeReport = claudeResponse.content[0].text;

        // Save to database
        const [result] = await pool.query(
            'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, class_probabilities, narrative_report) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                first_name,
                last_name,
                email,
                JSON.stringify(responses),
                pathway,
                reasoning,
                confidence_score,
                summaryFull,
                JSON.stringify(priority_actions),
                JSON.stringify(anti_priority_warnings),
                graduation_outlook,
                JSON.stringify(class_probabilities),
                narrativeReport
            ]
        );

        // Fetch CTA settings
        const [settingsRows] = await pool.query('SELECT * FROM settings');
        const settings = {};
        settingsRows.forEach(row => {
            settings[row.setting_key] = row.setting_value;
        });

        // Fire webhook to GoHighLevel via Make
        // if (process.env.WEBHOOK_URL) {
        //     await axios.post(process.env.WEBHOOK_URL, {
        //         first_name,
        //         last_name,
        //         email,
        //         pathway,
        //         reasoning,
        //         confidence_score,
        //         graduation_outlook
        //     });
        // }

        const pdfBuffer = await generatePDF(
            first_name,
            last_name,
            pathway,
            reasoning,
            confidence_score,
            summaryFull,
            priority_actions,
            anti_priority_warnings,
            graduation_outlook,
            narrativeReport
        );

        await sendMail(
            email,
            first_name,
            last_name,
            pathway,
            reasoning,
            confidence_score,
            summaryFull,
            priority_actions,
            anti_priority_warnings,
            graduation_outlook,
            narrativeReport,
            pdfBuffer,
            settings
        );

        res.status(201).json({
            message: 'Assessment submitted successfully',
            submission_id: result.insertId,
            pathway,
            reasoning,
            confidence_score,
            summary: summaryFull,
            priority_actions,
            anti_priority_warnings,
            graduation_outlook,
            class_probabilities,
            narrative_report: narrativeReport
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


// Test for Postman

// exports.submitAssessment = async (req, res) => {
//     const { first_name, last_name, email, responses } = req.body;

//     try {
//         const mlResponse = {
//             data: {
//                 pathway: "Growth",
//                 reasoning: "Predicted Growth from response pattern similarity.",
//                 confidence_score: 0.94,
//                 summary: "You have solid foundational systems in place with room to grow.",
//                 priority_actions: [
//                     "Standardise your client onboarding workflow.",
//                     "Connect your payment system to automated confirmations.",
//                     "Launch a structured reactivation campaign.",
//                     "Implement a consistent review request process.",
//                     "Set up a regular metrics review cadence."
//                 ],
//                 anti_priority_warnings: [
//                     "Don't invest heavily in AI tools until your CRM is consistent.",
//                     "Don't build complex automations before core sequences are reliable.",
//                     "Don't expand offers until primary offer systems are operational."
//                 ],
//                 graduation_outlook: "Once you have standardised delivery and integrated payments you'll be ready for the Optimization pathway."
//             }
//         };

//         const { pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook } = mlResponse.data;

//         // Generate narrative report using Claude
//         const claudeResponse = await client.messages.create({
//             model: 'claude-sonnet-4-20250514',
//             max_tokens: 600,
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

//         const [result] = await pool.query(
//             'INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrative_report) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
//             [first_name, last_name, email, JSON.stringify(responses), pathway, reasoning, confidence_score, summary, JSON.stringify(priority_actions), JSON.stringify(anti_priority_warnings), graduation_outlook, narrativeReport]
//         );

//         // Fetch CTA settings
//         const [settingsRows] = await pool.query('SELECT * FROM settings');
//         const settings = {};
//         settingsRows.forEach(row => {
//             settings[row.setting_key] = row.setting_value;
//         });

//         // Fire webhook to GoHighLevel via Make
//         // if (process.env.WEBHOOK_URL) {
//         //     await axios.post(process.env.WEBHOOK_URL, {
//         //         first_name,
//         //         last_name,
//         //         email,
//         //         pathway,
//         //         reasoning,
//         //         confidence_score,
//         //         graduation_outlook
//         //     });
//         // }

//         console.log('narrativeReport:', narrativeReport);
//         const pdfBuffer = await generatePDF(first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport);

//         await sendMail(email, first_name, last_name, pathway, reasoning, confidence_score, summary, priority_actions, anti_priority_warnings, graduation_outlook, narrativeReport, pdfBuffer, settings);

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
//             narrative_report: narrativeReport
//         });

//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// };

exports.getSubmissions = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        // Gets the page number from the URL query string. So /api/submissions?page=2 gives you page 2. 
        // If no page is provided it defaults to 1.
        const limit = 20;
        const offset = (page - 1) * limit;
        // limit is how many submissions per page. offset is how many to skip. So page 1 skips 0, page 
        // 2 skips 20, page 3 skips 40 etc.

        const [rows] = await pool.query(
            'SELECT id, first_name, last_name, email, pathway, confidence_score, created_at FROM submissions ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [limit, offset]
        );
        // LIMIT tells MySQL to only return 20 rows. OFFSET tells it where to start. Together they 
        // give you the right 20 rows for each page.

        const [countResult] = await pool.query('SELECT COUNT(*) as total FROM submissions');
        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        // Gets the total number of submissions so you know how many pages there are. 
        // Math.ceil rounds up — so 21 submissions = 2 pages, not 1.05 pages.

        res.status(200).json({
            submissions: rows,
            currentPage: page,
            totalPages,
            total
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
