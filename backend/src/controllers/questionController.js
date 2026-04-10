const pool = require('../models/db');


//Gets all questions with answer options
exports.getQuestions = async (req, res) => {
    try{
        const [questions] = await pool.query('SELECT * FROM questions ORDER BY display_order');

        for(let question of questions){
            const [options] = await pool.query('SELECT * FROM answer_options WHERE question_id = ? ORDER BY display_order', 
        [question.id]
    );
            question.options = options;
        }
        res.status(200).json(questions);

    } catch (error){
        console.log(error);
        res.status(500).json({error: 'Internal server error'});

    }
};


//Update/Edit a question
exports.updateQuestion = async (req, res) => {
    const id = req.params.id;
    const { question_text, display_order } = req.body;
    try{
        await pool.query('UPDATE questions SET question_text = ?, display_order = ? WHERE id = ?',
            [question_text, display_order, id]
        );
        res.status(200).json({
            message: 'Question updated successfully'
        });
    } catch(error){
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    
    }
};

//Delete a question
// exports.deleteQuestion = async (req, res) => {
//     const id = req.params.id;
//     try{
//         await pool.query('DELETE FROM questions WHERE id = ?',
//             [id]
//         );
//         res.status(200).json({
//             message: 'Question deleted successfully'
//         });
//         } catch(error){
//             console.log(error);
//             res.status(500).json({error: 'Internal server error'});
//     }
// };



// For each question we just fetched, we go back to the database and get all the answer options that belong to it using question_id. Then we attach those options directly onto the question object as question.options.
// So the response ends up looking like:
// json[
//   {
//     "id": 1,
//     "question_text": "How many employees?",
//     "display_order": 1,
//     "options": [
//       { "id": 1, "option_text": "Less than 10" },
//       { "id": 2, "option_text": "10 to 50" }
//     ]
//   }

//Create a new question
// exports.createQuestion = async (req, res) => {
//      const { question_text, display_order } = req.body;
//     try{
//         const [result] = await pool.query('INSERT INTO questions (question_text, display_order) VALUES (?, ?)',
//             [question_text, display_order]
//         );
//         res.status(201).json({
//             message: 'Question created successfully',
//             id: result.insertId
//         });

//     } catch(error){
//         console.log(error);
//         res.status(500).json({error: 'Internal server error'});
    
//     }
// };