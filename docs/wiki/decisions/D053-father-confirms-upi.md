---
id: D053
title: "UPI the delivery boy reports waits until the father confirms it"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:36"
decision-makers: [founder]
area: [payments]
supersedes: []
superseded-by: []
related: [D051, D052]
evidence:
  - "chat 2026-10-17 08:35 (delivery)"
  - "chat 2026-10-17 08:36 (delivery)"
code:
  - "src/tracking.mjs (upiToCheck)"
  - "src/TrackPanel.jsx"
last-verified: 2026-10-17
---

# D053 · UPI the delivery boy reports waits until the father confirms it

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:36 UTC

## Context and problem

A customer saying "I paid" isn't the money arriving.

## In the founder's words

> When the delivery boy taps "UPI done", is that enough, or does your father confirm it? → "Father confirms (Recommended)"
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:35, 2026-10-17 08:36

## Considered options

| Option | Outcome |
|---|---|
| Father confirms | **Chosen.** |
| Trust the boy's tap | Rejected: one less tap, but no check. |

## Decision

The boy's **UPI done** shows **UPI · check** (and counts in the **UPI to check** filter) until the
father taps **UPI ₹X received** after seeing it in his UPI app. UPI marked by the father himself
is confirmed at once.

## Confirmation

- Test `UPI reported by the boy waits for the father to check it`.

## More information

- **Code:** `src/tracking.mjs (upiToCheck)`; `src/TrackPanel.jsx`
- **Evidence:** [chat 2026-10-17 08:35](../sources/founder-chat-2026-10-17-delivery.md) · [chat 2026-10-17 08:36](../sources/founder-chat-2026-10-17-delivery.md)
- **Related:** [D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money](D051-track-delivery-and-money-on-every-bill.md) · [D052 · Cash a delivery boy collects stays "with him" until the father taps "Got it"](D052-cash-stays-with-delivery-boy-until-handover.md)
