const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const db = require('./db');

const app = express();
const port = process.env.PORT || 5000;

console.log("✅ ENV Loaded:", {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_PORT: process.env.DB_PORT,
  PORT: process.env.PORT
});

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

app.get('/', (req, res) => res.send('Backend is running!'));

app.get('/users', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT u.id, u.name, u.email, e.role, e.company, e.description
      FROM users u
      LEFT JOIN experiences e ON u.id = e.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching user data:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  const { name, email, role, company, description } = req.body;
  try {
    const userResult = await db.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id, name, email',
      [name, email]
    );
    const user = userResult.rows[0];

    await db.query(
      'INSERT INTO experiences (id, role, company, description) VALUES ($1, $2, $3, $4)',
      [user.id, role, company, description]
    );

    res.json({ ...user, role, company, description });
  } catch (err) {
    console.error('Error inserting user:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
