---
type: architecture
title: Frontend
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../src/App.js, ../../../src/Billing.jsx, ../../../src/bill.js]
---

# Frontend

Create React App 5, React 18, plain CSS (`src/App.css`, design tokens on `:root`), and no
router or state library.

## Entry and routing

- `src/index.js`: if the path is `/b/<token>`, render `PublicBill`; otherwise render `App`.
  React StrictMode is commented out.
- `src/App.js` `useHash()` reads `window.location.hash`. Pages: `#/` bill, `#/send` (alias
  `#/view`), `#/bills`, `#/items`, `#/customers`, `#/settings`
  ([D015](../decisions/D015-hash-routing.md)).
- The back bar shows the page title, and the Settings gear on Bills / Items / Customers.
  `DATA_TABS` draws the Bills · Items · Customers tabs.

## State in `App.js`

| State | What | Persisted |
|---|---|---|
| `draft` | The bill on screen: `key`, `billNo`, customer fields, `items` (rows with ids), `payment`, `delivery`, `status`, `sentAt`, `shareToken`, `dirty`, `rev` | `localStorage.billDraft` on every change |
| `bills` | Cached list for All bills (`null` until loaded) | memory |
| `filters` | `{ q, status, range, from, to, sort, customer }` | memory |
| `settings` | Payment QRs and delivery people | `localStorage.shopSettings` |
| `catalogData` | `{ catalog, rules }` for chips and tabs | `localStorage.shopCatalog` |
| `unlocked` | Has a PIN | `localStorage.shopPin` |
| `saveState` | `idle` / `saving` / `offline` / `error` | — |

## Auto-save ([D031](../decisions/D031-auto-save.md))

```
needsSave(draft) = draft.dirty && draft.items.some(rowHasContent)
effect on [draft]: if needsSave → setTimeout(saveNow, 1000)
saveNow():
  wait for any save in flight (saving ref)
  POST (no billNo) or PUT (billNo)
  on success: if still the same draft.key → store billNo/status/token;
              dirty = (draft.rev !== rev at start)   // typed during save → save again
window 'online' → saveNow if needed
```
`newBill` first saves the bill on screen (`settleCurrent`). Then `startNewBill` resets the
draft, pre-fills the default payment QR and refreshes the catalog, and a toast says "Bill #N
saved as draft" (or "Bill #N is in All bills" if it was sent). `settleCurrent` asks before
leaving a bill that has customer details but no items (those aren't saved), or a bill that
couldn't be saved because there's no internet.

## Bill screen details (`src/Billing.jsx`)

- **Rows** come from `bill.js`: `padRows` (at least 5) and `withSpareRows` (+2 when the last
  row is used, [D035](../decisions/D035-two-spare-rows.md)). Each row has a stable `id` used as
  the React key.
- **Item and Details** are auto-growing textareas; Enter moves focus to the next box
  ([D018](../decisions/D018-wrap-long-item-names.md)).
- **Qty/Rate** use `inputMode="decimal"` and `cleanNumber`.
- **Chips** ([D038](../decisions/D038-chips-not-dropdowns.md)):
  - `focus` state is `{ kind: 'customer', field }` or `{ kind: 'item', index }`.
  - `blurLater` clears it after 200 ms.
  - `keepFocus` cancels pointerdown/mousedown on chips so the input keeps focus and the tap lands.
  - Customer chips render under the customer box. Item chips render in a `<tr class="chip-row">` under the focused row.
  - `pickItem` fills name, plus details and rate if empty, then focuses that row's Qty. `pickCustomer` fills all three fields, then focuses the first empty row's Item. `fillKnownItem` runs on item blur, using `exactItem`.
- **Labels** follow [D036](../decisions/D036-details-bin-new-bill.md): "Details", a bin icon, and "New bill" with a subline.

## Other screens

- `SendPage.jsx`: picture preview and the two send options ([bill picture and sending](bill-picture-and-sending.md)).
- `Bills.jsx`: loads the list on open, while cached bills show meanwhile. Uses `filterBills`
  and shows a "Bills of …" banner when `filters.customer` is set ([D046](../decisions/D046-see-bills-by-customer-group.md)).
- `ItemsPage.jsx` / `CustomersPage.jsx`: refresh the catalog on mount; tick rows; a fixed
  bottom merge bar; expand a row for actions; every action calls `onRulesChange(nextRules)`,
  which PUTs the rules and applies the returned catalog.
- `Settings.jsx`: add payment QRs by UPI ID or photo; delivery people; saves with PUT.
- `PinScreen.jsx`: checks with `/api/ping`, then stores the PIN.

## Styling

- Tokens: `--orange #e25629` (the only accent), `--green` (WhatsApp/Sent), `--red`
  (delete/errors), `--ink`, `--muted`, `--line`, `--page` ([D032](../decisions/D032-calm-bigger-ui.md)).
- Layout max width 720px, centred. Buttons at least 52px tall. Inputs 16px.
- Icons are inline SVG in `src/Icons.jsx`.

## Gotchas

- `Settings.jsx` and the helpers must not differ only by letter case. macOS treats them as
  the same file, which is why the helpers are `shopSettings.js`.
- The hooks lint rule treats any function named `use…` as a hook. That is why the catalog
  setter is `applyCatalog`, not `useCatalog`.
- The strict build (`CI=true`) fails on missing effect dependencies. Fix them; don't disable them.
