---
type: architecture
title: Data model
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../netlify/lib/bills-api.mjs, ../../../netlify/lib/catalog.mjs, ../../../src/bill.js]
---

# Data model

The source of truth is `SCHEMA` in `netlify/lib/bills-api.mjs`. It runs on the first
request of each function instance, under an advisory lock, and is **additive only**
([D012](../decisions/D012-schema-on-first-request.md)). bansalstore is the only site that
connects to it; billingbansal was deleted on 17 Oct 2026 ([D050](../decisions/D050-one-live-site-main-dev-only.md)).

## Tables

### `bills`

| Column | Type | Notes | Added by |
|---|---|---|---|
| `bill_no` | integer identity PK | Running number; gaps possible; never reused | [D007](../decisions/D007-bill-fields.md) |
| `customer_name` | text, default `''` | ≤120 chars | D007 |
| `customer_phone` | text, default `''` | ≤20 chars, free text ("+91 98100-12345") | D007 |
| `customer_address` | text, default `''` | ≤300 chars | D007 |
| `items` | jsonb, default `[]` | `[{ name, description, qty, rate, amount }]`, empty rows dropped | — |
| `total` | numeric(14,2) | Recomputed by the server | — |
| `created_at`, `updated_at` | timestamptz | `updated_at` set on PUT | — |
| `deleted_at` | timestamptz null | Soft delete | [D013](../decisions/D013-soft-delete.md) |
| `status` | text, default `'draft'` | `'draft'` or `'sent'` | [D019](../decisions/D019-draft-and-sent-status.md) |
| `sent_at` | timestamptz null | Set by `POST /api/bills/:n/sent` | D019 |
| `share_token` | text, unique, default 16 hex from `gen_random_uuid()` | The customer link `/b/<token>` | [D021](../decisions/D021-private-bill-link.md) |
| `payment` | jsonb null | Snapshot of the chosen payment QR | [D027](../decisions/D027-bill-keeps-a-snapshot.md) |
| `delivery` | jsonb null | Snapshot `{ id, name, phone }` | D027 |

Index: `bills_created_at_idx` on `created_at desc` where not deleted. The list query orders
by `bill_no desc`.

**Item row** (`items[]`): `name` (≤120), `description` (≤200; shown as "Details"), `qty` and
`rate` (number or `null`), `amount` (`qty × rate` rounded to 2 places, or 0 when either is
missing). A row with nothing in it is dropped. A bill must have at least one row.

**Payment snapshot** (`payment`):
- `{ id, type: "upi", label, upiId, payeeName }`: QR made from the UPI ID with the bill's amount.
- `{ id, type: "qr", label, payload }`: exact text read from a QR photo.
- `{ id, type: "image", label }`: the photo itself lives in `settings` and is looked up by `id`.

### `settings` (one row, `id = 1`)

`data` jsonb:
```json
{
  "payments": [ { "id": "k3j…", "type": "upi", "label": "Shop GPay", "upiId": "…@okicici", "payeeName": "" },
                { "id": "…", "type": "image", "label": "Paytm sticker", "image": "data:image/jpeg;base64,…" } ],
  "delivery": [ { "id": "…", "name": "Raju", "phone": "98…" } ],
  "defaultPaymentId": "k3j…"
}
```
Limits: 20 payments, 30 delivery people, QR photo ≤600 KB data URL (png/jpeg/webp). UPI IDs
must match `^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$`.

### `catalog_rules` (one row, `id = 1`)

`data` jsonb holds the clean-up rules ([D041](../decisions/D041-cleanup-as-rules-bills-never-change.md)):

| Key | Shape | Meaning |
|---|---|---|
| `itemAliases` | `{ spellingKey: itemKey }` | Merged spellings point at the item they belong to |
| `itemNames` | `{ itemKey: "Name" }` | Renamed items |
| `itemHidden` | `[itemKey]` | Not suggested |
| `customerAliases` | `{ customerKey: customerKey }` | Merged customers |
| `customerEdits` | `{ customerKey: { name?, phone?, address? } }` | Corrected details |
| `customerHidden` | `[customerKey]` | Not suggested |

`spellingKey` / `itemKey` = `norm(name)` (lower-case, single spaces, NFC). `customerKey` =
`p:<last 10 digits>` / `a:<addressKey>` / `n:<norm(name)>` ([D043](../decisions/D043-customer-identity-key.md)).
Limits: 2,000 entries per map or list; keys and values ≤200 chars, except `customerEdits` (name ≤120, phone ≤20, address ≤300).

## Derived data: the catalog (not stored)

`GET /api/catalog` returns `{ catalog: { items, customers }, rules }` built by `buildCatalog`
([D042](../decisions/D042-catalog-built-on-read.md)):

- **item**: `{ key, name, spellings[], spellingKeys[], details, rate, bills, lastAt, hidden }`.
  `name` is the renamed name, or else the most common spelling. `details` is the most common;
  `rate` is the last one used; `bills` counts bills, not rows.
- **customer**: `{ key, keys[], name, phone, address, bills, total, lastAt, hidden }`. The
  name, phone and address are the latest non-empty values, then `customerEdits` are applied.
  `keys` are all the own-keys merged into this group (used by See bills,
  [D046](../decisions/D046-see-bills-by-customer-group.md)).

## On the phone (`localStorage`)

| Key | Holds | Code |
|---|---|---|
| `billDraft` | The bill on screen (survives reload) | `src/bill.js` |
| `userOrder` | Old 2022 version's rows; read once, never written | `src/bill.js` `loadDraft` |
| `shopPin` | The shop PIN | `src/api.js` |
| `shopSettings` | Cached settings | `src/shopSettings.js` |
| `shopCatalog` | Cached `{ catalog, rules }` | `src/catalog.js` |

## Changing the schema safely

1. Add the column with `add column if not exists` and a default that old code can ignore.
2. Ship it. Older code (a phone's cached app, a rollback) keeps working because it never selects the new column.
3. Never rename or drop in the same release. If you must, do it in two releases, with a decision record.
