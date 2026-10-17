---
id: D039
title: "The customer box asks for the address first"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:06"
decision-makers: [founder]
area: [ux, product]
supersedes: []
superseded-by: []
related: [D007, D043, D044]
evidence:
  - "chat 2026-10-17 07:06"
  - "PR #16, #17"
code:
  - "src/Billing.jsx (customer box)"
  - "src/App.css (.customer)"
last-verified: 2026-10-17
---

# D039 · The customer box asks for the address first

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 07:06 UTC

## Context and problem

In the neighbourhood, customers are known as "A-135" or by phone more than by name.

## In the founder's words

> I think the customer is more referred to by the address or the phone number rather than the customer name, so we can put the address above.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 07:06

## Decision

Order: **Address** (full width), then **Phone | Name** side by side. Chips work from all
three boxes.

## Consequences

- This made fuzzy address matching essential (D044).

## More information

- **Code:** `src/Billing.jsx (customer box)`; `src/App.css (.customer)`
- **Evidence:** [chat 2026-10-17 07:06](../sources/founder-chat-2026-10-16.md) · PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D007 · Each bill has a number, customer name, phone, address and date; no paid/due status](D007-bill-fields.md) · [D043 · A customer is identified by phone, else address, else name](D043-customer-identity-key.md) · [D044 · Fuzzy matching: normalise, then allow small typos, in one module shared by app and server](D044-fuzzy-matching-own-normaliser.md)
