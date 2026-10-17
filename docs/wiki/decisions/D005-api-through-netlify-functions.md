---
id: D005
title: "The browser talks only to Netlify Functions, never to the database"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:44"
decision-makers: [founder, agent]
area: [architecture, security]
supersedes: []
superseded-by: []
related: [D006, D014]
evidence:
  - "chat 2026-10-16 16:43 (question)"
  - "chat 2026-10-16 16:44 (answer)"
code:
  - "netlify/functions/bills.mjs"
  - "netlify/lib/bills-api.mjs"
  - "netlify/lib/db.mjs"
  - "src/api.js"
last-verified: 2026-10-17
---

# D005 · The browser talks only to Netlify Functions, never to the database

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 16:44 UTC

## Context and problem

With no user login (D006), a database reachable straight from the browser would be
open to anyone who had the link.

## Considered options

| Option | Outcome |
|---|---|
| Neon via Netlify Functions | **Chosen** (the agent's recommendation). |
| Supabase called directly from the browser | Rejected: no server code, but with no login the database would be open to anyone with the link. |

## Decision

All data goes through `/api/*` routes in one Netlify Function. The connection
string stays in Netlify's environment variables. The function uses a small `pg` pool (max 3
connections, 10 s connect timeout because Neon wakes from sleep).

## Consequences

- Every new route must also be added to `config.path` in `netlify/functions/bills.mjs`, or Netlify won't route it. This is easy to forget.
- Server-side validation (`parseBill`, `parseSettings`, `parseRules`) is the real guard on data shape.

## Confirmation

- `src/` contains no database client; `src/api.js` only calls `/api/*`.

## Revisit when

- Traffic grows beyond one shop (unlikely), or functions cold starts become a problem.

## More information

- **Code:** `netlify/functions/bills.mjs`; `netlify/lib/bills-api.mjs`; `netlify/lib/db.mjs`; `src/api.js`
- **Evidence:** [chat 2026-10-16 16:43 (question)](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 16:44 (answer)](../sources/founder-chat-2026-10-16.md)
- **Related:** [D006 · No user accounts; one shop PIN protects the API](D006-no-login-shop-pin.md) · [D014 · One API handler runs both on Netlify and on a local server](D014-one-api-handler-local-and-netlify.md)
