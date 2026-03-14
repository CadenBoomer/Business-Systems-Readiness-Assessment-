const express = require('express');
const cors = require('cors');
require('dotenv').config();

const assessmentRoutes = require('./src/routes/assessmentRoutes');
const questionRoutes = require('./src/routes/questionRoutes');
const answerRoutes = require('./src/routes/answerRoutes');
const authRoutes = require('./src/routes/authRoutes');


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', assessmentRoutes); // Registers assessment Route
app.use('/api', questionRoutes); // Registers question Route
app.use('/api', answerRoutes); // Registers answer Route
app.use('/api', authRoutes); // Registers auth Route



app.get('/', (req, res) => {
  res.json({ message: 'Server is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});