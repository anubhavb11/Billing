---
id: D024
title: "The customer's page offers only Call shop, Save picture and Download PDF"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:23"
decision-makers: [founder]
area: [product, ux]
supersedes: []
superseded-by: []
related: [D021, D030]
evidence:
  - "chat 2026-10-16 18:23"
  - "PR #8, #9"
code:
  - "src/PublicBill.jsx"
  - "src/share.js (downloadPdf)"
last-verified: 2026-10-17
---

# D024 · The customer's page offers only Call shop, Save picture and Download PDF

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:23 UTC

## Context and problem

Customers open the link from WhatsApp on their phones.

## In the founder's words

> For the link that the customer is getting, where the bill opens, I only want the options to call the shop, save a picture, and maybe download the bill. You can label them and make the UI better for the customer.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:23

## Decision

`/b/<token>` shows the bill and three labelled buttons: **Call shop** (`tel:`), **Save
picture** (the same JPEG the father sends) and **Download PDF** (jsPDF with the picture
embedded as JPEG, about 120–200 KB instead of 2.7 MB). Phone numbers on the bill are
tap-to-call.

## Consequences

- jsPDF and html-to-image load only when needed.

## More information

- **Code:** `src/PublicBill.jsx`; `src/share.js (downloadPdf)`
- **Evidence:** [chat 2026-10-16 18:23](../sources/founder-chat-2026-10-16.md) · PR [#8](https://github.com/anubhavb11/Billing/pull/8), [#9](https://github.com/anubhavb11/Billing/pull/9)
- **Related:** [D021 · Every bill has a private link the customer can open without the PIN](D021-private-bill-link.md) · [D030 · The browser draws the bill picture with html-to-image; pictures are always checked on a production build](D030-bill-picture-html-to-image.md)
