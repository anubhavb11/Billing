---
id: D018
title: "Long item names wrap downward instead of scrolling sideways"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:48"
decision-makers: [founder]
area: [ux]
supersedes: []
superseded-by: []
related: [D011, D036]
evidence:
  - "chat 2026-10-16 17:48"
  - "PR #4, #5"
  - "commit 6cea273"
code:
  - "src/Billing.jsx (auto-growing textareas)"
last-verified: 2026-10-17
---

# D018 · Long item names wrap downward instead of scrolling sideways

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 17:48 UTC

## Context and problem

Hindi item names are long and ran off the right edge of the narrow Item box. The
founder also asked for a description column after Item; the existing "Desc." column already
was that.

## In the founder's words

> If I write अरहर दाल तूर and it is on the phone, it will go towards the right, and I would only be able to see error. He doesn't need to scroll right, and it should go below.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:48

## Decision

Item and Description are one-line text areas that grow taller as the text wraps.
Qty, Rate and Amount stay top-aligned. Enter still moves to the next box, and pasted line
breaks become spaces.

## Consequences

- Rows can be different heights.

## Confirmation

- Typing अरहर दाल तूर at 360px wraps inside the Item box.

## More information

- **Code:** `src/Billing.jsx (auto-growing textareas)`
- **Evidence:** [chat 2026-10-16 17:48](../sources/founder-chat-2026-10-16.md) · PR [#4](https://github.com/anubhavb11/Billing/pull/4), [#5](https://github.com/anubhavb11/Billing/pull/5) · commit [`6cea273`](https://github.com/anubhavb11/Billing/commit/6cea273)
- **Related:** [D011 · Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad](D011-phone-fit-rules.md) · [D036 · "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear](D036-details-bin-new-bill.md)
