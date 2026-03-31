const pool = require('../models/db');

exports.getSettings = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM settings');
        res.status(200).json(rows);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateSetting = async (req, res) => {
    const { setting_key, setting_value } = req.body;
    try {
        await pool.query(
            'UPDATE settings SET setting_value = ? WHERE setting_key = ?',
            [setting_value, setting_key]
        );
        res.status(200).json({ message: 'Setting updated' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};