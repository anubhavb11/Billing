---
id: D051
title: "Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:32"
decision-makers: [founder]
area: [product, data]
supersedes: [D007]
superseded-by: []
related: [D019, D052, D053, D054, D057]
evidence:
  - "PR #22"
  - "chat 2026-10-17 08:32 (delivery)"
  - "agent 2026-10-17 08:35 (delivery plan)"
code:
  - "src/tracking.mjs"
  - "src/TrackPanel.jsx"
  - "netlify/lib/bills-api.mjs (delivery_events, payment_status, applyTracking)"
last-verified: 2026-10-17
---

# D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:32 UTC
> **Supersedes:** [D007](D007-bill-fields.md)

## Context and problem

The father types the order, sends the bill, calls out the items for the worker to pick, adds
rates later (some need the MRP checked) and sends the boy to deliver. The customer then pays
cash, pays by UPI, says "UPI later", or takes it on udhaar (khata, settled at month end).
There was no record of which, so money got lost: "the worker got the cash and came back to the
shop. We were busy, and he didn't hand over the cash there."

## In the founder's words

> The main pain point of this business is payment collection from the worker, or knowing what happened with that customer. … with every bill, we can have tracking. … Let's say my father is very busy and he made a bill out of his hand. We should still have an option in the app … where did this payment go, and what happened to the delivery? … I really want it to be simple.
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:32

## Considered options

| Option | Outcome |
|---|---|
| Keep tracking in the father's notebook | Rejected: the pain point. |
| Paid / Due switch only | Too little: it can't say who holds the cash. |
| Delivery + payment status per bill | **Chosen.** |

## Decision

Each bill gets two small statuses, kept apart from its contents (D057):
- **Delivery:** With <person> (when picked in the Delivery dropdown) → Packed → On the way → Delivered, each with its time.
- **Payment:** Cash · UPI · UPI later · Udhaar, with the amount, who marked it, and when.

The father can set both from the bill screen with one tap each, so it works even when the
delivery boy's page isn't used. All bills shows the statuses on every card and adds filters:
**To collect** (delivered but unpaid, or UPI later), **UPI to check** and **Udhaar**.

## Consequences

- Replaces the 16 Oct choice of no paid/due status ([D007](D007-bill-fields.md)).
- Old bills have no status; delivered-but-unpaid only counts bills marked delivered.

## Confirmation

- Tests in `src/tracking.test.js`: delivery steps, to collect, udhaar.

## Revisit when

- The father finds the chips too many: hide the Payment row until a bill is delivered.

## More information

- **Code:** `src/tracking.mjs`; `src/TrackPanel.jsx`; `netlify/lib/bills-api.mjs (delivery_events, payment_status, applyTracking)`
- **Evidence:** PR [#22](https://github.com/anubhavb11/Billing/pull/22) · [chat 2026-10-17 08:32](../sources/founder-chat-2026-10-17-delivery.md) · [agent 2026-10-17 08:35 (delivery plan)](../sources/agent-proposals-2026-10-17-delivery.md)
- **Related:** [D019 · Bills are Drafts until sent; edited-after-sending and missing rates are flagged](D019-draft-and-sent-status.md) · [D052 · Cash a delivery boy collects stays "with him" until the father taps "Got it"](D052-cash-stays-with-delivery-boy-until-handover.md) · [D053 · UPI the delivery boy reports waits until the father confirms it](D053-father-confirms-upi.md) · [D054 · Udhaar is a khata per customer; any amount received clears the oldest bills first](D054-udhaar-khata-any-amount.md) · [D057 · Delivery and payment status are saved apart from the bill's contents](D057-tracking-saved-apart-from-bill-contents.md)
