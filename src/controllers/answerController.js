const db = require('../models/db');


//Get all answers for a questions
exports.getAnswer = async (req, res) => {
    const { id } = req.params;
    try {
        const [option] = await db.query('SELECT * FROM answer_options WHERE question_id = ? ORDER BY display_order',
            [id])
        res.status(200).json(option);

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });

    }
}

//Create a new answer/option
exports.createAnswer = async (req, res) => {
    const { id } = req.params;
    const { answer_text, display_order } = req.body;
    try {
        const [option] = await db.query('INSERT INTO answer_options (question_id, answer_text, display_order) VALUES (?, ?, ?)',
            [id, answer_text, display_order])

        res.status(200).json(option);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

//Update/Edit an answer/option
exports.updateAnswer = async (req, res) => {
    const { id } = req.params;
    const { answer_text, display_order } = req.body;
    try {
        await db.query('UPDATE answer_options SET answer_text = ?, display_order = ? WHERE id = ?',
            [answer_text, display_order, id])
        res.status(200).json({
            message: 'Answer updated successfully'
        });

    } catch (error) {
        console.log(error)
        res.status(500).json({ error: 'Internal server error' });
    }

}

//Delete an options/answer
exports.deleteAnswer = async (req, res) => {
    try{
        const {id} = req.params;
        await db.query('DELETE FROM answer_options WHERE id = ?',
        [id]);
        res.status(200).json({
            message: 'Answer deleted successfully'
        });
    } catch (error){
        console.log(error);
        res.status(500).json({error: 'Internal server error'});
    
    }
}