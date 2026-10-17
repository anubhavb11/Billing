---
type: operations
title: Testing
updated: 2026-10-17
last-verified: 2026-10-17
---

# Testing

## Automated (run before every ship)

```bash
CI=true npx react-scripts test --watchAll=false   # 40 tests, about 1 s
CI=true npm run build                             # strict: lint warnings fail it
npm run wiki:lint                                 # wiki links, frontmatter, secrets
```

| File | Covers |
|---|---|
| `src/bill.test.js` | Number cleaning, decimal amounts and totals, payload drops empty rows, 5-row minimum, legacy `userOrder` import, spare rows |
| `src/billsFilter.test.js` | Sort, date ranges, search (name, phone digits, item, `#N`), status filter, item preview, **bills of one customer group** |
| `src/share.test.js` | Missing rates, changed-after-sending, friendly dates, UPI QR text, QR photo lookup, Android vs iPhone caption, `waNumber`, WhatsApp text |
| `src/catalog.test.js` | Chip ranking and limits, spellings, customers by address/phone/name, merge/separate/rename/hide, **address variants and typos** |

Server code (`netlify/lib/*.mjs`) is pure enough to test in Node directly. When changing
`buildCatalog` or `parseBill`, add a test or at least run them against sample data.

## Manual checks (agents do these in the browser pane)

Use the **production build** (`npm run build && npm run serve:build`, port 5050) with the
local API running, at **phone width 360–375px**.

1. **Bill**: type an address (chips appear), pick one; type items (chips), pick one (jumps to Qty); type in the last row (2 rows appear); wait 1 s (top bar shows "Bill #N" with "Saved · made …"); reload (bill still there).
2. **View & Send**: the picture matches the screen (fonts, spacing, Hindi, QR, delivery line); the green button appears only with a valid phone; Send picture falls back sensibly in a desktop browser.
3. **All bills**: Drafts/Sent counts, search `#N`, Edit opens the bill, See bills from Customers shows the "Bills of …" banner.
4. **Items/Customers**: merge, rename, hide, separate; reload and confirm they persist.
5. **Customer page**: `/b/<token>` opens without the PIN; Save picture and Download PDF work.
6. **Desktop width**: centred at 720px, merge bar at the bottom.

Tips from the build session:
- Confirmation pop-ups can be auto-accepted in tests (`window.confirm = () => true`); say so in the PR.
- Set React-controlled inputs with the native value setter plus an `input` event. Pace
  steps about 400 ms apart, because faster runs gave false "no chip" results.
- Taps on chips: dispatch `pointerdown`, `mousedown`, `click` (chips cancel the first two to keep focus).

## What can't be tested locally

- **Sharing to WhatsApp**: needs HTTPS and a real phone. The founder checks on bansalstore after the deploy.
- **iPhone caption behaviour** ([D034](../decisions/D034-iphone-picture-without-caption.md)): unverified.
- **Real Neon cold starts and Netlify routing**: check bansalstore right after the deploy (there is no check site any more, [D050](../decisions/D050-one-live-site-main-dev-only.md)).

## Test data

- Use made-up customers (Sharma ji, Verma ji, Gupta aunty, Kapoor ji) and fake numbers.
- Local data lives in the local database only. **Anything created on bansalstore (or earlier on
  billingbansal) is in the father's real database**: use the local setup for test data, and
  clean up anything made live.
- After testing clean-ups locally, reset the rules (`PUT /api/catalog/rules {}`) so the
  founder can try them fresh.
