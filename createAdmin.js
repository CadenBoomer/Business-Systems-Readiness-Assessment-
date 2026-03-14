const pool = require('./src/models/db');
const bcrypt = require('bcrypt')
require('dotenv').config();

const createAdmin = async () => {
    try {
        const username = process.env.ADMIN_USERNAME;
        const password = process.env.ADMIN_PASSWORD;

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            'INSERT INTO admin (username, password) VALUES (?, ?)',
            [username, hashedPassword]

        );

        console.log('Admin created successfully');
        process.exit();
    } catch (error) {
        console.log(error);
        process.exit(1);

    }
}
createAdmin();