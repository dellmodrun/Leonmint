import { spawn } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { fileURLToPath } from "node:url";

const port = 43000 + (process.pid % 1000);
const child = spawn(process.execPath, ["server.mjs"], {
  cwd: fileURLToPath(new URL("..", import.meta.url)),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"]
});
try {
  let ready = false;
  for (let attempt = 0; attempt < 30 && !ready; attempt++) {
    await delay(100);
    ready = await fetch(`http://127.0.0.1:${port}/`, { method: "HEAD" }).then(() => true, () => false);
  }
  if (!ready) throw new Error("local server did not start");
  const routes = ["/", "/map", "/coins", "/create", "/claim", "/logo.png", "/maplibre/maplibre-gl-worker.mjs"];
  for (const route of routes) {
    const response = await fetch(`http://127.0.0.1:${port}${route}`);
    if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (!bytes.length) throw new Error(`${route}: empty response`);
    console.log(`OK ${route} ${bytes.length} bytes ${response.headers.get("x-sixpad-local") || ""}`);
  }
  const blocked = await fetch(`http://127.0.0.1:${port}/api/test`, { method: "POST" });
  if (blocked.status !== 403) throw new Error(`write guard: expected 403, got ${blocked.status}`);
  console.log("OK write guard 403");
} finally {
  child.kill();
}
