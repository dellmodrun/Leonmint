import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "mirror");
const ORIGIN = "https://sixpad.fun";
const pages = ["/", "/map", "/coins", "/create", "/claim"];
const seedAssets = ["/maplibre/maplibre-gl-worker.mjs"];
const queued = new Set();
const completed = new Set();

function localPath(url, contentType = "") {
  const parsed = new URL(url, ORIGIN);
  let pathname = decodeURIComponent(parsed.pathname);
  if (pathname === "/") return path.join(OUT, "index.html");
  if (pages.includes(pathname) || contentType.includes("text/html")) {
    return path.join(OUT, pathname.slice(1), "index.html");
  }
  const clean = pathname.split("/").filter(Boolean);
  if (clean.some((part) => part === "..")) throw new Error(`Unsafe path: ${pathname}`);
  return path.join(OUT, ...clean);
}

function discover(text, baseUrl) {
  const candidates = new Set();
  const attr = /(?:href|src)=["']([^"'#]+)["']/gi;
  const cssUrl = /url\(["']?([^"')]+)["']?\)/gi;
  const embedded = /["'](\/_next\/[^"']+|\/[^"']+\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|ico)(?:\?[^"']*)?)["']/gi;
  for (const regex of [attr, cssUrl, embedded]) {
    let match;
    while ((match = regex.exec(text))) candidates.add(match[1]);
  }
  for (const value of candidates) {
    try {
      const found = new URL(value, baseUrl);
      if (found.origin !== ORIGIN) continue;
      if (!found.pathname.startsWith("/_next/") && !/\.(?:js|css|woff2?|png|jpe?g|gif|svg|webp|ico)$/i.test(found.pathname)) continue;
      found.hash = "";
      queued.add(found.href);
    } catch {}
  }
}

async function download(url, isPage = false) {
  if (completed.has(url)) return;
  completed.add(url);
  const response = await fetch(url, {
    headers: { "user-agent": "SixpadLocalMirror/1.0" },
    redirect: "follow"
  });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  const contentType = response.headers.get("content-type") || "";
  const bytes = Buffer.from(await response.arrayBuffer());
  const destination = localPath(isPage ? new URL(url).pathname : url, contentType);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, bytes);
  if (contentType.includes("text/") || contentType.includes("javascript") || /\.(?:js|css)$/i.test(destination)) {
    discover(bytes.toString("utf8"), url);
  }
  console.log(`${isPage ? "PAGE " : "ASSET"} ${new URL(url).pathname} -> ${path.relative(ROOT, destination)}`);
}

await mkdir(OUT, { recursive: true });
for (const route of pages) await download(`${ORIGIN}${route}`, true);
for (const asset of seedAssets) queued.add(`${ORIGIN}${asset}`);
while (true) {
  const pending = [...queued].filter((url) => !completed.has(url));
  if (!pending.length) break;
  for (let index = 0; index < pending.length; index += 8) {
    await Promise.all(pending.slice(index, index + 8).map((url) => download(url).catch((error) => {
      console.warn(`SKIP ${error.message}`);
    })));
  }
}
console.log(`Mirrored ${pages.length} pages and ${completed.size - pages.length} resources.`);
