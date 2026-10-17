---
id: D013
title: "Deleting a bill hides it; nothing is erased"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:53"
decision-makers: [agent]
area: [data]
supersedes: []
superseded-by: []
related: [D012]
evidence:
  - "commit afa353f"
  - "PR #2"
code:
  - "netlify/lib/bills-api.mjs (DELETE sets deleted_at)"
last-verified: 2026-10-17
---

# D013 · Deleting a bill hides it; nothing is erased

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:53 UTC

## Context and problem

A mistaken delete on a phone shouldn't lose a customer's bill.

## Considered options

| Option | Outcome |
|---|---|
| Hard delete | Rejected: can't be undone. |
| Soft delete | **Chosen.** |

## Decision

`DELETE /api/bills/:n` sets `deleted_at`. Lists, the catalog and customer links all
ignore deleted bills. Bill numbers are never reused.

## Consequences

- A bill can be restored in SQL (`update bills set deleted_at = null where bill_no = N`).
- Starting numbering again from 1 needs `truncate bills restart identity`, which erases everything. Only do that before real use.

## Confirmation

- The `DELETE` branch in `bills-api.mjs` runs `update … set deleted_at = now()`.

## Revisit when

- Someone wants a Trash view in the app.

## More information

- **Code:** `netlify/lib/bills-api.mjs (DELETE sets deleted_at)`
- **Evidence:** commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f) · PR [#2](https://github.com/anubhavb11/Billing/pull/2)
- **Related:** [D012 · Create and migrate the database schema on the first request, additive only](D012-schema-on-first-request.md)
