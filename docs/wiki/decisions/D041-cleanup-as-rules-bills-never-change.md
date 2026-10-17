---
id: D041
title: "Clean-ups are stored as rules; bills are never rewritten"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:10"
decision-makers: [agent]
area: [data, architecture]
supersedes: []
superseded-by: []
related: [D040, D042, D043]
evidence:
  - "PR #16, #17"
code:
  - "netlify/lib/catalog.mjs (rules, follow, parseRules)"
  - "src/catalog.js (mergeItems, mergeAliases, separateSpelling, …)"
last-verified: 2026-10-17
---

# D041 · Clean-ups are stored as rules; bills are never rewritten

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 07:10 UTC

## Context and problem

Merging and renaming must be reversible, and a bill already sent to a customer must
stay exactly as it was.

## Considered options

| Option | Outcome |
|---|---|
| Rewrite item names inside old bills | Rejected: not reversible, and it changes bills customers already have. |
| Rules applied when reading | **Chosen.** |

## Decision

One `catalog_rules` row holds JSON:
- `itemAliases` `{ spelling → item }`, `itemNames` `{ item → name }`, `itemHidden` `[item]`
- `customerAliases` `{ key → key }`, `customerEdits` `{ key → {name, phone, address} }`, `customerHidden` `[key]`

The catalog applies them when it is built. A merge also repoints anything already merged
into the merged rows. Alias chains are followed for at most 20 hops. The server caps sizes
(2,000 entries, 200 characters).

## Consequences

- Editing a customer's address in the Customers tab changes suggestions, not old bills.
- Rules are shared by both sites (one database).

## Confirmation

- Test `merge keeps the most-sold name, and separate undoes one spelling`; bills in the database never change after a merge.

## More information

- **Code:** `netlify/lib/catalog.mjs (rules, follow, parseRules)`; `src/catalog.js (mergeItems, mergeAliases, separateSpelling, …)`
- **Evidence:** PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D040 · The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up](D040-inventory-from-bills-items-customers-tabs.md) · [D042 · The item and customer lists are rebuilt from all bills on each request](D042-catalog-built-on-read.md) · [D043 · A customer is identified by phone, else address, else name](D043-customer-identity-key.md)
