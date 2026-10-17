---
type: knowledge
title: Glossary
updated: 2026-10-17
last-verified: 2026-10-17
---

# Glossary

| Term | Meaning here |
|---|---|
| **Kirana** | A neighbourhood grocery shop in India. Bansal Store is one. |
| **The founder** | The repo owner (GitHub `anubhavb11`), who decides features and reviews every change. |
| **The father** | The shopkeeper, the founder's father, who makes the bills on his phone. The primary user. |
| **Bill** | One customer's order: customer details, item rows, total, optional payment QR and delivery person. Stored in `bills`. |
| **Bill number** | `bill_no`, a running integer from Postgres identity. Shown as "Bill #12". |
| **Draft** | A saved bill not yet sent (`status = 'draft'`). Every bill starts as one. |
| **Sent** | A send button was used (`status = 'sent'`, `sent_at`). Doesn't mean WhatsApp delivered it. |
| **Changed after sending** | A sent bill edited later (`updated_at > sent_at`). |
| **Rates missing** | Rows with an item but no qty or rate. |
| **Details** | The second column (formerly "Desc.", `description` in data): size, pack, brand ("1 kg"). |
| **New bill** | The button that starts the next bill. The current one stays as a draft (formerly "Clear"). |
| **View & Send** | The screen with the exact bill picture and the two send options. Route `#/send`. |
| **All bills** | The bill list (formerly "Master View"). Route `#/bills`. |
| **Items / Customers tabs** | Lists worked out from the bills, for clean-up. Called the "inventory" or "shop data" in chat. Not stock. |
| **Catalog** | The server's name for those lists: `GET /api/catalog` → `{ items, customers }`. |
| **Clean-up rules** | Merges, renames, hides and customer edits, stored in `catalog_rules`. Bills are never changed. |
| **Spelling** | One way an item name was typed (चीनी, चिनी, Sugar). Merged spellings point at one item. |
| **Chip** | A small tappable suggestion under the box being typed in. At most 3. |
| **Customer key** | `p:<phone>` / `a:<address key>` / `n:<name>`: how bills are grouped into customers. |
| **Address key** | An address cleaned for matching: `A-135, Madhu Vihar Ln no. 8` → `a 135 madhu vihar lane 8`. |
| **Shop PIN** | The one shared secret (`SHOP_PIN`) every phone types once. |
| **Bill link / customer page** | `/b/<share_token>`: one bill, no PIN. Call shop, Save picture, Download PDF. |
| **Payment QR** | A UPI ID (QR made with the amount) or a QR photo, chosen per bill from Settings. |
| **UPI** | India's instant bank payment system; `upi://pay?pa=<id>&am=<amount>` links open any UPI app. |
| **Udhaar** | Credit: goods taken now, paid later. Not tracked in the app (held idea). |
| **Check site** | billingbansal.netlify.app (branch `main`). The founder tried changes there first until 17 Oct 2026; **deleted** that day ([D050](../decisions/D050-one-live-site-main-dev-only.md)). |
| **Father's site** | bansalstore.netlify.app (branch `main-dev`): the only live site and the source of truth. Formerly billingdev.netlify.app. |
| **Netlify credits** | The Free plan's monthly budget (300). When it runs out, every site on the account goes offline. |
| **Neon** | Hosted serverless Postgres. The founder's own free project holds all data. |
| **Ji / aunty** | Respectful suffixes in Indian names ("Sharma ji", "Gupta aunty"), common in test data. |
| अरहर दाल तूर, चीनी, आटा | Toor dal, sugar, flour: typical item names, often typed in Hindi. |
| धन्यवाद | "Thank you", printed at the foot of every bill. |
