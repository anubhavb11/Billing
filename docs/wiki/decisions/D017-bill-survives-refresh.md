---
id: D017
title: "The bill on screen lives on the phone until it is saved"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:53"
decision-makers: [agent]
area: [frontend, data]
supersedes: []
superseded-by: []
related: [D031]
evidence:
  - "commit afa353f"
code:
  - "src/bill.js (loadDraft, saveDraft, LEGACY_KEY)"
last-verified: 2026-10-17
---

# D017 · The bill on screen lives on the phone until it is saved

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:53 UTC

## Context and problem

Phones reload pages, and the old version kept the half-typed bill in the browser
under `userOrder`.

## Decision

Every change to the bill on screen is written to `localStorage` (`billDraft`). On load
it is restored. The old `userOrder` key (items only) is read once, so a bill the father was
typing in the old version carried over.

## Consequences

- Customer details typed without any item are only on the phone. Leaving that bill asks first ("What you typed here will be cleared").

## Confirmation

- Test `picks up a bill typed in the old version`; reloading mid-bill keeps the bill.

## More information

- **Code:** `src/bill.js (loadDraft, saveDraft, LEGACY_KEY)`
- **Evidence:** commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f)
- **Related:** [D031 · Bills save themselves; no Save button](D031-auto-save.md)
