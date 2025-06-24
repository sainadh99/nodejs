require('dotenv').config();

(async () => {
  const fetch = (await import('node-fetch')).default;

  const VAULT_ADDR = process.env.VAULT_ADDR;
  const ROLE_ID = process.env.ROLE_ID;
  const SECRET_ID = process.env.SECRET_ID;

  async function getVaultToken() {
    const response = await fetch(`${VAULT_ADDR}/v1/auth/approle/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role_id: ROLE_ID, secret_id: SECRET_ID })
    });

    if (!response.ok) throw new Error(`Login failed: ${await response.text()}`);
    const data = await response.json();
    return data.auth.client_token;
  }

  async function getSecret(token) {
    const response = await fetch(`${VAULT_ADDR}/v1/secret/myapp/config`, {
      headers: { 'X-Vault-Token': token }
    });

    if (!response.ok) throw new Error(`Secret fetch failed: ${await response.text()}`);
    const data = await response.json();
    return data.data;
  }

  try {
    if (!VAULT_ADDR || !ROLE_ID || !SECRET_ID) {
      throw new Error('Missing VAULT_ADDR, ROLE_ID, or SECRET_ID in .env');
    }

    const token = await getVaultToken();
    console.log('✅ Vault Token:', token);
    const secret = await getSecret(token);
    console.log('✅ Retrieved Secret from Vault:', secret);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
})();

