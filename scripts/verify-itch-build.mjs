// Serves dist/ from a nested path (e.g. http://localhost:8321/nested/index.html)
// to catch absolute-path asset references before they break on itch.io, which
// never hosts a game at a domain root. Run `npm run build` first, then:
//   node scripts/verify-itch-build.mjs
// and open the printed URL — check the network tab for 404s under /nested/assets/.

import http from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname } from "node:path";

const distDir = join(process.cwd(), "dist");
const port = 8321;
const types = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css" };

http
  .createServer(async (req, res) => {
    try {
      const reqUrl = decodeURIComponent(req.url.split("?")[0]);
      if (reqUrl === "/nested") {
        // Redirect to add the trailing slash, like a real static host does —
        // without it, relative "./assets/..." would resolve against the
        // wrong base and this test would trip on an unrelated URL quirk.
        res.writeHead(301, { Location: "/nested/" });
        return res.end();
      }
      // Strict: only serve requests actually prefixed with /nested/, so an
      // absolute "/assets/..." reference genuinely 404s instead of quietly
      // falling through to the real file at the server root.
      if (!reqUrl.startsWith("/nested/")) throw new Error("not under /nested/");
      let filePath = join(distDir, reqUrl.slice("/nested".length));
      const s = await stat(filePath).catch(() => null);
      if (s?.isDirectory()) filePath = join(filePath, "index.html");
      const data = await readFile(filePath);
      res.writeHead(200, { "Content-Type": types[extname(filePath)] ?? "application/octet-stream" });
      res.end(data);
    } catch {
      res.writeHead(404);
      res.end("not found");
    }
  })
  .listen(port, () => {
    console.log(`Serving dist/ under a nested path (itch.io simulation):`);
    console.log(`  http://localhost:${port}/nested/index.html`);
  });
