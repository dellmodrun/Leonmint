import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const site = path.join(root, '_site');
for (const route of ['', 'map/', 'coins/', 'create/', 'claim/']) {
  const file = path.join(site, route, 'index.html');
  if (!fs.existsSync(file)) throw new Error(`Missing route ${route || '/'}`);
  const html = fs.readFileSync(file, 'utf8');
  if (!html.includes('Leonmint') || !html.includes('TBA')) throw new Error(`Leonmint or TBA missing from ${route || '/'}`);
  if (html.includes('A3roW2EvSxwH4VrXpvXV8GwtrHPTWXS5ixwAXCaipump') || html.includes('$SIX') || html.includes('Six: launch')) throw new Error(`Old branding in ${route || '/'}`);
  if (html.includes(String.raw`href\":\"/leonmint-logo.png`)) throw new Error(`Unprefixed favicon in Next.js payload: ${route || '/'}`);
  if (!html.includes('/Leonmint/_next/static/')) throw new Error(`Broken Pages asset path in ${route || '/'}`);
  if (!html.includes('/Leonmint/leonmint-social.js')) throw new Error(`X button script missing in ${route || '/'}`);
}
const logo = path.join(site, 'leonmint-logo.png');
if (!fs.existsSync(logo) || fs.statSync(logo).size < 100000) throw new Error('Leonmint logo is missing');
const config = fs.readFileSync(path.join(site, '_next', 'static', 'chunks', '1d8af9x76_wml.js'), 'utf8');
if (!config.includes('name:"Leonmint",ticker:"$LEOMINT"') || !config.includes('ca:"TBA"')) throw new Error('Live brand config is outdated');
if (!config.includes('x:"https://x.com/leonmintpad"')) throw new Error('Leonmint X URL is missing');
if (!config.includes('logo:"Leonmint/leonmint-logo.png"')) throw new Error('Dynamic map landmark logo path is wrong');
if (config.includes('sixdotfun') || config.includes('A3roW2EvSxwH4VrXpvXV8GwtrHPTWXS5ixwAXCaipump')) throw new Error('Old account or CA remains');
const coin = JSON.parse(fs.readFileSync(path.join(site, 'api', 'coin'), 'utf8'));
if (coin.ca !== 'TBA' || coin.buyUrl !== '#') throw new Error('Prelaunch CA state is wrong');
if (!fs.readFileSync(path.join(site, 'leonmint-social.js'), 'utf8').includes('M18.901 1.153h3.68')) throw new Error('Official X glyph is missing');
console.log('PASS: Leonmint name, logo, ticker, TBA state and five Pages routes');
