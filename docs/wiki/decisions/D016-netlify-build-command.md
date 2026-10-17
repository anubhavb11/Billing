---
id: D016
title: "Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:14"
decision-makers: [agent]
area: [deployment, testing]
supersedes: []
superseded-by: []
related: [D028]
evidence:
  - "commit 1286c26"
  - "commit 5b5b876"
code:
  - "netlify.toml"
last-verified: 2026-10-17
---

# D016 · Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 17:14 UTC

## Context and problem

billingbansal already built with `CI= npm run build`. With `CI=true`, CRA treats lint
warnings as errors and a deploy can fail.

## Considered options

| Option | Outcome |
|---|---|
| CI=true on Netlify | Rejected: a lint warning would take the father's site down on deploy. |
| CI= on Netlify + strict local check | **Chosen.** |

## Decision

`netlify.toml` sets `CI= REACT_APP_SITE_URL=$URL npm run build` and overrides the
Netlify UI setting. `REACT_APP_SITE_URL` makes the link-preview image an absolute URL
(D028). Before every ship the agent runs `CI=true npm run build` locally, so warnings are
still caught.

## Consequences

- A warning can reach production if the local strict build is skipped.

## Confirmation

- `netlify.toml` build command starts with `CI=`; `CI=true npm run build` passes locally before each ship.

## More information

- **Code:** `netlify.toml`
- **Evidence:** commit [`1286c26`](https://github.com/anubhavb11/Billing/commit/1286c26) · commit [`5b5b876`](https://github.com/anubhavb11/Billing/commit/5b5b876)
- **Related:** [D028 · Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away](D028-bansal-store-branding.md)
