---
id: D027
title: "A bill keeps a copy of its payment QR and delivery person; QR photos are looked up"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:25"
decision-makers: [agent]
area: [data]
supersedes: []
superseded-by: []
related: [D025, D026]
evidence:
  - "commit 5b5b876"
code:
  - "src/shopSettings.js (paymentSnapshot, resolvePayment)"
  - "netlify/lib/bills-api.mjs (publicBill)"
last-verified: 2026-10-17
---

# D027 · A bill keeps a copy of its payment QR and delivery person; QR photos are looked up

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 18:25 UTC

## Context and problem

Settings change over time, but a bill already sent shouldn't change.

## Considered options

| Option | Outcome |
|---|---|
| Store only ids | Rejected: editing settings would rewrite old bills. |
| Copy everything | Rejected for photos: hundreds of KB per bill. |

## Decision

`bills.payment` and `bills.delivery` (jsonb) store a copy of the chosen entry. The
exception is QR **photos**: the bill stores only the id, and the photo is fetched from
settings when the bill is shown, to keep bill rows small.

## Consequences

- If a QR photo is deleted from Settings, it disappears from every bill that used it, including customer links.

## Confirmation

- Test `a QR photo is looked up in settings and dropped once removed`.

## More information

- **Code:** `src/shopSettings.js (paymentSnapshot, resolvePayment)`; `netlify/lib/bills-api.mjs (publicBill)`
- **Evidence:** commit [`5b5b876`](https://github.com/anubhavb11/Billing/commit/5b5b876)
- **Related:** [D025 · Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one](D025-payment-qr-in-settings.md) · [D026 · Delivery people are set in Settings, picked per bill and printed on it](D026-delivery-people.md)
