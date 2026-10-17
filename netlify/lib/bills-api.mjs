// Bills API, shared by the Netlify Function (netlify/functions/bills.mjs) and
// the local dev server (scripts/local-api.mjs). Takes a web Request, returns a Response.
//
//   GET    /api/ping            check the shop PIN
//   GET    /api/bills           all bills, newest first
//   POST   /api/bills           save a new bill -> gets the next bill number
//   GET    /api/bills/:billNo   one bill
//   PUT    /api/bills/:billNo   update a saved bill
//   DELETE /api/bills/:billNo   hide a bill (kept in the table with deleted_at set)
//   POST   /api/bills/:billNo/sent   mark a bill as sent to the customer
//   GET    /api/public/bills/:token  one bill for the customer's link (no PIN)
//   GET    /api/settings        payment QRs and delivery people
//   PUT    /api/settings        replace them
//   GET    /api/catalog         items and customers worked out from the bills
//   PUT    /api/catalog/rules   save merge / rename / hide / edit rules
//
// Every other request needs the X-Shop-Pin header to match SHOP_PIN.

import { createHash, timingSafeEqual } from "node:crypto";
import { EMPTY_RULES, buildCatalog, parseRules } from "./catalog.mjs";

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
  -- Bills start as drafts; sending one to the customer marks it sent.
  alter table bills add column if not exists status text not null default 'draft';
  alter table bills add column if not exists sent_at timestamptz;
  -- Random code in the customer's bill link (/b/<token>); existing bills get one too.
  alter table bills add column if not exists share_token text not null
    default substr(replace(gen_random_uuid()::text, '-', ''), 1, 16);
  create unique index if not exists bills_share_token_idx on bills (share_token);
  -- Which payment QR and delivery person were picked for the bill (copied from settings).
  alter table bills add column if not exists payment jsonb;
  alter table bills add column if not exists delivery jsonb;
  -- One row of shop settings: payment QRs (UPI IDs, QR codes, QR photos) and delivery people.
  create table if not exists settings (
    id         integer primary key,
    data       jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
  );
  -- Clean-up rules for the Items / Customers tabs (one row).
  create table if not exists catalog_rules (
    id         integer primary key,
    data       jsonb not null default '{}'::jsonb,
    updated_at timestamptz not null default now()
  );
`;

const COLUMNS =
  "bill_no, customer_name, customer_phone, customer_address, items, total, status, created_at, updated_at, sent_at, share_token, payment, delivery";

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

const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$/;
const PAYMENT_TYPES = new Set(["upi", "qr", "image"]);
const QR_PICTURE = /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/;
const EMPTY_SETTINGS = { payments: [], delivery: [], defaultPaymentId: null };

// A payment QR as stored on a bill: "upi" (QR made from a UPI ID, with the bill's
// amount), "qr" (the exact text read from a QR photo) or "image" (the photo itself,
// kept in settings and looked up by id).
function parsePayment(raw) {
  if (!raw || typeof raw !== "object") return null;
  const id = text(raw.id, 40);
  if (!id || !PAYMENT_TYPES.has(raw.type)) return null;
  const payment = { id, type: raw.type, label: text(raw.label, 60) };
  if (raw.type === "upi") {
    payment.upiId = text(raw.upiId, 100);
    payment.payeeName = text(raw.payeeName, 100);
    if (!UPI_ID.test(payment.upiId)) throw new BadRequest(`UPI ID "${payment.upiId}" doesn't look right.`);
  }
  if (raw.type === "qr") {
    payment.payload = text(raw.payload, 1000);
    if (!payment.payload) throw new BadRequest("The QR code is empty.");
  }
  return payment;
}

function parseDelivery(raw) {
  if (!raw || typeof raw !== "object") return null;
  const name = text(raw.name, 80);
  return name ? { id: text(raw.id, 40), name, phone: text(raw.phone, 20) } : null;
}

export function parseSettings(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new BadRequest("Settings must be a JSON object.");
  const payments = (Array.isArray(body.payments) ? body.payments : []).slice(0, 20).map((raw) => {
    const payment = parsePayment(raw);
    if (!payment) throw new BadRequest("Each payment QR needs an id and a type.");
    if (payment.type === "image") {
      const image = typeof raw.image === "string" ? raw.image : "";
      if (image.length > 600_000 || !QR_PICTURE.test(image)) throw new BadRequest("The QR photo is missing or too big.");
      payment.image = image;
    }
    return payment;
  });
  const delivery = (Array.isArray(body.delivery) ? body.delivery : []).slice(0, 30).map(parseDelivery).filter(Boolean);
  const ids = new Set(payments.map((p) => p.id));
  return {
    payments,
    delivery,
    defaultPaymentId: ids.has(body.defaultPaymentId) ? body.defaultPaymentId : payments[0]?.id ?? null,
  };
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
    payment: parsePayment(body.payment),
    delivery: parseDelivery(body.delivery),
  };
}

const toBill = (row) => ({
  billNo: row.bill_no,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  items: row.items,
  total: Number(row.total),
  status: row.status,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  sentAt: row.sent_at ? row.sent_at.toISOString() : null,
  shareToken: row.share_token,
  payment: row.payment,
  delivery: row.delivery,
});

// What the customer's link shows: the bill itself, nothing about drafts or links.
const toPublicBill = (row) => ({
  billNo: row.bill_no,
  customerName: row.customer_name,
  customerPhone: row.customer_phone,
  customerAddress: row.customer_address,
  items: row.items,
  total: Number(row.total),
  createdAt: row.created_at.toISOString(),
  payment: row.payment,
  delivery: row.delivery,
});

