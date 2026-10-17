---
type: overview
title: Overview
updated: 2026-10-17
last-verified: 2026-10-17
sources: [sources/founder-chat-2026-10-16.md, decisions/README.md]
---

# Bansal Store billing app: overview

**What it is.** A phone-first billing app for Bansal Store, a family kirana (grocery) shop at
A-135 Madhu Vihar Lane no - 8. The founder (the repo owner, GitHub `anubhavb11`) built it for
their **father**, who runs the shop and makes every bill on his mobile. A bill is typed as a
table (item, details, qty, rate). It saves itself, then goes to the customer on WhatsApp as a
picture or as a text message with a private link.

**Who decides.** The founder makes the product decisions, and AI agents build them. Every
decision so far is in the [decision log](decisions/README.md), with the founder's own words
where they gave them.

## Where it runs

| | Address | Git branch | Role |
|---|---|---|---|
| **The site** | https://bansalstore.netlify.app | `main-dev` | **The only live site and the source of truth.** Was billingdev.netlify.app until 16 Oct 2026 ([D029](decisions/D029-site-name-bansalstore.md)). |
| ~~Check site~~ | ~~billingbansal.netlify.app~~ | `main` | **Deleted 17 Oct 2026**, and the `main` branch with it ([D050](decisions/D050-one-live-site-main-dev-only.md)). |
| Database | The founder's own Neon Postgres project | — | The father's data; only bansalstore connects to it ([D008](decisions/D008-own-neon-not-netlify-database.md)). |

## What it does today (17 Oct 2026)

- **Bill screen** (`#/`): address-first customer box, then the item table. It saves itself
  a second after typing and shows **Bill #N** in a sticky top bar, with "Saved" under it. Up to 3
  suggestion chips appear for items and customers, with fuzzy address matching. Two spare
  rows appear when the last row is used. Payment QR and Delivery are picked at the end.
  At the bottom: **New bill** (saves this one as a draft) and **View & Send**.
- **View & Send** (`#/send`): the exact bill picture, then a green **WhatsApp** button
  (text bill with link and UPI) and **Send picture** (share menu).
- **All bills** (`#/bills`): cards with Draft / Sent / Changed-after-sending and
  missing-rate chips, search, date filters, sort, totals, **Edit** and **View & Send**.
- **Items** and **Customers** tabs (`#/items`, `#/customers`): lists worked out from the
  bills, for a weekly clean-up (merge spellings, rename, hide, fix customer details).
- **Delivery and money** ([details](architecture/delivery-and-payments.md)):
  - Every bill tracks Packed → On the way → Delivered, and how it was paid (Cash · UPI · UPI later · Udhaar).
  - Cash a delivery boy collects shows as "Cash with Raju" until the father taps **Got it**.
  - UPI the boy reports waits for the father's check.
  - Udhaar goes on the customer's khata, and any amount received clears the oldest bills first.
- **Delivery boy's page** (`/d`): his own mobile number and PIN; only his orders, with items to tick and big Packed / On the way / Delivered buttons; shares his location while on the way.
- **Settings** (`#/settings`): payment QRs (UPI ID or QR photo), and delivery people with their app PIN.
- **Customer page** (`/b/<token>`): no PIN. Delivery steps, a live map while the order is on
  the way, paid or to-pay, then the bill with Call shop, Save picture and Download PDF.
- **Access**: one shop PIN, typed once per phone ([D006](decisions/D006-no-login-shop-pin.md)).

The full list, with the code behind each part, is in [product/features.md](product/features.md).

## Stack in one line

React 18 (Create React App) + Netlify Functions (Node, `pg`) + Neon Postgres, with
html-to-image, jsPDF, qrcode and jsQR in the browser. Details:
[architecture/overview.md](architecture/overview.md).

## How it got here

- **July–Sept 2022:** the founder wrote the first version (a billing table, later an invoice
  view, screenshot sharing and a Firebase prototype).
- **16–17 Oct 2026:** in one long session with an AI agent the app was rebuilt around saved
  bills, drafts, sending, settings, branding, auto-save, suggestions and clean-up. 16 PRs
  (#2–#17) were merged.

The story, step by step, is in [log.md](log.md).

## Read next

- New to the code: [architecture/overview.md](architecture/overview.md), then [operations/runbook.md](operations/runbook.md).
- Changing behaviour: [product/vision-and-principles.md](product/vision-and-principles.md) and [knowledge/invariants.md](knowledge/invariants.md).
- Planning what's next: [product/ideas-and-backlog.md](product/ideas-and-backlog.md) and [knowledge/open-questions.md](knowledge/open-questions.md).
