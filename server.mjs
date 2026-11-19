import http from "node:http";
import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIRROR = path.join(ROOT, "mirror");
const ORIGIN = "https://sixpad.fun";
const PORT = Number(process.env.PORT || 4175);
const pageRoutes = new Set(["/", "/map", "/coins", "/create", "/claim"]);
const mime = new Map([
  [".html", "text/html; charset=utf-8"], [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".css", "text/css; charset=utf-8"], [".json", "application/json; charset=utf-8"],
  [".png", "image/png"], [".jpg", "image/jpeg"], [".jpeg", "image/jpeg"],
  [".svg", "image/svg+xml"], [".webp", "image/webp"], [".woff2", "font/woff2"],
  [".ico", "image/x-icon"]
]);

function diskPath(url) {
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.includes("\0") || pathname.split("/").includes("..")) return null;
  if (pathname === "/") return path.join(MIRROR, "index.html");
  if (pageRoutes.has(pathname)) return path.join(MIRROR, pathname.slice(1), "index.html");
  return path.join(MIRROR, ...pathname.split("/").filter(Boolean));
}

function copyHeaders(response, res) {
  for (const name of ["content-type", "cache-control", "etag", "last-modified"]) {
    const value = response.headers.get(name);
    if (value) res.setHeader(name, value);
  }
}

async function serveFile(file, req, res) {
  try {
    const info = await stat(file);
    if (!info.isFile()) return false;
    const body = await readFile(file);
    res.statusCode = 200;
    const isApiCache = file.startsWith(path.join(MIRROR, "api") + path.sep);
    res.setHeader("content-type", isApiCache ? "application/json; charset=utf-8" : (mime.get(path.extname(file).toLowerCase()) || "application/octet-stream"));
    res.setHeader("x-sixpad-local", "mirror");
    res.end(req.method === "HEAD" ? undefined : body);
    return true;
  } catch {
    return false;
  }
}

async function proxyGet(req, res, parsed, file) {
  try {
    const upstream = await fetch(`${ORIGIN}${parsed.pathname}${parsed.search}`, {
      headers: { accept: req.headers.accept || "*/*", "user-agent": "SixpadLocalMirror/1.0" },
      redirect: "manual"
    });
    res.statusCode = upstream.status;
    copyHeaders(upstream, res);
    res.setHeader("x-sixpad-local", "upstream-read-only");
    const body = Buffer.from(await upstream.arrayBuffer());
    if (upstream.ok && file && !parsed.search && !pageRoutes.has(parsed.pathname)) {
      await mkdir(path.dirname(file), { recursive: true });
      await writeFile(file, body);
    }
    res.end(req.method === "HEAD" ? undefined : body);
  } catch (error) {
    res.statusCode = 502;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "Upstream unavailable", detail: error.message }));
  }
}

const server = http.createServer(async (req, res) => {
  const parsed = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  if (!new Set(["GET", "HEAD"]).has(req.method)) {
    res.statusCode = 403;
    res.setHeader("content-type", "application/json; charset=utf-8");
    res.end(JSON.stringify({ error: "本地前端镜像为只读模式，不会把发行、认领或其他写操作发送到原站。" }));
    return;
  }
  const file = diskPath(parsed);
  if (!file) {
    res.statusCode = 400;
    res.end("Bad request");
    return;
  }
  if (await serveFile(file, req, res)) return;
  await proxyGet(req, res, parsed, file);
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Sixpad local mirror: http://127.0.0.1:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
