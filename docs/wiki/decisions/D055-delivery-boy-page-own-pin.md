---
id: D055
title: "Delivery boys use /d with their mobile number and their own PIN, and see only their orders"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:36"
decision-makers: [founder]
area: [product, security]
supersedes: [D006]
superseded-by: []
related: [D026, D051, D052, D056]
evidence:
  - "PR #22"
  - "chat 2026-10-17 08:32 (delivery)"
  - "chat 2026-10-17 08:36 (delivery)"
code:
  - "src/DeliveryApp.jsx"
  - "src/Settings.jsx"
  - "netlify/lib/bills-api.mjs (deliveryRoute, personPinHash)"
  - "netlify.toml (/d)"
last-verified: 2026-10-17
---

# D055 · Delivery boys use /d with their mobile number and their own PIN, and see only their orders

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:36 UTC
> **Supersedes:** [D006](D006-no-login-shop-pin.md)

## Context and problem

Until now one shop PIN opened everything ([D006](D006-no-login-shop-pin.md)), and the father read the items
out to the worker.

## In the founder's words

> In the settings, we add their number and name. With the same number and a PIN we provide them, they can log in there. There, once in the app, we can assign an order to the boy, and then the boy can see the order assigned to him. … he can see the item so that we don't have to tell him the item manually. … he can click on "packed" and "going for delivery."
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:32, 2026-10-17 08:36

## Considered options

| Option | Outcome |
|---|---|
| Shared shop PIN for the boys too | Rejected: they'd see everything. |
| Own PIN per person, own page | **Chosen.** |

## Decision

- **Login:** the shop sets a 4–6 digit **PIN per delivery person** in Settings, next to their mobile number. It's stored only as a salted hash and never sent back. They open `bansalstore.netlify.app/d` and log in once with mobile number + PIN (`X-Delivery-Phone`, `X-Delivery-Pin`).
- **Assigning** is the existing **Delivery** dropdown at the end of the bill. No new step.
- **The page** shows only orders assigned to that person: still open, plus delivered in the last 12 hours. Each shows the address, a Call button, the items as a tick list (ticks stay on his phone), and the total. There are no rates.
- **Buttons:** **Packed → On the way → Delivered**, then "पैसे कैसे मिले?": Cash (amount) / UPI done / UPI later / Udhaar. Labels are Hindi + English.
- **What the server allows:** a delivery person can't see other bills, settings or customers, and can't clear a payment.

## Consequences

- Partly supersedes [D006](D006-no-login-shop-pin.md): the shop PIN is still the owner's key; delivery people have their own, limited ones.
- No rate limit on PIN guesses here either (as for the shop PIN).
- His page refreshes every 30 s while open (D058), so a new assignment shows within about 30 s.

## Confirmation

- With a wrong PIN, `GET /api/delivery/orders` returns 401; with the right one it lists only that person's orders, without rates.

## Revisit when

- Push notifications for new orders are wanted (needs a service worker).

## More information

- **Code:** `src/DeliveryApp.jsx`; `src/Settings.jsx`; `netlify/lib/bills-api.mjs (deliveryRoute, personPinHash)`; `netlify.toml (/d)`
- **Evidence:** PR [#22](https://github.com/anubhavb11/Billing/pull/22) · [chat 2026-10-17 08:32](../sources/founder-chat-2026-10-17-delivery.md) · [chat 2026-10-17 08:36](../sources/founder-chat-2026-10-17-delivery.md)
- **Related:** [D026 · Delivery people are set in Settings, picked per bill and printed on it](D026-delivery-people.md) · [D051 · Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money](D051-track-delivery-and-money-on-every-bill.md) · [D052 · Cash a delivery boy collects stays "with him" until the father taps "Got it"](D052-cash-stays-with-delivery-boy-until-handover.md) · [D056 · The customer's link shows a live map while the order is on the way](D056-live-map-while-on-the-way.md)
