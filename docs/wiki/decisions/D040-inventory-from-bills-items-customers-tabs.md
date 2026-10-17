---
id: D040
title: "The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:08"
decision-makers: [founder]
area: [product, data]
supersedes: []
superseded-by: []
related: [D041, D042, D045, D046]
evidence:
  - "chat 2026-10-17 07:04"
  - "agent 2026-10-17 07:05 (Items page, not stock)"
  - "chat 2026-10-17 07:06"
  - "agent 2026-10-17 07:07 (design)"
  - "PR #16, #17"
code:
  - "src/ItemsPage.jsx"
  - "src/CustomersPage.jsx"
  - "src/App.js (DATA_TABS)"
  - "netlify/lib/catalog.mjs (buildCatalog)"
last-verified: 2026-10-17
---

# D040 · The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 07:08 UTC

## Context and problem

Suggestions are only as good as the names behind them, and the father mistypes (चीनी,
चिनी, Sugar for the same thing).

## In the founder's words

> As he makes the bills, we will make the inventory. In the inventory, there are things like when he will mistype the spelling or something, and we can combine them on a weekly basis. He can sit on a computer and do it. … We can have one more screen or maybe one more tab … There, we will be merging the database, cleaning the database, and making it better for the future.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 07:04, 2026-10-17 07:06

## Considered options

| Option | Outcome |
|---|---|
| A separate "Shop data" screen | Proposed at 07:07; shipped as tabs next to Bills instead. |
| Stock tracking | Out of scope: needs purchase entry. |

## Decision

Two tabs beside **Bills** (`#/items`, `#/customers`), designed for a weekly clean-up on a
computer:
- **Items**: every item from the bills, with usual details, last rate, number of bills, last sold, and "Also typed as". Tick rows and **Merge** (keeps the most-sold name), **Rename**, **Hide from suggestions**, **Separate** a merged spelling.
- **Customers**: grouped by phone, else address, else name, with address, phone, name, bills, total spent and last bill. **Merge**, **edit** address/phone/name, **Hide**, **See bills**, **Separate**.

This is a list of what he sells and at what rate. **It is not stock counting**, which would need
purchases entered too.

## Consequences

- The tabs work on a phone too, but merging is meant for a computer.

## Revisit when

- The father wants stock levels: that needs purchase entry and is a new feature.

## More information

- **Code:** `src/ItemsPage.jsx`; `src/CustomersPage.jsx`; `src/App.js (DATA_TABS)`; `netlify/lib/catalog.mjs (buildCatalog)`
- **Evidence:** [chat 2026-10-17 07:04](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-17 07:05 (Items page, not stock)](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-17 07:06](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-17 07:07 (design)](../sources/agent-proposals-2026-10-16.md) · PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D041 · Clean-ups are stored as rules; bills are never rewritten](D041-cleanup-as-rules-bills-never-change.md) · [D042 · The item and customer lists are rebuilt from all bills on each request](D042-catalog-built-on-read.md) · [D045 · No extras in the first suggestions build](D045-no-extras-in-first-build.md) · [D046 · "See bills" shows every bill in a customer's group, not a phone search](D046-see-bills-by-customer-group.md)
