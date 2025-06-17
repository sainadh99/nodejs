const fs = require('fs');
const { Pool } = require('pg');

// Read secrets or fallback to environment variables
const readSecret = (filePath, fallback) => {
  try {
    return fs.readFileSync(filePath, 'utf8').trim();
  } catch {
    return fallback;
  }
};

const pool = new Pool({
  user: readSecret('/run/secrets/db_user', process.env.DB_USER),
  host: process.env.DB_HOST || 'nodejs-db',
  database: readSecret('/run/secrets/db_name', process.env.DB_NAME),
  password: readSecret('/run/secrets/db_password', process.env.DB_PASSWORD),
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};

