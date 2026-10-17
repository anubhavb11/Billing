// Runs the same bills API as the Netlify Function, on http://localhost:8787,
// against DATABASE_URL (local Postgres or a Neon branch). `npm start` proxies
// /api/* here (see "proxy" in package.json).
//
//   npm run api      # terminal 1
//   npm start        # terminal 2

import http from "node:http";
import { createApi } from "../netlify/lib/bills-api.mjs";
import { getPool } from "../netlify/lib/db.mjs";

const port = Number(process.env.API_PORT || 8787);
const handle = createApi({ getPool, getPin: () => process.env.SHOP_PIN });

http
  .createServer(async (req, res) => {
    try {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      const hasBody = !["GET", "HEAD"].includes(req.method) && chunks.length > 0;
      const headers = {};
      for (const name of ["content-type", "x-shop-pin", "x-delivery-phone", "x-delivery-pin"]) {
        if (req.headers[name]) headers[name] = req.headers[name];
      }
      const response = await handle(
        new Request(`http://localhost:${port}${req.url}`, {
          method: req.method,
          headers,
          body: hasBody ? Buffer.concat(chunks) : undefined,
        })
      );
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer()));
      console.log(req.method, req.url, response.status);
    } catch (err) {
      console.error(err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Local API crashed. See terminal." }));
    }
  })
  .listen(port, () => console.log(`Bills API on http://localhost:${port}`));
