---
id: D032
title: "Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons"
type: decision
status: accepted
date: 2026-10-16
time-utc: "19:03"
decision-makers: [founder, agent]
area: [ux]
supersedes: [D002, D010]
superseded-by: []
related: [D031, D033, D036]
evidence:
  - "chat 2026-10-16 18:56"
  - "chat 2026-10-16 19:02"
  - "PR #10, #11"
code:
  - "src/App.css (:root colours)"
  - "src/Icons.jsx"
last-verified: 2026-10-17
---

# D032 · Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 19:03 UTC
> **Supersedes:** [D002](D002-father-first-minimal-change.md), [D010](D010-keep-fathers-buttons.md)

## Context and problem

Six differently coloured buttons on the bill screen confused the father.

## In the founder's words

> The bill page has a lot of color … it is a very confusing UX. Can you simplify the UX? Maybe sit with a UI/UX designer yourself … It should be a user-friendly UI and should be a bit bigger, even so it can be operated without specs.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:56, 2026-10-16 19:02

## Decision

- **One accent per screen**: orange (`--orange: #e25629`) for the main action. Other buttons are white and outlined. Green is only for WhatsApp and "Sent", red only for delete and errors.
- **Bigger**: larger text and 52px-tall buttons, so he can use it without glasses.
- **Icons**: list, pencil, send, settings, back, plus, chat, picture, bin, new bill.
- **Layout**: the top bar has the logo, Bill #N and save status, with **All bills** on the right. At the bottom, **New bill** (left) and **View & Send** (orange, right). Delete is a small text link.

## Consequences

- Supersedes the "don't redesign" part of D002 and the colours of D010. The bill table and how he types were not changed.

## More information

- **Code:** `src/App.css (:root colours)`; `src/Icons.jsx`
- **Evidence:** [chat 2026-10-16 18:56](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 19:02](../sources/founder-chat-2026-10-16.md) · PR [#10](https://github.com/anubhavb11/Billing/pull/10), [#11](https://github.com/anubhavb11/Billing/pull/11)
- **Related:** [D031 · Bills save themselves; no Save button](D031-auto-save.md) · [D033 · View & Send: the exact picture, then exactly two ways to send](D033-view-and-send-two-options.md) · [D036 · "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear](D036-details-bin-new-bill.md)
