---
id: D035
title: "Two empty rows appear when he types in the last row"
type: decision
status: accepted
date: 2026-10-16
time-utc: "19:26"
decision-makers: [founder]
area: [ux]
supersedes: []
superseded-by: []
related: [D036]
evidence:
  - "chat 2026-10-16 19:26"
  - "PR #12, #13"
  - "commit e00a927"
code:
  - "src/bill.js (withSpareRows, MIN_ROWS = 5, SPARE_ROWS = 2)"
last-verified: 2026-10-17
---

# D035 · Two empty rows appear when he types in the last row

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 19:26 UTC

## Context and problem

A new bill starts with 5 rows, and he had to tap "+ Add item" mid-bill.

## In the founder's words

> Whenever my father is typing and is on, let's say, the fifth item, which is the last item no you automatically add two rows to the bottom (so he doesn't need to click on Add Item every time).
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 19:26

## Decision

As soon as the last row has anything in it, two empty rows are added. Enter from the
last box moves into them. A reopened bill with every row filled also gets two spare rows.
Empty rows are never saved or shown on the bill. "+ Add item" stays just in case.

## Confirmation

- Tests `typing in the last row adds two empty rows below it`, `a reopened bill with every row filled gets spare rows`.

## More information

- **Code:** `src/bill.js (withSpareRows, MIN_ROWS = 5, SPARE_ROWS = 2)`
- **Evidence:** [chat 2026-10-16 19:26](../sources/founder-chat-2026-10-16.md) · PR [#12](https://github.com/anubhavb11/Billing/pull/12), [#13](https://github.com/anubhavb11/Billing/pull/13) · commit [`e00a927`](https://github.com/anubhavb11/Billing/commit/e00a927)
- **Related:** [D036 · "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear](D036-details-bin-new-bill.md)
