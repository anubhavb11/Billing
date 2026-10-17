---
id: D022
title: "A clean, printed-style bill design shared by the screen, the picture and the customer page"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:00"
decision-makers: [founder, agent]
area: [ux, brand]
supersedes: []
superseded-by: []
related: [D028, D030]
evidence:
  - "chat 2026-10-16 17:50 (\"make the bill more beautiful\")"
  - "agent 2026-10-16 17:54 (plan, step 3)"
  - "chat 2026-10-16 18:00"
  - "PR #6, #7"
code:
  - "src/InvoiceSheet.jsx"
  - "src/shop.js"
last-verified: 2026-10-17
---

# D022 · A clean, printed-style bill design shared by the screen, the picture and the customer page

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 18:00 UTC

## Context and problem

The founder asked for a more beautiful bill, prioritised by the agent as step 3.

## Decision

One component, `InvoiceSheet`, draws the bill everywhere: the shop header (Bansal
Store, A-135 Madhu Vihar Lane no - 8, Ph. 7678642241, from `src/shop.js`), bill number and
date on the right, a "Bill to" block, each item with its details underneath, an orange
total bar, the payment QR and delivery person when chosen, and a "धन्यवाद / Thank you"
footer.

## Consequences

- What the father previews is exactly what the customer gets (D030, D033).

## More information

- **Code:** `src/InvoiceSheet.jsx`; `src/shop.js`
- **Evidence:** [chat 2026-10-16 17:50 ("make the bill more beautiful")](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-16 17:54 (plan, step 3)](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-16 18:00](../sources/founder-chat-2026-10-16.md) · PR [#6](https://github.com/anubhavb11/Billing/pull/6), [#7](https://github.com/anubhavb11/Billing/pull/7)
- **Related:** [D028 · Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away](D028-bansal-store-branding.md) · [D030 · The browser draws the bill picture with html-to-image; pictures are always checked on a production build](D030-bill-picture-html-to-image.md)
