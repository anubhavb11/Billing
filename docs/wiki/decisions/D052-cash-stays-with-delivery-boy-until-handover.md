---
id: D052
title: "Cash a delivery boy collects stays \"with him\" until the father taps \"Got it\""
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:36"
decision-makers: [founder, agent]
area: [product, payments]
supersedes: []
superseded-by: []
related: [D051, D055]
evidence:
  - "chat 2026-10-17 08:32 (delivery)"
  - "agent 2026-10-17 08:35 (delivery plan)"
  - "chat 2026-10-17 08:36 (delivery)"
code:
  - "src/tracking.mjs (paymentState, cashWithPeople)"
  - "src/Bills.jsx (money-banner)"
  - "netlify/lib/bills-api.mjs (handoverRoute)"
last-verified: 2026-10-17
---

# D052 · Cash a delivery boy collects stays "with him" until the father taps "Got it"

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 17 Oct 2026, 08:36 UTC

## Context and problem

Cash changes hands twice: customer → delivery boy → shop. The loss happens at the second step.

## In the founder's words

> The main pain point is mostly what sometimes happens: the worker got the cash and came back to the shop. We were busy, and he didn't hand over the cash there. There is no essential tracking right now, and with this app, we can have that kind of tracking.
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:32, 2026-10-17 08:36

## Considered options

| Option | Outcome |
|---|---|
| Trust the boy to hand it over | The current problem. |
| Per-person cash in hand + one-tap handover | **Chosen** (the agent's design, accepted with "Both together"). |

## Decision

When the delivery boy marks **Cash** (with the amount he got), the bill shows **Cash with
Raju**. All bills shows a banner per person, "Raju has ₹1,240 cash · from 3 deliveries · Got it".
One tap on **Got it** (or "Got ₹470 from Raju" on a bill) records `handedOverAt` on every one of
his open cash bills. Cash the **father** marks himself counts as already in the shop.

## Consequences

- The amount is what the boy typed (pre-filled with the bill total), so short or rounded cash shows up.
- "Got it" settles all his open cash at once. A mistaken handover can be undone only in SQL for now.

## Confirmation

- Test `cash stays with the delivery boy until the father gets it` and `cash with each delivery person adds up`.

## Revisit when

- Partial handovers become common: let the father type the amount received.

## More information

- **Code:** `src/tracking.mjs (paymentState, cashWithPeople)`; `src/Bills.jsx (money-banner)`; `netlify/lib/bills-api.mjs (handoverRoute)`
- **Evidence:** [chat 2026-10-17 08:32](../sources/founder-chat-2026-10-17-delivery.md) · [agent 2026-10-17 08:35 (delivery plan)](../sources/agent-proposals-2026-10-17-delivery.md) · [chat 2026-10-17 08:36](../sources/founder-chat-2026-10-17-delivery.md)
- **Related:** [D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money](D051-track-delivery-and-money-on-every-bill.md) · [D055 · Delivery boys use /d with their mobile number and their own PIN, and see only their orders](D055-delivery-boy-page-own-pin.md)