const values = (bill) => [
  bill.customerName,
  bill.customerPhone,
  bill.customerAddress,
  JSON.stringify(bill.items),
  bill.total,
  bill.payment && JSON.stringify(bill.payment),
  bill.delivery && JSON.stringify(bill.delivery),
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

  async function readSettings(pool) {
    const { rows } = await pool.query("select data from settings where id = 1");
    return { ...EMPTY_SETTINGS, ...(rows[0]?.data ?? {}) };
  }

  async function settingsRoute(req) {
    const pool = getPool();
    await ensureSchema(pool);
    if (req.method === "GET") return json(200, { settings: await readSettings(pool) });
    if (req.method === "PUT") {
      const settings = parseSettings(await readJson(req));
      await pool.query(
        `insert into settings (id, data, updated_at) values (1, $1::jsonb, now())
         on conflict (id) do update set data = excluded.data, updated_at = now()`,
        [JSON.stringify(settings)]
      );
      return json(200, { settings });
    }
    return json(405, { error: "Method not allowed." });
  }

  async function readRules(pool) {
    const { rows } = await pool.query("select data from catalog_rules where id = 1");
    return { ...EMPTY_RULES, ...(rows[0]?.data ?? {}) };
  }

  async function catalogResponse(pool, rules) {
    const { rows } = await pool.query(
      `select bill_no, created_at, customer_name, customer_phone, customer_address, total, items
         from bills where deleted_at is null`
    );
    const bills = rows.map((row) => ({
      billNo: row.bill_no,
      createdAt: row.created_at.toISOString(),
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      customerAddress: row.customer_address,
      total: Number(row.total),
      items: row.items,
    }));
    return json(200, { catalog: buildCatalog(bills, rules), rules });
  }

  async function catalogRoute(req, path) {
    const pool = getPool();
    await ensureSchema(pool);
    if (path === "/api/catalog" && req.method === "GET") return catalogResponse(pool, await readRules(pool));
    if (path === "/api/catalog/rules" && req.method === "PUT") {
      let rules;
      try {
        rules = parseRules(await readJson(req));
      } catch (err) {
        throw err instanceof BadRequest ? err : new BadRequest(err.message);
      }
      await pool.query(
        `insert into catalog_rules (id, data, updated_at) values (1, $1::jsonb, now())
         on conflict (id) do update set data = excluded.data, updated_at = now()`,
        [JSON.stringify(rules)]
      );
      return catalogResponse(pool, rules);
    }
    return json(405, { error: "Method not allowed." });
  }

  async function publicBill(req, token) {
    if (req.method !== "GET") return json(405, { error: "Method not allowed." });
    try {
      const pool = getPool();
      await ensureSchema(pool);
      const { rows } = await pool.query(
        `select ${COLUMNS} from bills where share_token = $1 and deleted_at is null`,
        [token]
      );
      if (!rows[0]) return json(404, { error: "This bill link is not valid." });
      const bill = toPublicBill(rows[0]);
      // A QR photo lives in settings; show it only while it is still there.
      if (bill.payment?.type === "image") {
        const settings = await readSettings(pool);
        const photo = settings.payments.find((p) => p.id === bill.payment.id && p.type === "image");
        bill.payment = photo ? { ...bill.payment, image: photo.image } : null;
      }
      return json(200, { bill });
    } catch (err) {
      console.error(err);
      return json(500, { error: "Server error. Try again in a moment." });
    }
  }

  return async function handle(req) {
    const publicMatch = new URL(req.url).pathname.match(/^\/api\/public\/bills\/([a-f0-9]{16})\/?$/);
    if (publicMatch) return publicBill(req, publicMatch[1]);

    const expected = getPin();
    if (!expected) return json(500, { error: "SHOP_PIN is not set on the server." });
    if (!pinMatches(req.headers.get("x-shop-pin") ?? "", expected)) return json(401, { error: "Wrong PIN." });

    const path = new URL(req.url).pathname.replace(/\/+$/, "");
    if (path === "/api/settings" || path.startsWith("/api/catalog")) {
      try {
        return await (path === "/api/settings" ? settingsRoute(req) : catalogRoute(req, path));
      } catch (err) {
        if (err instanceof BadRequest) return json(400, { error: err.message });
        console.error(err);
        return json(500, { error: "Server error. Try again in a moment." });
      }
    }
    const match = path.match(/^\/api\/(ping|bills)(?:\/(\d{1,9})(\/sent)?)?$/);
    if (!match) return json(404, { error: "Not found." });
    const [, resource, id, sent] = match;
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
            `insert into bills (customer_name, customer_phone, customer_address, items, total, payment, delivery)
             values ($1, $2, $3, $4::jsonb, $5, $6::jsonb, $7::jsonb) returning ${COLUMNS}`,
            values(bill)
          );
          return json(201, { bill: toBill(rows[0]) });
        }
        return json(405, { error: "Method not allowed." });
      }

      const billNo = Number(id);
      if (sent) {
        if (method !== "POST") return json(405, { error: "Method not allowed." });
        const { rows } = await pool.query(
          `update bills set status = 'sent', sent_at = now()
            where bill_no = $1 and deleted_at is null
           returning ${COLUMNS}`,
          [billNo]
        );
        return rows[0] ? json(200, { bill: toBill(rows[0]) }) : json(404, { error: `Bill #${billNo} not found.` });
      }
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
                  items = $5::jsonb, total = $6, payment = $7::jsonb, delivery = $8::jsonb,
                  updated_at = now()
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
