/* getVaultSecrets.js
 * Fetch DB credentials from Vault (KV-v2) using AppRole
 */
require('dotenv').config();
const fetch = (await import('node-fetch')).default;

const { VAULT_ADDR, ROLE_ID, SECRET_ID } = process.env;

if (!VAULT_ADDR || !ROLE_ID || !SECRET_ID) {
  throw new Error('Missing VAULT_ADDR, ROLE_ID, or SECRET_ID in environment');
}

/* 1️⃣ Authenticate via AppRole */
async function getVaultToken() {
  const res = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: ROLE_ID, secret_id: SECRET_ID }),
  });
  if (!res.ok) throw new Error(`Login failed: ${await res.text()}`);
  const json = await res.json();
  return json.auth.client_token;
}

/* 2️⃣ Read secret from KV-v2 */
async function getSecret(token) {
  // KV-v2 path: note the /data/ segment
  const res = await fetch(`${VAULT_ADDR}/v1/secret/data/myapp/db`, {
    headers: { 'X-Vault-Token': token },
  });
  if (!res.ok) throw new Error(`Secret fetch failed: ${await res.text()}`);
  const json = await res.json();
  return json.data.data; // KV-v2 wraps data under data.data
}

/* 3️⃣ Helper exported for server.js */
module.exports = async function fetchVaultSecrets() {
  const token  = await getVaultToken();
  const secret = await getSecret(token);
  return secret;        // { DB_USER, DB_PASSWORD, DB_NAME }
};

/* If you want to test standalone, uncomment:
(async () => {
  try {
    const secret = await module.exports();
    console.log('✅ Retrieved secret:', secret);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();
*/

