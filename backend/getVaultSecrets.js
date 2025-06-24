
// backend/getVaultSecrets.js
require('dotenv').config();

const fetchSecretFromVault = async () => {
  const fetch = (await import('node-fetch')).default;

  const VAULT_ADDR = process.env.VAULT_ADDR;
  const ROLE_ID    = process.env.ROLE_ID;
  const SECRET_ID  = process.env.SECRET_ID;

  if (!VAULT_ADDR || !ROLE_ID || !SECRET_ID) {
    throw new Error("Missing VAULT_ADDR, ROLE_ID, or SECRET_ID in .env");
  }

  // 1) Login via AppRole
  const loginRes = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role_id: ROLE_ID, secret_id: SECRET_ID })
  });
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${await loginRes.text()}`);
  }
  const loginJson = await loginRes.json();
  const token     = loginJson.auth.client_token;

  // 2) Read KV–v1 secret (no /data/ in path)
  const secretRes = await fetch(`${VAULT_ADDR}/v1/secret/myapp/config`, {
    headers: { 'X-Vault-Token': token }
  });
  if (!secretRes.ok) {
    throw new Error(`Secret fetch failed: ${await secretRes.text()}`);
  }
  const secretJson  = await secretRes.json();
  const secretData  = secretJson.data;

  // 3) Return just the fields you need
  return {
    DB_USER:     secretData.DB_USER,
    DB_PASSWORD: secretData.DB_PASSWORD,
    DB_NAME:     secretData.DB_NAME
  };
};

module.exports = fetchSecretFromVault;

