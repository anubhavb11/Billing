---
id: D026
title: "Delivery people are set in Settings, picked per bill and printed on it"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:43"
decision-makers: [founder]
area: [product]
supersedes: []
superseded-by: []
related: [D025, D027]
evidence:
  - "chat 2026-10-16 18:23"
  - "PR #8, #9"
code:
  - "src/Settings.jsx"
  - "src/InvoiceSheet.jsx"
last-verified: 2026-10-17
---

# D026 · Delivery people are set in Settings, picked per bill and printed on it

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:43 UTC

## Context and problem

Customers need to reach whoever is bringing their order.

## In the founder's words

> In the settings, there should also be one more option for the delivery boy, where I will add the delivery boy's name and mobile number. At the end of the bill, I will pick which delivery boy is going.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:23

## Decision

Settings holds up to 30 delivery people (name and mobile). Each bill has a **Delivery**
dropdown, and the bill shows "Delivery by Raju · 98…" with a tap-to-call number. The
WhatsApp text includes it too.

## More information

- **Code:** `src/Settings.jsx`; `src/InvoiceSheet.jsx`
- **Evidence:** [chat 2026-10-16 18:23](../sources/founder-chat-2026-10-16.md) · PR [#8](https://github.com/anubhavb11/Billing/pull/8), [#9](https://github.com/anubhavb11/Billing/pull/9)
- **Related:** [D025 · Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one](D025-payment-qr-in-settings.md) · [D027 · A bill keeps a copy of its payment QR and delivery person; QR photos are looked up](D027-bill-keeps-a-snapshot.md)
