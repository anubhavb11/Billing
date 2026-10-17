---
id: D002
title: "Father first: mobile, one screen, change as little as possible"
type: decision
status: partly superseded
date: 2026-10-16
time-utc: "16:38"
decision-makers: [founder]
area: [product, ux]
supersedes: []
superseded-by: [D032]
related: [D010, D011]
evidence:
  - "chat 2026-10-16 16:38"
code:
last-verified: 2026-10-17
---

# D002 · Father first: mobile, one screen, change as little as possible

> **Status:** partly superseded · **Decided by:** Founder · **When:** 16 Oct 2026, 16:38 UTC
> **Superseded by:** [D032](D032-calm-bigger-ui.md)

## Context and problem

The father (the shopkeeper) does all billing on his phone. He is used to the
existing table and buttons, and he needs to see everything he types without scrolling around.

## In the founder's words

> This app is very, very, very curated for my father to use. I know it's not very pretty-looking, but it is operational, and it is easy for him to work on. I just want you to improve the UI a bit. Don't change it too much because he usually uses it on his mobile, and he wants to see whatever he is typing on one screen.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 16:38

## Considered options

| Option | Outcome |
|---|---|
| Full UI revamp | Rejected at the time: "I know if I do a full UI revamp, it would be good, but it's not currently." |
| Small fit-and-finish fixes, new features beside the screen | **Chosen.** |

## Decision

Design every change for the father's phone first. Everything he types stays
visible on one screen. Improve the UI "a bit" rather than redesigning it.

## Consequences

- The first release kept the same table, columns, buttons and colours (D010, D011).
- **Superseded in part, the same evening:** the founder asked for a simpler, calmer UI (D032). The "don't redesign" part no longer holds. The mobile-first, one-screen, father-first part still governs everything.

## Confirmation

- At 360px wide, a full bill can be typed without scrolling sideways (see [testing](../operations/testing.md)).

## Revisit when

- The father's feedback says the layout itself is the problem. Ask the founder before any big layout change.

## More information

- **Evidence:** [chat 2026-10-16 16:38](../sources/founder-chat-2026-10-16.md)
- **Related:** [D010 · Keep the father's buttons and colours when replacing the Firebase version](D010-keep-fathers-buttons.md) · [D011 · Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad](D011-phone-fit-rules.md)
