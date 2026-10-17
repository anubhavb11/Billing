---
id: D042
title: "The item and customer lists are rebuilt from all bills on each request"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:10"
decision-makers: [agent]
area: [architecture, performance]
supersedes: []
superseded-by: []
related: [D040, D041]
evidence:
  - "PR #16, #17"
code:
  - "netlify/lib/bills-api.mjs (catalogResponse)"
  - "src/catalog.js (cachedCatalog, cacheCatalog)"
  - "src/App.js (refreshCatalog)"
last-verified: 2026-10-17
---

# D042 · The item and customer lists are rebuilt from all bills on each request

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 07:10 UTC

## Context and problem

A shop makes tens of bills a day, so a few thousand bills a year.

## Considered options

| Option | Outcome |
|---|---|
| Maintain an items table on every save | Rejected for now: more code and migrations, little gain at this size. |
| Build on read | **Chosen.** |

## Decision

`GET /api/catalog` reads every non-deleted bill and builds the lists in memory.
`PUT /api/catalog/rules` saves rules and returns the rebuilt lists. The phone caches them in
`localStorage` (`shopCatalog`) and refreshes on unlock, when a tab opens and after **New
bill**. Suggestions work offline from the cache.

## Consequences

- Response time and size grow with the number of bills and distinct items or customers.

## Revisit when

- About 10,000 bills, or /api/catalog takes over a second: add an incremental table or a materialised view.

## More information

- **Code:** `netlify/lib/bills-api.mjs (catalogResponse)`; `src/catalog.js (cachedCatalog, cacheCatalog)`; `src/App.js (refreshCatalog)`
- **Evidence:** PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D040 · The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up](D040-inventory-from-bills-items-customers-tabs.md) · [D041 · Clean-ups are stored as rules; bills are never rewritten](D041-cleanup-as-rules-bills-never-change.md)
