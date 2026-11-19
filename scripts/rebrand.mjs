import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const OLD_CA = 'A3roW2EvSxwH4VrXpvXV8GwtrHPTWXS5ixwAXCaipump';
const SHARE_IMAGE = 'https://dellmodrun.github.io/Leonmint/leonmint-logo.png';

export function applyRebrand(site) {
  function visit(directory) {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      const target = path.join(directory, entry.name);
      if (entry.isDirectory()) { visit(target); continue; }
      if (!['.html', '.js', '.mjs', '.css', '.json'].includes(path.extname(entry.name))) continue;
      const source = fs.readFileSync(target, 'utf8');
      let next = source
        .replaceAll('$SIX', '$LEOMINT')
        .replace(/\bSix\b/g, 'Leonmint')
        .replaceAll(OLD_CA, 'TBA')
        .replaceAll('A3roW2<!-- -->\u2026<!-- -->aipump', 'TBA<!-- -->\u2026<!-- -->TBA')
        .replaceAll('not priced yet', '$0')
        .replaceAll('https://pump.fun/coin/TBA', '#')
        .replaceAll('x:"https://x.com/sixdotfun"', 'x:"https://x.com/leonmintpad"')
        .replaceAll('domain:"sixpad.fun"', 'domain:"Leonmint"')
        .replaceAll('https://sixpad.fun/opengraph-image?1d3018d5710fd59d', SHARE_IMAGE)
        .replaceAll('logo:"logo.png"', 'logo:"Leonmint/leonmint-logo.png"')
        .replaceAll('/logo.png', '/leonmint-logo.png');
      if (entry.name.endsWith('.css')) next += '\n.sx-bar-ca .ca button,.hm-six-ca .ca button,.hm-six-buy,.cn-six .sx-ca,.cn-six .hm-buy{display:none!important}.cn-six .cn-act:before{content:"CA TBA";color:#aaa;font:600 12px Arial,sans-serif}.lm-x-button{width:36px;height:36px;flex:0 0 36px;display:grid;place-items:center;border:1px solid #ffffff30;border-radius:10px;background:#ffffff0c;color:#fff;transition:background .18s,color .18s,transform .18s}.lm-x-button svg{width:18px;height:18px}.lm-x-button:hover{background:#fff;color:#080b0d;transform:translateY(-1px)}.lm-x-button:focus-visible{outline:2px solid #13e0d3;outline-offset:2px}@media(max-width:640px){.lm-x-button{width:32px;height:32px;flex-basis:32px}.sx-bar{gap:8px}}\n';
      if (entry.name.endsWith('.html')) next = next.replace('</body>', '<script src="/Leonmint/leonmint-social.js" defer></script></body>');
      if (next !== source) fs.writeFileSync(target, next);
    }
  }
  visit(site);
  fs.copyFileSync(path.join(site, 'logo.png'), path.join(site, 'leonmint-logo.png'));
  fs.copyFileSync(path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), 'scripts', 'leonmint-social.js'), path.join(site, 'leonmint-social.js'));
  fs.writeFileSync(path.join(site, 'api', 'coin'), JSON.stringify({ ca: 'TBA', buyUrl: '#', from: 'prelaunch' }));
  const pinsFile = path.join(site, 'api', 'pins');
  const pins = JSON.parse(fs.readFileSync(pinsFile, 'utf8'));
  pins.six = { ca: null, mcap: 0 };
  fs.writeFileSync(pinsFile, JSON.stringify(pins));
}
