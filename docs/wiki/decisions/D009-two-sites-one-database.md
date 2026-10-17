---
id: D009
title: "Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:27"
decision-makers: [founder]
area: [process, infrastructure]
supersedes: []
superseded-by: []
related: [D012, D029, D047]
evidence:
  - "chat 2026-10-16 17:16 (env:clone)"
  - "chat 2026-10-16 17:27"
  - "chat 2026-10-16 17:34"
  - "chat 2026-10-16 18:43"
code:
last-verified: 2026-10-17
---

# D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 17:27 UTC

## Context and problem

Two Netlify sites build from this repo: billingbansal (branch `main`) and the
father's site (branch `main-dev`, first billingdev.netlify.app, renamed to
bansalstore.netlify.app in D029).

## In the founder's words

> Copy DATABASE_URL and SHOP_PIN from billingdev to billingbansal with netlify env:clone … To main, we will check on the prod URL.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:16 (env:clone), 2026-10-16 17:27, 2026-10-16 17:34, 2026-10-16 18:43

## Considered options

| Option | Outcome |
|---|---|
| Separate databases per site | Not discussed: the founder asked to copy the same `DATABASE_URL` to both sites. |
| One shared database | **Chosen.** |

## Decision

Both sites use the **same** Neon database and the same `SHOP_PIN`. A change goes
to `main` first, the founder checks it on billingbansal (on their own phone), then it is
merged into `main-dev` for the father. From 16 Oct 19:14 the founder usually said "merge into
both main and main-dev" in one go.

## Consequences

- Bills, settings and clean-up rules made while testing on billingbansal show up on the father's phone.
- **The two sites can run different code against one database**, so schema changes must be additive and old code must keep working (D012). This is an [invariant](../knowledge/invariants.md).

## Confirmation

- After a ship, both sites report the same commit and serve the same `main.*.js` bundle.

## Revisit when

- Test data starts to confuse the father: give billingbansal its own Neon branch.

## More information

- **Evidence:** [chat 2026-10-16 17:16 (env:clone)](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:27](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:34](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 18:43](../sources/founder-chat-2026-10-16.md)
- **Related:** [D012 · Create and migrate the database schema on the first request, additive only](D012-schema-on-first-request.md) · [D029 · The father's site is bansalstore.netlify.app, with no redirect from the old name](D029-site-name-bansalstore.md) · [D047 · Feature branch, demo on local, ship only on the founder's word](D047-branch-demo-ship-workflow.md)
