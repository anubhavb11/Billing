---
type: architecture
title: API
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../netlify/lib/bills-api.mjs, ../../../netlify/functions/bills.mjs]
---

# API

One Netlify Function (`netlify/functions/bills.mjs`, Functions v2) wraps `createApi` from
`netlify/lib/bills-api.mjs`. The same handler runs locally through `scripts/local-api.mjs`
on port 8787 ([D014](../decisions/D014-one-api-handler-local-and-netlify.md)).

> **Adding a route?** Add its path to `config.path` in `netlify/functions/bills.mjs` too.
> Netlify only sends listed paths to the function.

## Auth

- Every route except `/api/public/bills/:token` needs header `X-Shop-Pin` equal to the
  `SHOP_PIN` environment variable. It is compared as sha256 hashes with `timingSafeEqual`
  ([D006](../decisions/D006-no-login-shop-pin.md)).
- `/api/delivery/*` routes skip the shop PIN and need `X-Delivery-Phone` + `X-Delivery-Pin` instead: a delivery person from Settings with that mobile number (last 10 digits) and a PIN whose salted hash matches. Otherwise `401 Wrong mobile number or PIN.`
- Missing `SHOP_PIN` on the server → `500 {"error":"SHOP_PIN is not set on the server."}`.
- Wrong PIN → `401 {"error":"Wrong PIN."}`. The app then forgets the PIN and shows the PIN screen.

## Routes

| Method | Path | Body | Returns | Notes |
|---|---|---|---|---|
| GET | `/api/ping` | — | 204 | Checks a PIN (the PIN screen) |
| GET | `/api/bills` | — | `{ bills: Bill[] }` | Not deleted, newest number first |
| POST | `/api/bills` | BillInput | 201 `{ bill }` | Assigns the next `bill_no` |
| GET | `/api/bills/:n` | — | `{ bill }` | 404 if missing or deleted |
| PUT | `/api/bills/:n` | BillInput | `{ bill }` | Replaces customer, items, payment, delivery; sets `updated_at` |
| DELETE | `/api/bills/:n` | — | 204 | Soft delete ([D013](../decisions/D013-soft-delete.md)) |
| POST | `/api/bills/:n/sent` | — | `{ bill }` | `status='sent'`, `sent_at=now()` ([D019](../decisions/D019-draft-and-sent-status.md)) |
| GET | `/api/public/bills/:token` | — | `{ bill: PublicBill }` | **No PIN.** Token = 16 hex. QR photo filled in from settings ([D021](../decisions/D021-private-bill-link.md)) |
| GET | `/api/settings` | — | `{ settings }` | |
| PUT | `/api/settings` | Settings | `{ settings }` | Validated by `parseSettings` ([D025](../decisions/D025-payment-qr-in-settings.md)) |
| GET | `/api/catalog` | — | `{ catalog, rules }` | Built from all bills ([D042](../decisions/D042-catalog-built-on-read.md)); customers carry their `khata` |
| POST | `/api/bills/:n/track` | `{ step, undo? }` and/or `{ payment: { method, amount } \| null }` / `{ handover: true }` / `{ confirmUpi: true }` | `{ bill }` | Shop marks delivery and money ([D057](../decisions/D057-tracking-saved-apart-from-bill-contents.md)) |
| POST | `/api/cash/handover` | `{ personId }` | `{ bills, amount }` | All that person's open cash is now with the shop ([D052](../decisions/D052-cash-stays-with-delivery-boy-until-handover.md)) |
| POST | `/api/khata/payments` | `{ customerKey, amount, method: cash\|upi }` | `{ catalog, rules }` | Hisaab payment ([D054](../decisions/D054-udhaar-khata-any-amount.md)) |
| DELETE | `/api/khata/payments/:id` | — | `{ catalog, rules }` | Remove a wrong entry (soft) |
| GET | `/api/delivery/orders` | — | `{ person, orders }` | **Delivery PIN.** His orders only, no rates ([D055](../decisions/D055-delivery-boy-page-own-pin.md)) |
| POST | `/api/delivery/orders/:n/step` | `{ step, payment? }` | `{ order }` | **Delivery PIN.** Only his bills; can't clear a payment |
| POST | `/api/delivery/location` | `{ lat, lng, accuracy }` | 204 | **Delivery PIN.** Overwrites his last location ([D056](../decisions/D056-live-map-while-on-the-way.md)) |
| PUT | `/api/catalog/rules` | Rules | `{ catalog, rules }` | Validated by `parseRules` ([D041](../decisions/D041-cleanup-as-rules-bills-never-change.md)) |

**BillInput**: `{ customerName, customerPhone, customerAddress, items: [{ name, description, qty, rate }], payment, delivery }`.
The server trims and limits text, turns `""` into `null` for qty and rate, rejects
non-numbers (`400 Row N: Qty and Rate must be numbers.`), drops empty rows, requires at
least one row, and recomputes `amount` and `total`.

**Bill** (response): `{ billNo, customerName, customerPhone, customerAddress, items, total,
status, createdAt, updatedAt, sentAt, shareToken, payment, delivery }`.

**PublicBill**: the same, without `status`, `updatedAt`, `sentAt`, `shareToken` and `paymentStatus`; plus `deliveryEvents`, `paid` (`paid` / `udhaar` / `due`), and `courier` `{ lat, lng, accuracy, at }` only while on the way and fresh (< 3 min).

## Errors

All errors are JSON `{ error: "message for the father" }` with `Cache-Control: no-store`:
400 (validation), 401 (PIN), 404 (unknown route or bill), 405 (wrong method), 500 ("Server
error. Try again in a moment.", with details only in the function log). The app shows
`error` as a toast. A network failure becomes "No internet. Check the connection and try
again." (status 0).

## Database access

`netlify/lib/db.mjs` keeps one `pg.Pool` per function instance: `max: 3`,
`idleTimeoutMillis: 10s`, and `connectionTimeoutMillis: 10s` because Neon may be waking up. It
uses `NETLIFY_DATABASE_URL` if set, else `DATABASE_URL`
([D008](../decisions/D008-own-neon-not-netlify-database.md)).

## Trying it locally

```bash
npm run api   # needs .env with DATABASE_URL and SHOP_PIN (see .env.example)
curl -s -H "X-Shop-Pin: $SHOP_PIN" localhost:8787/api/bills | head -c 300
```
(Load the PIN from `.env` in your shell; don't paste it into files, chats or the wiki.)
