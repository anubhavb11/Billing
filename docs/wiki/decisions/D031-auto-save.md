---
id: D031
title: "Bills save themselves; no Save button"
type: decision
status: accepted
date: 2026-10-16
time-utc: "19:03"
decision-makers: [founder]
area: [ux, frontend, data]
supersedes: [D010]
superseded-by: []
related: [D017, D019, D036]
evidence:
  - "chat 2026-10-16 19:02"
  - "PR #10, #11"
  - "commit 8e62b57"
code:
  - "src/App.js (saveNow, AUTOSAVE_DELAY, needsSave)"
last-verified: 2026-10-17
---

# D031 · Bills save themselves; no Save button

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 19:03 UTC
> **Supersedes:** [D010](D010-keep-fathers-buttons.md)

## Context and problem

The founder found the Clear, Send, View and Master View buttons "too overwhelming" and
asked how the father would add all his bills: with auto-save, and the bill number shown at the
top.

## In the founder's words

> When my father lands, how will he add all of the bills? There should be auto save. At the top, it should show which bill number you are making.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 19:02

## Considered options

| Option | Outcome |
|---|---|
| Keep a Save button | Rejected by the founder. |
| Auto-save | **Chosen.** |

## Decision

- A save runs **1 second** after typing stops. A bill is only saved once it has at least one item, and it gets its number then. The top bar shows **Bill #N** with a status line under it: "Saving…", "Saved · made Today, 10:42 am", "Not saved yet · no internet" or "Not saved · will try again".
- **Only one save runs at a time.** A new bill's number is recorded straight away, so the next save updates it instead of creating a second bill.
- A `key` per bill on screen stops a slow save from overwriting a bill the father has since switched to. A `rev` counter makes sure anything typed during a save is saved next.
- Failed saves retry when the phone comes back online.

## Consequences

- Every bill with an item lands in All bills as a draft, including abandoned ones, which must be deleted by hand.
- Testing showed exactly one bill per typing session (no duplicates).

## Confirmation

- Type one item and wait a second: the top bar shows "Bill #N" with "Saved · made …", and exactly one new bill appears in All bills.

## More information

- **Code:** `src/App.js (saveNow, AUTOSAVE_DELAY, needsSave)`
- **Evidence:** [chat 2026-10-16 19:02](../sources/founder-chat-2026-10-16.md) · PR [#10](https://github.com/anubhavb11/Billing/pull/10), [#11](https://github.com/anubhavb11/Billing/pull/11) · commit [`8e62b57`](https://github.com/anubhavb11/Billing/commit/8e62b57)
- **Related:** [D017 · The bill on screen lives on the phone until it is saved](D017-bill-survives-refresh.md) · [D019 · Bills are Drafts until sent; edited-after-sending and missing rates are flagged](D019-draft-and-sent-status.md) · [D036 · "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear](D036-details-bin-new-bill.md)
