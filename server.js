import { createServer } from "http";
import { readFile } from "fs/promises";
import { extname, join, resolve, sep } from "path";
import { fileURLToPath } from "url";

const root = resolve(fileURLToPath(new URL(".", import.meta.url)));
const rootPrefix = root.endsWith(sep) ? root : root + sep;
const port = Number(process.env.PORT) || 8741;

const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://127.0.0.1:${port}`);
    const rel = decodeURIComponent(url.pathname).replace(/^\/+/, "") || "index.html";
    const filePath = resolve(root, rel);
    if (filePath !== root && !filePath.startsWith(rootPrefix)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    const data = await readFile(filePath);
    res.writeHead(200, {
      "Content-Type": types[extname(filePath)] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", () => {
  console.log(`Tide Lanterns  http://127.0.0.1:${port}`);
});
