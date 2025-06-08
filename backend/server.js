const express = require('express');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Backend is running!');
});

app.get('/backend/users', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.json({ time: result.rows[0].now });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
