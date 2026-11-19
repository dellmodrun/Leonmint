import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { applyRebrand } from './rebrand.mjs';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const source = path.join(root, 'mirror');
const output = path.join(root, '_site');
const repository = process.env.GITHUB_REPOSITORY?.split('/').at(-1) || 'Leonmint';
const base = `/${repository}`;

if (!fs.existsSync(path.join(source, 'index.html'))) throw new Error('Missing mirrored homepage');
fs.rmSync(output, { recursive: true, force: true });
fs.cpSync(source, output, { recursive: true });
applyRebrand(output);

const localRoot = /(["'`])(\/(?:_next|maplibre|leonmint-logo\.png|logo\.png|api|map|coins|create|claim))(?=[/?#"'`])/g;
const cssRoot = /url\((\/(?:_next|maplibre|logo\.png))(?=[/?#)])/g;

function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) { walk(target); continue; }
    if (!['.html', '.js', '.mjs', '.css', '.json'].includes(path.extname(entry.name))) continue;
    const original = fs.readFileSync(target, 'utf8');
    let next = original
      .replace(localRoot, (_, quote, url) => `${quote}${base}${url}`)
      .replace(cssRoot, (_, url) => `url(${base}${url}`)
      .replaceAll('https://sixpad.fun'+base+'/', 'https://sixpad.fun/')
      .replaceAll('href="/"', `href="${base}/"`)
      .replaceAll('href:"/"', `href:"${base}/"`);
    if (entry.name.endsWith('.html')) {
      next = next.replace('</head>', `<script>document.addEventListener('click',function(e){const a=e.target.closest('a[href]');if(a&&a.href.startsWith(location.origin+'${base}/')&&!e.ctrlKey&&!e.metaKey&&!e.shiftKey&&!e.altKey){e.preventDefault();e.stopImmediatePropagation();location.assign(a.href)}},true)</script></head>`);
    }
    if (next !== original) fs.writeFileSync(target, next);
  }
}
walk(output);
fs.writeFileSync(path.join(output, '.nojekyll'), '');
fs.copyFileSync(path.join(output, 'index.html'), path.join(output, '404.html'));
for (const route of ['map', 'coins', 'create', 'claim']) {
  if (!fs.existsSync(path.join(output, route, 'index.html'))) throw new Error(`Missing route: ${route}`);
}
console.log(`GitHub Pages output: ${output} (${base}/)`);
