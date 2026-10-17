---
id: D025
title: "Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:43"
decision-makers: [founder]
area: [product, payments]
supersedes: []
superseded-by: []
related: [D026, D027]
evidence:
  - "chat 2026-10-16 18:23"
  - "PR #8, #9"
  - "commit 5b5b876"
code:
  - "src/Settings.jsx"
  - "src/shopSettings.js"
  - "src/qrPhoto.js"
  - "src/QrCode.jsx"
  - "netlify/lib/bills-api.mjs (parseSettings)"
last-verified: 2026-10-17
---

# D025 · Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:43 UTC

## Context and problem

The shop has more than one way to be paid, and business QR stickers don't show a
UPI ID.

## In the founder's words

> In the settings, I can add the UPI ID. I don't know if you can make a QR out of it. If not, I can have a picture button. My father will take a picture of the QR … because business QR codes don't have the UPI ID, there should be an option where I will give you the QR, and you will only add the QR, not the UPI ID.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:23

## Considered options

| Option | Outcome |
|---|---|
| UPI ID printed in shop.js | Replaced: the founder wanted it configurable. |
| Settings with UPI ID or photo | **Chosen.** |

## Decision

Settings (one `settings` row, shared by every phone) holds up to 20 payment QRs and a
default:
- **UPI ID**: the bill shows a QR for `upi://pay?pa=…&pn=…&am=<total>&cu=INR&tn=Bill N`, so the amount is filled in. The QR is drawn as SVG with the `qrcode` library.
- **QR photo**: `jsQR` reads the code (trying three sizes). If it is read, the exact text is kept (`type: "qr"`) and the QR is redrawn cleanly. If it can't be read, a compressed copy of the photo is kept (`type: "image"`, at most about 600 KB).

Each bill has a **Payment QR** dropdown at the end, and new bills get the default. The bill
shows "Scan to pay ₹X" and the UPI ID when one is known.

## Consequences

- A QR read from a business sticker is static, so the amount isn't pre-filled.
- UPI IDs are checked with a regex on both phone and server.

## Confirmation

- Test `UPI ID QR carries the amount; a scanned QR stays exactly as printed`.

## More information

- **Code:** `src/Settings.jsx`; `src/shopSettings.js`; `src/qrPhoto.js`; `src/QrCode.jsx`; `netlify/lib/bills-api.mjs (parseSettings)`
- **Evidence:** [chat 2026-10-16 18:23](../sources/founder-chat-2026-10-16.md) · PR [#8](https://github.com/anubhavb11/Billing/pull/8), [#9](https://github.com/anubhavb11/Billing/pull/9) · commit [`5b5b876`](https://github.com/anubhavb11/Billing/commit/5b5b876)
- **Related:** [D026 · Delivery people are set in Settings, picked per bill and printed on it](D026-delivery-people.md) · [D027 · A bill keeps a copy of its payment QR and delivery person; QR photos are looked up](D027-bill-keeps-a-snapshot.md)
