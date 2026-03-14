const pool = require('../models/db');
const axios = require('axios');

// // Axios = when a user submits the assessment, your backend receives the answers and then needs to forward them to the 
// // ML endpoint. Axios is what does that forwarding.

exports.submitAssessment = async (req, res) => {
const { first_name, last_name, email, answers } = req.body; // Grab the data coming in from the frontend. Frontend sends all that to this endpoint. We're pulling those values out of the request body. 

try{

    //We send the 12 answers array to the ML's endpoint. It sends back pathway, reasoning, and confidence_score. We pull those three values out of its response.
    const mlResponse = await axios.post(process.env.ML_API_URL, {answers})
    const { pathway, reasoning, confidence_score} = mlResponse.data;


        //JSON.stringify(answers) converts the answers array into a string so MySQL can store it in the JSON column.
    const [result] = await pool.query(
        'INSERT INTO submissions (first_name, last_name, email, pathway, reasoning, confidence_score) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email, JSON.stringify(answers), pathway, reasoning, confidence_score]
    );

    //Once everything is saved we send back a response to the frontend with the pathway, reasoning and confidence score so the results page can display them. 
    // `result.insertId` is the id of the row we just inserted — useful to have in case you need to reference it later.
        res.status(200).json({
            message: 'Assessment submitted successfully',
            submission_id: result.insertId,
            pathway,
            reasoning,
            confidence_score
        
        });
} catch (error){
    console.log(error);
    res.status(500).json({error: 'Internal server error'});
}
};


//Test for Postman

// exports.submitAssessment = async (req, res) => {
// const { first_name, last_name, email, answers } = req.body; // Grab the data coming in from the frontend. Frontend sends all that to this endpoint. We're pulling those values out of the request body. 

// try{
//     // TEMPORARY MOCK - Remove when ML API is ready
//     const mlResponse = {
//       data: {
//         pathway: "Foundation Systems",
//         reasoning: "The business has limited IT systems and low revenue, indicating a need for foundational systems.",
//         confidence_score: 0.95
//       }
//     };

//     const { pathway, reasoning, confidence_score} = mlResponse.data;

//     const result = await pool.query('INSERT INTO submissions (first_name, last_name, email, answers, pathway, reasoning, confidence_score) VALUES (?, ?, ?, ?, ?, ?, ?)',
//         [first_name, last_name, email, JSON.stringify(answers), pathway, reasoning, confidence_score]
//     );

//     res.status(201).json({
//         message: 'Assessment submitted successfully',
//         submission_id: result.insertId,
//         pathway, 
//         reasoning,
//         confidence_score
//     });
        

// } catch (error){
//     console.log(error);
//     res.status(500).json({error: 'Internal server error'});

//     }
// };