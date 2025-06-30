// backend/getVaultSecrets.js
require('dotenv').config();
const fetch = require('node-fetch');

/* ------------------------------------------------------------------ */
/*  Environment variables                                             */
/* ------------------------------------------------------------------ */
const { VAULT_ADDR, ROLE_ID, SECRET_ID } = process.env;
if (!VAULT_ADDR || !ROLE_ID || !SECRET_ID) {
  throw new Error('Missing VAULT_ADDR, ROLE_ID, or SECRET_ID in environment');
}

/* ------------------------------------------------------------------ */
/* 1️⃣  Authenticate with Vault (AppRole → client token)               */
/* ------------------------------------------------------------------ */
async function getVaultToken() {
  const res = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: ROLE_ID, secret_id: SECRET_ID }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const json = await res.json();
  return json.auth.client_token;          // ← token for subsequent requests
}

/* ------------------------------------------------------------------ */
/* 2️⃣  Read secret from KV-v2 path: secret/data/myapp/db              */
/* ------------------------------------------------------------------ */
async function getSecret(token) {
  const res = await fetch(`${VAULT_ADDR}/v1/secret/data/myapp/db`, {
    headers: { 'X-Vault-Token': token },
  });
  if (!res.ok) throw new Error(`Secret fetch failed: ${await res.text()}`);
  const json = await res.json();
  return json.data.data;                  // KV-v2 → data.data holds the fields
}

/* ------------------------------------------------------------------ */
/* 3️⃣  Helper exported for server.js                                  */
/* ------------------------------------------------------------------ */
module.exports = async function fetchSecretFromVault() {
  const token  = await getVaultToken();
  const secret = await getSecret(token);  // { DB_USER, DB_PASSWORD, DB_NAME }
  return secret;
};

/* ------------------------------------------------------------------ */
/*  Optional: standalone test (uncomment to run once)                  */
/* ------------------------------------------------------------------ */
// (async () => {
//   try {
//     const secret = await module.exports();
//     console.log('✅ Retrieved secret:', secret);
//   } catch (err) {
//     console.error('❌ Error:', err.message);
//   }
// })();

