---
id: D015
title: "Hash routes for the app; a real path for customer links"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:53"
decision-makers: [agent]
area: [frontend, architecture]
supersedes: []
superseded-by: []
related: [D021]
evidence:
  - "commit afa353f"
  - "commit 1dcf911"
code:
  - "src/App.js (useHash, PAGES)"
  - "src/index.js"
  - "netlify.toml (/b/* redirect)"
last-verified: 2026-10-17
---

# D015 · Hash routes for the app; a real path for customer links

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:53 UTC

## Context and problem

The phone's back button must work, and the app is a static build.

## Considered options

| Option | Outcome |
|---|---|
| react-router | Not needed for six screens. |
| Hash routes | **Chosen.** |

## Decision

The app uses hash routes with no router library: `#/` (bill), `#/send` (View & Send;
`#/view` is an old alias), `#/bills`, `#/items`, `#/customers`, `#/settings`. The customer's
link is a clean path, `/b/<token>`. `index.js` picks `PublicBill` for that path, and
`netlify.toml` rewrites `/b/*` to `index.html`.

## Consequences

- Links inside the app look like `bansalstore.netlify.app/#/bills`.
- Filters on All bills are kept in memory, not in the URL.

## Confirmation

- `netlify.toml` has the `/b/*` → `/index.html` rewrite; `src/index.js` routes `/b/<token>` to `PublicBill`.

## Revisit when

- Screens multiply, or deep links into bills are needed.

## More information

- **Code:** `src/App.js (useHash, PAGES)`; `src/index.js`; `netlify.toml (/b/* redirect)`
- **Evidence:** commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f) · commit [`1dcf911`](https://github.com/anubhavb11/Billing/commit/1dcf911)
- **Related:** [D021 · Every bill has a private link the customer can open without the PIN](D021-private-bill-link.md)
