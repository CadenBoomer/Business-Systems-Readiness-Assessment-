const pool = require('../models/db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
require('dotenv').config();

exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]
        );
        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const admin = rows[0]
        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' }

        );

        res.status(200).json({ message: 'Login successful', token })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}

