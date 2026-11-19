import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const project = 'snwthyespgghvvlktyyu';
const publicKey = 'sb_publishable_lok_cbkXwfsPKEpOTTCl4Q_6aqpNf0v';
const input = process.argv[2];
if (!input || (input.toLowerCase() !== 'tba' && !/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input))) {
  console.error('Usage: npm run update:ca -- <Solana mint address|tba>');
  process.exit(1);
}
const mint = input.toLowerCase() === 'tba' ? null : input;

function vault(script) {
  return spawnSync('powershell.exe', ['-NoProfile', '-Command', '-'], {
    input: script, encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
  });
}
let serviceKey = '';
if (process.platform === 'win32') {
  const result = vault("$ErrorActionPreference='Stop'\n$type=[Windows.Security.Credentials.PasswordVault,Windows.Security.Credentials,ContentType=WindowsRuntime]\n$credential=([Windows.Security.Credentials.PasswordVault]::new()).Retrieve('BAWSAQ CA updater vault','bawsaq')\n$credential.RetrievePassword()\n[Console]::Out.Write($credential.Password)");
  if (result.status === 0) serviceKey = result.stdout.trim();
}
if (!serviceKey) throw new Error('Supabase update credential is unavailable on this computer.');

function http(url, method, headers, body) {
  const helper = fileURLToPath(new URL('./ca-http.py', import.meta.url));
  const result = spawnSync('python', [helper], {
    input: JSON.stringify({ url, method, headers, body }),
    encoding: 'utf8', windowsHide: true, stdio: ['pipe', 'pipe', 'pipe']
  });
  if (result.status !== 0) throw new Error('CA HTTPS helper failed.');
  return JSON.parse(result.stdout);
}

const endpoint = `https://${project}.supabase.co/rest/v1/leonmint_ca?slug=eq.official`;
const updated = http(endpoint, 'PATCH', {
  apikey: serviceKey,
  authorization: `Bearer ${serviceKey}`,
  'content-type': 'application/json',
  prefer: 'return=representation'
}, { mint, updated_at: new Date().toISOString() });
if (updated.status !== 200 || updated.data?.length !== 1 || updated.data[0].mint !== mint) {
  throw new Error(`CA update failed: HTTP ${updated.status}`);
}

const publicRead = http(`${endpoint}&select=mint`, 'GET', { apikey: publicKey, 'cache-control': 'no-store' });
if (publicRead.status !== 200 || publicRead.data?.length !== 1 || publicRead.data[0].mint !== mint) {
  throw new Error('Public CA read does not match the update');
}
console.log(`Leonmint CA live: ${mint || 'TBA'} (no Pages deployment)`);
