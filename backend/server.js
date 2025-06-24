const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();
const getVaultSecrets = require('./getVaultSecrets'); // 🔐 Vault integration
const { Pool } = require('pg');

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

(async () => {
  try {
    // 🔐 Fetch secrets from Vault
    const secrets = await getVaultSecrets();

    // ✅ Assign Vault secrets to environment variables
    process.env.DB_USER = secrets.DB_USER;
    process.env.DB_PASSWORD = secrets.DB_PASSWORD;
    process.env.DB_NAME = secrets.DB_NAME;
    process.env.DB_HOST = 'nodejs-db';
    process.env.DB_PORT = '5432';

    console.log('✅ Vault Secrets Loaded:', {
      DB_USER: process.env.DB_USER,
      DB_NAME: process.env.DB_NAME,
      DB_HOST: process.env.DB_HOST
    });

    // 🛠️ Setup PostgreSQL Pool
    const db = new Pool({
      user: process.env.DB_USER,
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      port: parseInt(process.env.DB_PORT),
    });

    // 🩺 Health Check
    app.get('/', (req, res) => {
      res.send('Backend is running!');
    });

    // 🔍 Get users with experience
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

    // ➕ Add new user with experience
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

        res.status(201).json({ user });
      } catch (err) {
        console.error('Error inserting user:', err);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // 🚀 Start the server
    app.listen(port, () => {
      console.log(`🚀 Server is running on port ${port}`);
    });

  } catch (err) {
    console.error('❌ Vault setup failed:', err.message);
    process.exit(1);
  }
})();

