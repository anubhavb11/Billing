---
id: D019
title: "Bills are Drafts until sent; edited-after-sending and missing rates are flagged"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:54"
decision-makers: [founder, agent]
area: [product, data]
supersedes: []
superseded-by: []
related: [D020, D031, D033]
evidence:
  - "chat 2026-10-16 17:50"
  - "chat 2026-10-16 17:54"
  - "PR #6, #7"
  - "commit 1dcf911"
code:
  - "netlify/lib/bills-api.mjs (status, sent_at, POST /sent)"
  - "src/bill.js (changedSinceSent, missingRates)"
  - "src/StatusChips.jsx"
last-verified: 2026-10-17
---

# D019 · Bills are Drafts until sent; edited-after-sending and missing rates are flagged

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 17:54 UTC

## Context and problem

The father's real routine: start a bill, leave it unfinished (often without rates),
serve the next customer, come back later, finish it and send it.

## In the founder's words

> My father wants to make a bill, and then, let's say, the bill is not final and is a draft. He will just save it and then we go and make another customer bill. We should have an option to go into the master view, go to that old bill, edit that, add the rates and everything, and then send that bill to the customer.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:50, 2026-10-16 17:54

## Decision

Every bill starts as **Draft** (`status` defaults to `'draft'`). Using a send button
marks it **Sent** (`POST /api/bills/:n/sent` sets `sent_at`). A sent bill edited later shows
**Changed after sending** (`updated_at > sent_at`). Rows with an item but no qty or rate count
as **N rates missing**. Bills saved before this existed show as Drafts.

## Consequences

- "Sent" means a send button was used. It doesn't confirm that WhatsApp delivered it.
- With auto-save (D031) every bill with an item exists as a draft, including abandoned ones.

## Confirmation

- Tests `missing rates counts filled rows without qty or rate` and `a sent bill edited later is flagged`.

## Revisit when

- The father wants paid/due tracking; that is a separate status (D037).

## More information

- **Code:** `netlify/lib/bills-api.mjs (status, sent_at, POST /sent)`; `src/bill.js (changedSinceSent, missingRates)`; `src/StatusChips.jsx`
- **Evidence:** [chat 2026-10-16 17:50](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:54](../sources/founder-chat-2026-10-16.md) · PR [#6](https://github.com/anubhavb11/Billing/pull/6), [#7](https://github.com/anubhavb11/Billing/pull/7) · commit [`1dcf911`](https://github.com/anubhavb11/Billing/commit/1dcf911)
- **Related:** [D020 · All bills (Master View) is a list of cards that open the bill for editing](D020-all-bills-cards-with-edit.md) · [D031 · Bills save themselves; no Save button](D031-auto-save.md) · [D033 · View & Send: the exact picture, then exactly two ways to send](D033-view-and-send-two-options.md)
