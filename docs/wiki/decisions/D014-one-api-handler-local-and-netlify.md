---
id: D014
title: "One API handler runs both on Netlify and on a local server"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:53"
decision-makers: [agent]
area: [architecture, testing]
supersedes: []
superseded-by: []
related: [D005]
evidence:
  - "commit afa353f"
code:
  - "netlify/lib/bills-api.mjs (createApi)"
  - "netlify/functions/bills.mjs"
  - "scripts/local-api.mjs"
  - "package.json (\"proxy\")"
last-verified: 2026-10-17
---

# D014 · One API handler runs both on Netlify and on a local server

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:53 UTC

## Context and problem

What is tested locally should be exactly the code Netlify runs.

## Considered options

| Option | Outcome |
|---|---|
| netlify dev only | Not used: it needs the Netlify login and emulates more than needed. |
| Shared handler + tiny local server | **Chosen.** |

## Decision

`createApi({ getPool, getPin })` takes a web `Request` and returns a `Response`. The
Netlify Function (Functions v2, routes in `config.path`) and `scripts/local-api.mjs` (Node
`http` on port 8787, `npm run api`) both wrap it. CRA's dev server proxies `/api` to 8787.
Local testing uses a local Postgres and a git-ignored `.env`.

## Consequences

- Adding a route means updating both the handler and `config.path`.
- The local server forwards only the `content-type` and `x-shop-pin` headers.

## Confirmation

- Every route listed in the header comment of `bills-api.mjs` is in `config.path` of `netlify/functions/bills.mjs`.

## More information

- **Code:** `netlify/lib/bills-api.mjs (createApi)`; `netlify/functions/bills.mjs`; `scripts/local-api.mjs`; `package.json ("proxy")`
- **Evidence:** commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f)
- **Related:** [D005 · The browser talks only to Netlify Functions, never to the database](D005-api-through-netlify-functions.md)
