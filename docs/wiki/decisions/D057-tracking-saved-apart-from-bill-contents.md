---
id: D057
title: "Delivery and payment status are saved apart from the bill's contents"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:45"
decision-makers: [agent]
area: [architecture, data]
supersedes: []
superseded-by: []
related: [D031, D041, D051]
evidence:
  - "PR (delivery and payments)"
code:
  - "netlify/lib/bills-api.mjs (applyTracking, POST /api/bills/:n/track)"
  - "src/App.js (onTrack)"
last-verified: 2026-10-17
---

# D057 · Delivery and payment status are saved apart from the bill's contents

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 08:45 UTC

## Context and problem

Auto-save PUTs the whole bill every second while the father types ([D031](D031-auto-save.md)), and the delivery boy
changes status from another phone at the same time.

## Considered options

| Option | Outcome |
|---|---|
| Store status inside the bill PUT | Rejected: auto-save would overwrite the boy's changes. |

## Decision

Status lives in two new columns, `delivery_events` (jsonb) and `payment_status` (jsonb).
These are changed only by `POST /api/bills/:n/track` (shop) and `POST /api/delivery/orders/:n/step`
(delivery person), which read the row fresh and apply one change (`applyTracking`). The bill PUT
never touches them, so auto-save can't undo a delivery boy's tap. Status changes don't move
`updated_at`, so they don't count as "Changed after sending".

## Consequences

- The father's open bill shows the boy's latest tap after a reload or his next status tap.

## Confirmation

- The bill PUT's `update` statement doesn't set `delivery_events` or `payment_status`.

## More information

- **Code:** `netlify/lib/bills-api.mjs (applyTracking, POST /api/bills/:n/track)`; `src/App.js (onTrack)`
- **Evidence:** PR (delivery and payments)
- **Related:** [D031 · Bills save themselves; no Save button](D031-auto-save.md) · [D041 · Clean-ups are stored as rules; bills are never rewritten](D041-cleanup-as-rules-bills-never-change.md) · [D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money](D051-track-delivery-and-money-on-every-bill.md)
