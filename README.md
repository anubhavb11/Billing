# Billing

A one-screen billing page for the shop, made to be used on a phone.

- **Auto-save**: the bill saves itself (as a **Draft**) a second after typing; it gets its
  number with the first item, shown in the top bar.
- **Clear** starts the next bill (the current one stays in All bills).
- **View & Send** shows the exact bill picture and **Send on WhatsApp** shares it through the
  phone's share menu (with the bill link as caption on Android), then marks it **Sent**.
- **All bills** lists bills (Drafts / Sent, missing rates, search, dates, sort) with **Edit**
  and **View & Send**. Settings (gear) holds payment QRs and delivery people.
- **Bill link** `/b/<token>` shows one bill to the customer without the PIN.

Code:

- `src/` – the React app (Create React App). `#/` is the bill, `#/send` View & Send, `#/bills`
  All bills, `/b/<token>` the customer's page. Shop details (and an optional UPI ID that adds
  a scan-to-pay QR to every bill) are in `src/shop.js`.
- `netlify/functions/bills.mjs` – the API, code in `netlify/lib/bills-api.mjs`.
- The `bills` table (and later columns) are created automatically on the first request.
- Every API call except `/api/public/bills/:token` needs the shop PIN (`SHOP_PIN`). The phone
  asks for it once and remembers it.

## Run it locally

Needs Node 20+ and a Postgres database (local Postgres, or a Neon branch).

```bash
npm install
cp .env.example .env        # then set DATABASE_URL and SHOP_PIN
npm run api                 # terminal 1: API on http://localhost:8787
npm start                   # terminal 2: app on http://localhost:3000 (proxies /api)
```

Tests: `npm test`.

## Set up on Netlify

1. **Database.** Either add the Neon extension to the Netlify site (it sets
   `NETLIFY_DATABASE_URL` for you), or create a free project on neon.tech and add its
   connection string as `DATABASE_URL` under *Site configuration → Environment variables*.
2. **PIN.** Add `SHOP_PIN` (6 or more digits) in the same place.
3. **Deploy from Git or the Netlify CLI** (`npx netlify-cli deploy --build --prod`).
   Drag-and-drop deploys only upload static files, so the bill-saving API would be missing.
4. On the phone: open the site, enter the PIN once, then *Add to Home Screen*.

Deleting a bill hides it from the app but keeps the row (`deleted_at` is set), so a
mistaken delete can be undone in the database.
