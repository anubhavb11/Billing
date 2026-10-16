// Bills API, shared by the Netlify Function (netlify/functions/bills.mjs) and
// the local dev server (scripts/local-api.mjs). Takes a web Request, returns a Response.
//
//   GET    /api/ping            check the shop PIN
//   GET    /api/bills           all bills, newest first
//   POST   /api/bills           save a new bill -> gets the next bill number
//   GET    /api/bills/:billNo   one bill
//   PUT    /api/bills/:billNo   update a saved bill
//   DELETE /api/bills/:billNo   hide a bill (kept in the table with deleted_at set)
//
// Every request needs the X-Shop-Pin header to match SHOP_PIN.

import { createHash, timingSafeEqual } from "node:crypto";

const LIMITS = { name: 120, phone: 20, address: 300, itemName: 120, description: 200, rows: 300 };
const MAX_NUMBER = 1e9;

const SCHEMA = `
  create table if not exists bills (
    bill_no          integer generated always as identity primary key,
    customer_name    text not null default '',
    customer_phone   text not null default '',
    customer_address text not null default '',
    items            jsonb not null default '[]'::jsonb,
    total            numeric(14, 2) not null default 0,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now(),
    deleted_at       timestamptz
  );
  create index if not exists bills_created_at_idx on bills (created_at desc) where deleted_at is null;
`;

const COLUMNS =
  "bill_no, customer_name, customer_phone, customer_address, items, total, created_at, updated_at";

class BadRequest extends Error {}

const json = (status, data) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });

const noContent = () => new Response(null, { status: 204, headers: { "Cache-Control": "no-store" } });

const sha256 = (value) => createHash("sha256").update(String(value)).digest();
const pinMatches = (given, expected) => timingSafeEqual(sha256(given), sha256(expected));

const round2 = (n) => Math.round(n * 100) / 100;
const text = (value, max) => (typeof value === "string" ? value.trim().slice(0, max) : "");

// "" / null -> null (blank cell), numbers and numeric strings -> number, anything else -> NaN.
function toNumber(value) {
  if (value === "" || value === null || value === undefined) return null;
  const n = typeof value === "number" ? value : Number(String(value).trim());
  return Number.isFinite(n) && Math.abs(n) <= MAX_NUMBER ? n : NaN;
}

export function parseBill(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequest("Bill must be a JSON object.");
  if (!Array.isArray(body.items)) throw new BadRequest("items must be a list.");
  if (body.items.length > LIMITS.rows) throw new BadRequest(`A bill can have at most ${LIMITS.rows} rows.`);

  const items = [];
  body.items.forEach((raw, i) => {
    const row = raw && typeof raw === "object" ? raw : {};
    const name = text(row.name, LIMITS.itemName);
    const description = text(row.description, LIMITS.description);
    const qty = toNumber(row.qty);
    const rate = toNumber(row.rate);
    if (Number.isNaN(qty) || Number.isNaN(rate)) throw new BadRequest(`Row ${i + 1}: Qty and Rate must be numbers.`);
    if (!name && !description && qty === null && rate === null) return;
    const amount = qty !== null && rate !== null ? round2(qty * rate) : 0;
    items.push({ name, description, qty, rate, amount });
  });
  if (items.length === 0) throw new BadRequest("Add at least one item before saving.");

  return {
    customerName: text(body.customerName, LIMITS.name),
    customerPhone: text(body.customerPhone, LIMITS.phone),
    customerAddress: text(body.customerAddress, LIMITS.address),
    items,
    total: round2(items.reduce((sum, item) => sum + item.amount, 0)),
  };
}

const toBill = (row) => ({
  billNo: row.bill_no,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  items: row.items,
  total: Number(row.total),
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

const values = (bill) => [
  bill.customerName,
  bill.customerPhone,
  bill.customerAddress,
  JSON.stringify(bill.items),
  bill.total,
];

async function readJson(req) {
  try {
    return await req.json();
  } catch {
    throw new BadRequest("Body must be JSON.");
  }
}

export function createApi({ getPool, getPin }) {
  let schemaReady;

  // Creates the table on first use. The advisory lock stops two cold starts
  // from racing on CREATE TABLE.
  function ensureSchema(pool) {
    schemaReady ??= (async () => {
      const client = await pool.connect();
      try {
        await client.query("begin");
        await client.query("select pg_advisory_xact_lock(7243510)");
        await client.query(SCHEMA);
        await client.query("commit");
      } catch (err) {
        await client.query("rollback").catch(() => {});
        throw err;
      } finally {
        client.release();
      }
    })().catch((err) => {
      schemaReady = undefined;
      throw err;
    });
    return schemaReady;
  }

  return async function handle(req) {
    const expected = getPin();
    if (!expected) return json(500, { error: "SHOP_PIN is not set on the server." });
    if (!pinMatches(req.headers.get("x-shop-pin") ?? "", expected)) return json(401, { error: "Wrong PIN." });

    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    const match = path.match(/^\/api\/(ping|bills)(?:\/(\d{1,9}))?$/);
    if (!match) return json(404, { error: "Not found." });
    const [, resource, id] = match;
    const { method } = req;

    if (resource === "ping") return method === "GET" && !id ? noContent() : json(404, { error: "Not found." });

    try {
      const pool = getPool();
      await ensureSchema(pool);

      if (!id) {
        if (method === "GET") {
          const { rows } = await pool.query(
            `select ${COLUMNS} from bills where deleted_at is null order by bill_no desc`
          );
          return json(200, { bills: rows.map(toBill) });
        }
        if (method === "POST") {
          const bill = parseBill(await readJson(req));
          const { rows } = await pool.query(
            `insert into bills (customer_name, customer_phone, customer_address, items, total)
             values ($1, $2, $3, $4::jsonb, $5) returning ${COLUMNS}`,
            values(bill)
          );
          return json(201, { bill: toBill(rows[0]) });
        }
        return json(405, { error: "Method not allowed." });
      }

      const billNo = Number(id);
      if (method === "GET") {
        const { rows } = await pool.query(
          `select ${COLUMNS} from bills where bill_no = $1 and deleted_at is null`,
          [billNo]
        );
        return rows[0] ? json(200, { bill: toBill(rows[0]) }) : json(404, { error: `Bill #${billNo} not found.` });
      }
      if (method === "PUT") {
        const bill = parseBill(await readJson(req));
        const { rows } = await pool.query(
          `update bills
              set customer_name = $2, customer_phone = $3, customer_address = $4,
                  items = $5::jsonb, total = $6, updated_at = now()
            where bill_no = $1 and deleted_at is null
           returning ${COLUMNS}`,
          [billNo, ...values(bill)]
        );
        return rows[0]
          ? json(200, { bill: toBill(rows[0]) })
          : json(404, { error: `Bill #${billNo} not found. It may have been deleted.` });
      }
      if (method === "DELETE") {
        const { rowCount } = await pool.query(
          "update bills set deleted_at = now() where bill_no = $1 and deleted_at is null",
          [billNo]
        );
        return rowCount ? noContent() : json(404, { error: `Bill #${billNo} not found.` });
      }
      return json(405, { error: "Method not allowed." });
    } catch (err) {
      if (err instanceof BadRequest) return json(400, { error: err.message });
      console.error(err);
      return json(500, { error: "Server error. Try again in a moment." });
    }
  };
}
