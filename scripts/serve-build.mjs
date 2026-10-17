// Serves the production build (like Netlify) on http://localhost:5050 and forwards
// /api/* to the local API on :8787. Use it to check bill pictures and styles: the dev
// server loads CSS differently and once hid an unstyled-picture bug.
//
//   npm run api                         # terminal 1
//   npm run build && npm run serve:build   # terminal 2

import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const root = path.resolve(process.argv[2] || "build");
const port = Number(process.argv[3] || 5050);
const apiPort = Number(process.env.API_PORT || 8787);
const types = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain",
  ".map": "application/json",
};

http
  .createServer((req, res) => {
    if (req.url.startsWith("/api/")) {
      const proxy = http.request(
        { host: "localhost", port: apiPort, path: req.url, method: req.method, headers: req.headers },
        (r) => {
          res.writeHead(r.statusCode, r.headers);
          r.pipe(res);
        }
      );
      proxy.on("error", () => {
        res.writeHead(502);
        res.end("Local API not running (npm run api).");
      });
      req.pipe(proxy);
      return;
    }
    // Anything that isn't a file (/, #/ routes, /b/<token>) gets index.html, as on Netlify.
    let file = path.join(root, decodeURIComponent(req.url.split("?")[0]));
    if (!file.startsWith(root) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
      file = path.join(root, "index.html");
    }
    res.writeHead(200, { "Content-Type": types[path.extname(file)] || "application/octet-stream" });
    fs.createReadStream(file).pipe(res);
  })
  .listen(port, () => console.log(`Production build on http://localhost:${port}`));
