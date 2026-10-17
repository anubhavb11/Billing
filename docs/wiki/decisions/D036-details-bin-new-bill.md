---
id: D036
title: "\"Details\" heading, a bin icon, and \"New bill (saves as draft)\" instead of Clear"
type: decision
status: accepted
date: 2026-10-17
time-utc: "06:56"
decision-makers: [founder]
area: [ux, copy]
supersedes: []
superseded-by: []
related: [D031, D032]
evidence:
  - "chat 2026-10-17 06:56"
  - "PR #14, #15"
  - "commit 6928029"
code:
  - "src/Billing.jsx"
  - "src/Icons.jsx (TrashIcon, NewBillIcon)"
last-verified: 2026-10-17
---

# D036 · "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 06:56 UTC

## Context and problem

The father had started using the app ("My father is starting to use it"). The founder flagged three labels.

## In the founder's words

> The DESC. that is written on the top is kind of unprofessional. … instead of the cross icon, we can do something better … I'm fine with the cross, whatever you think is best. … Instead of "clear," it should be "new bill," and maybe we can, in brackets, say this will go in draft.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 06:56

## Decision

- "Desc." becomes **Details**. It fits the narrow column and covers what he writes (1 kg, 5 kg pack, brand). Row 1 shows light hints: "Sugar", "1 kg".
- The × becomes a **grey bin icon** (agent's choice, since × can read as "close").
- **Clear** becomes **New bill** with a second line: "saves as draft", or "kept in All bills" when the bill was already sent (calling a sent bill a draft would be wrong). Afterwards a message says "Bill #N saved as draft".

## More information

- **Code:** `src/Billing.jsx`; `src/Icons.jsx (TrashIcon, NewBillIcon)`
- **Evidence:** [chat 2026-10-17 06:56](../sources/founder-chat-2026-10-16.md) · PR [#14](https://github.com/anubhavb11/Billing/pull/14), [#15](https://github.com/anubhavb11/Billing/pull/15) · commit [`6928029`](https://github.com/anubhavb11/Billing/commit/6928029)
- **Related:** [D031 · Bills save themselves; no Save button](D031-auto-save.md) · [D032 · Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons](D032-calm-bigger-ui.md)
