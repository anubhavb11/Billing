---
id: D056
title: "The customer's link shows a live map while the order is on the way"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:36"
decision-makers: [founder]
area: [product, maps, cost]
supersedes: []
superseded-by: []
related: [D021, D055, D058]
evidence:
  - "PR #22"
  - "chat 2026-10-17 08:32 (delivery)"
  - "agent 2026-10-17 08:35 (delivery plan)"
  - "chat 2026-10-17 08:36 (delivery)"
  - "web research 2026-10-17 08:33"
code:
  - "src/LiveMap.jsx"
  - "src/PublicBill.jsx (DeliveryStatus)"
  - "src/DeliveryApp.jsx (useShareLocation)"
  - "netlify/lib/bills-api.mjs (courier_locations)"
last-verified: 2026-10-17
---

# D056 · The customer's link shows a live map while the order is on the way

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:36 UTC

## Context and problem

The agent recommended status steps only. A web page can't track with the screen off;
constant updates would keep the free Neon database awake all shop hours (about 90 of its 100
monthly compute hours; if they run out, saving stops); and deliveries are within the colony.
The founder chose the live map anyway.

## In the founder's words

> We can show the delivery boy's location as well if there are any free maps or anything available online, so that the customer will be able to see where the delivery boy is right now. … What should the customer's bill link show about the delivery? → "Live map"
>
> — [founder chat](../sources/founder-chat-2026-10-17-delivery.md), 2026-10-17 08:32, 2026-10-17 08:36

## Considered options

| Option | Outcome |
|---|---|
| Status steps only | The agent's recommendation; not chosen. |
| Steps + one location when he leaves | Not chosen. |
| Live map | **Chosen by the founder.** |

## Decision

- **Sending:** while an order is **On the way** and Raju's page is open, his phone sends its location about every 20 s (`watchPosition`, and a screen wake lock while on the way). It's stored as one row per person (`courier_locations`).
- **Showing:** the customer's link shows the status steps. While on the way, it also shows a **Leaflet** map with free **OpenStreetMap** tiles (credited) and "Raju was here just now". The map refreshes every 20 s only while the page is on screen, and disappears once delivered or if the location is older than 3 minutes.
- **Loading:** the map code loads only when it is needed.

## Consequences

- **Stops when his screen locks** (web limitation); the customer then sees the last point for up to 3 minutes.
- Uses database hours only during deliveries; watch Neon's usage page in the first weeks.
- OSM tiles are free for light use under OSM's tile policy; heavy use would need another tile provider.

## Confirmation

- On a bill that is on the way, `/api/public/bills/<token>` includes `courier` only while the location is under 3 minutes old; after delivery it doesn't.

## Revisit when

- Neon usage climbs toward 100 hours a month, or OSM tiles are throttled.

## More information

- **Code:** `src/LiveMap.jsx`; `src/PublicBill.jsx (DeliveryStatus)`; `src/DeliveryApp.jsx (useShareLocation)`; `netlify/lib/bills-api.mjs (courier_locations)`
- **Evidence:** PR [#22](https://github.com/anubhavb11/Billing/pull/22) · [chat 2026-10-17 08:32](../sources/founder-chat-2026-10-17-delivery.md) · [agent 2026-10-17 08:35 (delivery plan)](../sources/agent-proposals-2026-10-17-delivery.md) · [chat 2026-10-17 08:36](../sources/founder-chat-2026-10-17-delivery.md) · [web research 2026-10-17 08:33](../sources/research.md)
- **Related:** [D021 · Every bill has a private link the customer can open without the PIN](D021-private-bill-link.md) · [D055 · Delivery boys use /d with their mobile number and their own PIN, and see only their orders](D055-delivery-boy-page-own-pin.md) · [D058 · Live updates refresh only while a page is on screen, and only when needed](D058-refresh-only-while-on-screen.md)
