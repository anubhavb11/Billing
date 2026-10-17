---
id: D020
title: "All bills (Master View) is a list of cards that open the bill for editing"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:54"
decision-makers: [founder]
area: [ux, product]
supersedes: []
superseded-by: []
related: [D019, D032, D046]
evidence:
  - "chat 2026-10-16 17:50"
  - "agent 2026-10-16 17:54 (plan)"
  - "PR #6, #7"
code:
  - "src/Bills.jsx"
  - "src/billsFilter.js"
last-verified: 2026-10-17
---

# D020 · All bills (Master View) is a list of cards that open the bill for editing

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 17:54 UTC

## Context and problem

The old Master View only opened a bill's invoice. Editing an old bill was possible but
hidden: Master View → tap the bill → View → ← Bill → change it → Save (agent, 17:54).

## In the founder's words

> In the master view, we should be able to edit the bill. … make the master view more user-friendly and more usable. Everything is mobile-first. He is only going to use this app on mobile, so we need to give as much context on that screen.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:50

## Decision

Each bill is a card showing the customer, total, bill number, a friendly time
("Today, 10:42 am"), phone, the first items ("अरहर दाल तूर, Mustard oil +2 more") and status
chips, with **Edit** and **View & Send** buttons. At the top: All / Drafts / Sent with counts,
search (name, phone digits, item, or `#12` for a bill number), date ranges and sort. A
summary line above the list shows the count and total of what is shown, for example today's
sales.

## Consequences

- Renamed **All bills** in the calm UI (D032). The Items and Customers tabs joined it later (D040).

## More information

- **Code:** `src/Bills.jsx`; `src/billsFilter.js`
- **Evidence:** [chat 2026-10-16 17:50](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-16 17:54 (plan)](../sources/agent-proposals-2026-10-16.md) · PR [#6](https://github.com/anubhavb11/Billing/pull/6), [#7](https://github.com/anubhavb11/Billing/pull/7)
- **Related:** [D019 · Bills are Drafts until sent; edited-after-sending and missing rates are flagged](D019-draft-and-sent-status.md) · [D032 · Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons](D032-calm-bigger-ui.md) · [D046 · "See bills" shows every bill in a customer's group, not a phone search](D046-see-bills-by-customer-group.md)
