const pool = require('../models/db');

exports.getPathways = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM pathways');
        res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updatePathway = async (req, res) => {
    const { id } = req.params;
    const { description } = req.body;
    try {
        await pool.query(
            'UPDATE pathways SET description = ? WHERE id = ?',
            [description, id]
        );
        res.status(200).json({ message: 'Pathway updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};