---
id: D046
title: "\"See bills\" shows every bill in a customer's group, not a phone search"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:24"
decision-makers: [agent]
area: [frontend, matching]
supersedes: []
superseded-by: []
related: [D040, D043]
evidence:
  - "found in testing 2026-10-17 07:23"
  - "PR #16, #17"
code:
  - "src/billsFilter.js (filters.customer)"
  - "src/App.js (showCustomerBills)"
  - "src/Bills.jsx (.bills-for banner)"
last-verified: 2026-10-17
---

# D046 · "See bills" shows every bill in a customer's group, not a phone search

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 07:24 UTC

## Context and problem

Testing found that See bills searched by phone and missed bills merged in from another
phone, address or name.

## Decision

See bills sets `filters.customer = { label, keys }`. All bills keeps a bill when its
`customerKey` is one of the group's keys, and shows "Bills of A-140 Madhu Vihar · Show all".

## Consequences

- The keys are a snapshot. A bill typed later with a brand-new variant only appears after a merge.

## Confirmation

- Test `bills of one customer, including merged-in phones and addresses`.

## More information

- **Code:** `src/billsFilter.js (filters.customer)`; `src/App.js (showCustomerBills)`; `src/Bills.jsx (.bills-for banner)`
- **Evidence:** found in testing 2026-10-17 07:23 · PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D040 · The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up](D040-inventory-from-bills-items-customers-tabs.md) · [D043 · A customer is identified by phone, else address, else name](D043-customer-identity-key.md)
