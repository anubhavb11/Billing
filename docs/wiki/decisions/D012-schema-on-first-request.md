---
id: D012
title: "Create and migrate the database schema on the first request, additive only"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:53"
decision-makers: [agent]
area: [data, architecture]
supersedes: []
superseded-by: []
related: [D009, D013]
evidence:
  - "commit afa353f"
  - "PR #6 and #8 notes on additive columns"
code:
  - "netlify/lib/bills-api.mjs (SCHEMA, ensureSchema)"
last-verified: 2026-10-17
---

# D012 · Create and migrate the database schema on the first request, additive only

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:53 UTC

## Context and problem

The founder shouldn't have to run SQL by hand. Two sites running different
versions share one database (D009).

## Considered options

| Option | Outcome |
|---|---|
| Migration tool (Prisma, Drizzle, node-pg-migrate) | Rejected: too heavy for one table. |
| Run SQL by hand in the Neon console | Rejected: the founder shouldn't need to. |
| Idempotent DDL on first request | **Chosen.** |

## Decision

`ensureSchema` runs `create table if not exists` and `alter table … add column if not
exists` inside a transaction holding `pg_advisory_xact_lock(7243510)`, so two cold starts
can't race. It runs once per function instance and retries if it fails. Columns were added
this way over time: `status`, `sent_at`, `share_token` (D019, D021), `payment`, `delivery`
(D025–D027), and the tables `settings` and `catalog_rules`.

## Consequences

- Only additive changes are safe. Renaming or dropping a column, or changing a type, needs a planned two-step change because the older site may still be running old code.
- New tables appear on the first API request after a deploy (any route, even a customer opening a bill link).

## Confirmation

- `SCHEMA` only uses `create … if not exists` and `add column if not exists`.

## Revisit when

- A destructive schema change is needed: write a one-off migration plan and ship to both sites together.

## More information

- **Code:** `netlify/lib/bills-api.mjs (SCHEMA, ensureSchema)`
- **Evidence:** commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f) · PR [#6](https://github.com/anubhavb11/Billing/pull/6) and [#8](https://github.com/anubhavb11/Billing/pull/8) notes on additive columns
- **Related:** [D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father](D009-two-sites-one-database.md) · [D013 · Deleting a bill hides it; nothing is erased](D013-soft-delete.md)
