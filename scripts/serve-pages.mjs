import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(path.dirname(fileURLToPath(import.meta.url))), '_site');
const base = '/Leonmint';
const port = Number(process.env.PORT || 4176);
const types = new Map([
  ['.html','text/html; charset=utf-8'], ['.js','text/javascript; charset=utf-8'],
  ['.mjs','text/javascript; charset=utf-8'], ['.css','text/css; charset=utf-8'],
  ['.png','image/png'], ['.jpg','image/jpeg'], ['.webp','image/webp'],
  ['.woff2','font/woff2']
]);

http.createServer(async (req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(403).end(); return; }
  const pathname = new URL(req.url, `http://${req.headers.host}`).pathname;
  if (pathname === '/') { res.writeHead(302, { location: `${base}/` }).end(); return; }
  if (!pathname.startsWith(`${base}/`)) { res.writeHead(404).end(); return; }
  const relative = decodeURIComponent(pathname.slice(base.length + 1));
  if (relative.split('/').includes('..') || relative.includes('\0')) { res.writeHead(400).end(); return; }
  const file = path.join(root, relative, pathname.endsWith('/') || !path.extname(relative) && !relative.startsWith('api/') ? 'index.html' : '');
  try {
    const bytes = await fs.readFile(file);
    res.setHeader('content-type', relative.startsWith('api/') ? 'application/json; charset=utf-8' : (types.get(path.extname(file)) || 'application/octet-stream'));
    res.writeHead(200).end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404).end(); }
}).listen(port, '127.0.0.1', () => console.log(`Leonmint preview: http://127.0.0.1:${port}${base}/`));
