---
id: D043
title: "A customer is identified by phone, else address, else name"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:10"
decision-makers: [agent]
area: [data, matching]
supersedes: []
superseded-by: []
related: [D039, D044, D046]
evidence:
  - "PR #16, #17"
code:
  - "src/normalize.mjs (customerKey)"
last-verified: 2026-10-17
---

# D043 · A customer is identified by phone, else address, else name

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 07:10 UTC

## Context and problem

Bills have free-typed name, phone and address. The Customers tab must group them.

## Decision

`customerKey` is `p:<last 10 digits>` when the phone has 6+ digits, else
`a:<addressKey>` (the normalised address, D044), else `n:<normalised name>`, else not a
customer. It lives in the shared `normalize.mjs` so the app and server group identically.

## Consequences

- One phone used at two addresses counts as one customer. Two phones at one address are two customers until merged.
- A phone typo creates a separate customer. Merge it in the tab.

## Confirmation

- Test `server groups A-135 and A135 as one address`.

## More information

- **Code:** `src/normalize.mjs (customerKey)`
- **Evidence:** PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D039 · The customer box asks for the address first](D039-address-first-customer-box.md) · [D044 · Fuzzy matching: normalise, then allow small typos, in one module shared by app and server](D044-fuzzy-matching-own-normaliser.md) · [D046 · "See bills" shows every bill in a customer's group, not a phone search](D046-see-bills-by-customer-group.md)
