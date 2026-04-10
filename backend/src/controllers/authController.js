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

        // bcrypt doesn't decrypt the stored password. Instead it hashes what the user typed and compares 
        // the two hashes. So the actual password is never exposed anywhere, even in your own code.

        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: admin.id, username: admin.username }, process.env.JWT_SECRET, { expiresIn: '1h' }

        );


        // Creates a token with the admin's id and username baked into it. Think of it like a temporary 
        // ID badge that expires in 1 hour. Every protected request checks for this badge.

        res.status(200).json({ message: 'Login successful', token })

    }
    catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }

}


exports.updateCredentials = async (req, res) => {
    const { current_password, new_password, new_username } = req.body;
    try {
        // Get current admin
        const [rows] = await pool.query('SELECT * FROM admin LIMIT 1');
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Admin not found' });
        }

        const admin = rows[0];

        // Verify current password
        const bcrypt = require('bcrypt');
        const isMatch = await bcrypt.compare(current_password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        // Build update query
        const updates = [];
        const values = [];

        if (new_username) {
            updates.push('username = ?');
            values.push(new_username);
        }

        if (new_password) {
            const hashed = await bcrypt.hash(new_password, 10);
            updates.push('password = ?');
            values.push(hashed);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No changes provided' });
        }

        await pool.query(
            `UPDATE admin SET ${updates.join(', ')} WHERE id = ?`,
            [...values, admin.id]
        );

        res.status(200).json({ message: 'Credentials updated successfully' });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

