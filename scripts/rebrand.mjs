import fs from 'node:fs';
import path from 'node:path';

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
        .replaceAll('x:"https://x.com/sixdotfun"', 'x:null')
        .replaceAll('domain:"sixpad.fun"', 'domain:"Leonmint"')
        .replaceAll('https://sixpad.fun/opengraph-image?1d3018d5710fd59d', SHARE_IMAGE)
        .replaceAll('logo:"logo.png"', 'logo:"leonmint-logo.png"')
        .replaceAll('/logo.png', '/leonmint-logo.png');
      if (entry.name.endsWith('.css')) next += '\n.sx-bar-ca .ca button,.hm-six-ca .ca button,.hm-six-buy,.cn-six .sx-ca,.cn-six .hm-buy{display:none!important}.cn-six .cn-act:before{content:"CA TBA";color:#aaa;font:600 12px Arial,sans-serif}\n';
      if (next !== source) fs.writeFileSync(target, next);
    }
  }
  visit(site);
  fs.copyFileSync(path.join(site, 'logo.png'), path.join(site, 'leonmint-logo.png'));
  fs.writeFileSync(path.join(site, 'api', 'coin'), JSON.stringify({ ca: 'TBA', buyUrl: '#', from: 'prelaunch' }));
  const pinsFile = path.join(site, 'api', 'pins');
  const pins = JSON.parse(fs.readFileSync(pinsFile, 'utf8'));
  pins.six = { ca: null, mcap: 0 };
  fs.writeFileSync(pinsFile, JSON.stringify(pins));
}
