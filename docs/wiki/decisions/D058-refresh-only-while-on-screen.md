---
id: D058
title: "Live updates refresh only while a page is on screen, and only when needed"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:45"
decision-makers: [agent]
area: [architecture, cost]
supersedes: []
superseded-by: []
related: [D008, D055, D056]
evidence:
  - "web research 2026-10-17 08:33"
code:
  - "src/DeliveryApp.jsx (REFRESH_MS, LOCATION_EVERY_MS)"
  - "src/PublicBill.jsx (LIVE_EVERY_MS)"
last-verified: 2026-10-17
---

# D058 · Live updates refresh only while a page is on screen, and only when needed

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 08:45 UTC

## Context and problem

Netlify Functions can't push updates, and every request costs Netlify credits (2 per 10,000
requests plus compute) and keeps the free Neon database awake.

## Considered options

| Option | Outcome |
|---|---|
| WebSockets / push | Not available on plain Netlify Functions; would need another service. |
| Poll always | Rejected: keeps the database awake all day. |
| Poll only while visible and needed | **Chosen.** |

## Decision

Polling with limits:
- the delivery page refreshes its orders every **30 s** only while it is on screen **and** has open orders;
- his location goes out every **20 s** only while an order is on the way and the page is open;
- the customer's page refreshes every **20 s** only while that order is on the way and the page is on screen;
- everything else loads once, or on opening and returning to the page.

## Consequences

- Updates can lag up to 30 s.
- A 10-hour day with the page open is about 36,000 requests a month, roughly 15–20 Netlify credits.

## Confirmation

- Constants `REFRESH_MS` (30 s), `LOCATION_EVERY_MS` (20 s), `LIVE_EVERY_MS` (20 s) and their visibility checks.

## Revisit when

- Credits or Neon hours run low.

## More information

- **Code:** `src/DeliveryApp.jsx (REFRESH_MS, LOCATION_EVERY_MS)`; `src/PublicBill.jsx (LIVE_EVERY_MS)`
- **Evidence:** [web research 2026-10-17 08:33](../sources/research.md)
- **Related:** [D008 · Use the founder's own free Neon project, not Netlify Database](D008-own-neon-not-netlify-database.md) · [D055 · Delivery boys use /d with their mobile number and their own PIN, and see only their orders](D055-delivery-boy-page-own-pin.md) · [D056 · The customer's link shows a live map while the order is on the way](D056-live-map-while-on-the-way.md)
