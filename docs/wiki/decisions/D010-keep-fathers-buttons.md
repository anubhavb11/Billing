---
id: D010
title: "Keep the father's buttons and colours when replacing the Firebase version"
type: decision
status: superseded
date: 2026-10-16
time-utc: "17:23"
decision-makers: [agent]
area: [ux]
supersedes: []
superseded-by: [D031, D032, D033]
related: [D002]
evidence:
  - "chat 2026-10-16 17:16"
  - "commit 8924f47"
code:
last-verified: 2026-10-17
---

# D010 · Keep the father's buttons and colours when replacing the Firebase version

> **Status:** superseded · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 17:23 UTC
> **Superseded by:** [D031](D031-auto-save.md), [D032](D032-calm-bigger-ui.md), [D033](D033-view-and-send-two-options.md)

## Context and problem

After the first build, the founder said the father actually uses billingdev
(`main-dev`), not billingbansal. That version had its own buttons and an invoice screen.

## Considered options

| Option | Outcome |
|---|---|
| Keep main's plain buttons | Rejected: not what the father uses. |
| Keep main-dev's buttons and colours | **Chosen** at the time. |

## Decision

The new version kept main-dev's bill screen: yellow **+**, green **Save**, red
**Clear**, blue **View** (invoice with Take screenshot) and grey **Master View**.

## Consequences

- **Superseded on 16 Oct 19:14:** auto-save removed Save (D031), the calm UI replaced the colours (D032), and View & Send replaced View and Master View's send (D033).

## More information

- **Evidence:** [chat 2026-10-16 17:16](../sources/founder-chat-2026-10-16.md) · commit [`8924f47`](https://github.com/anubhavb11/Billing/commit/8924f47)
- **Related:** [D002 · Father first: mobile, one screen, change as little as possible](D002-father-first-minimal-change.md)
