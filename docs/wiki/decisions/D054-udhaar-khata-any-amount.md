---
id: D054
title: "Udhaar is a khata per customer; any amount received clears the oldest bills first"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:36"
decision-makers: [founder]
area: [product, payments]
supersedes: []
superseded-by: []
related: [D037, D043, D051]
evidence:
  - "chat 2026-10-17 08:32 (delivery)"
  - "chat 2026-10-17 08:36 (delivery)"
code:
  - "src/tracking.mjs (khata)"
  - "src/CustomersPage.jsx (Khata)"
  - "netlify/lib/catalog.mjs"
  - "netlify/lib/bills-api.mjs (khataRoute, khata_payments)"
last-verified: 2026-10-17
---

# D054 · Udhaar is a khata per customer; any amount received clears the oldest bills first

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:36 UTC

## Context and problem

Udhaar was held on 17 Oct morning ([D037](D037-suggestions-before-other-ideas.md)); the founder now
named it part of the core pain.

## In the founder's words

> Some customers are going to take a lot of goods on credit and then come at the month end and do the hisaab, my father currently writes that in the book. … At the month-end hisaab, how do udhaar customers usually pay? → "Any amount (Recommended)"
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:32, 2026-10-17 08:36

## Considered options

| Option | Outcome |
|---|---|
| Any amount, oldest bills first | **Chosen.** |
| Whole bills only | Rejected: doesn't handle part payments. |

## Decision

A bill marked **Udhaar** goes on that customer's khata (customers grouped as in the
Customers tab, merges included). The Customers tab shows **Udhaar due ₹X** and lets the father
record **any amount** received, cash or UPI, at the hisaab. Payments are stored separately
(`khata_payments`) and clear the **oldest** udhaar bills first. Each bill shows "cleared" or
"₹70 left", and a wrong entry can be removed.

## Consequences

- Customer page shows "Added to your account (udhaar)" for such bills.
- If a merged customer is later separated, earlier khata payments stay with the key they were recorded under.

## Confirmation

- Test `khata: any amount clears the oldest bills first`.

## Revisit when

- The father wants a printable khata statement for the customer.

## More information

- **Code:** `src/tracking.mjs (khata)`; `src/CustomersPage.jsx (Khata)`; `netlify/lib/catalog.mjs`; `netlify/lib/bills-api.mjs (khataRoute, khata_payments)`
- **Evidence:** [chat 2026-10-17 08:32](../sources/founder-chat-2026-10-17-delivery.md) · [chat 2026-10-17 08:36](../sources/founder-chat-2026-10-17-delivery.md)
- **Related:** [D037 · Build item and customer suggestions first; the other three ideas were not picked](D037-suggestions-before-other-ideas.md) · [D043 · A customer is identified by phone, else address, else name](D043-customer-identity-key.md) · [D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money](D051-track-delivery-and-money-on-every-bill.md)
