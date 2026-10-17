---
id: D050
title: "One live site: bansalstore.netlify.app; ship with one PR into main-dev; billingbansal is deprecated"
type: decision
status: accepted
date: 2026-10-17
time-utc: "08:18"
decision-makers: [founder]
area: [process, infrastructure]
supersedes: [D009, D047]
superseded-by: []
related: [D029, D012, D016]
evidence:
  - "chat 2026-10-17 08:18 (follow-up)"
  - "chat 2026-10-17 08:23 (follow-up)"
  - "PR #18, #19 (the last two-PR ship)"
code:
  - "netlify.toml"
  - "docs/wiki/operations/release-process.md"
last-verified: 2026-10-17
---

# D050 · One live site: bansalstore.netlify.app; ship with one PR into main-dev; billingbansal is deprecated

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 08:18 UTC
> **Supersedes:** [D009](D009-two-sites-one-database.md), [D047](D047-branch-demo-ship-workflow.md)

## Context and problem

Since 16 Oct every change shipped as **two PRs**: one into `main` (billingbansal.netlify.app,
the check site from D009) and one into `main-dev` (bansalstore.netlify.app, the father's site).
Right after the wiki shipped that way (PR #18, #19), the founder said only bansalstore is used.

## In the founder's words

> We are only using this website. I don't know why we always do two merges, two pull requests. We need to deprecate or just don't use the old one anymore. This is the truth.
>
> — [founder chat](../sources/founder-chat-2026-10-17.md), 2026-10-17 08:18, 2026-10-17 08:23

## Considered options

| Option | Outcome |
|---|---|
| Keep two sites and two PRs | Rejected: "I don't know why we always do two merges, two pull requests." |
| One site, one PR into main-dev | **Chosen.** |

## Decision

- **bansalstore.netlify.app (branch `main-dev`) is the only live site and the source of truth.**
- Every change: branch from `origin/main-dev`, open **one PR into `main-dev`**, merge it, and check the bansalstore deploy.
- **No more PRs into `main`.** billingbansal.netlify.app (branch `main`) is deprecated and gets no new deploys. `main` stays at the wiki merge (`d115c81`) and goes stale.
- **billingbansal.netlify.app was deleted from Netlify** on 17 Oct 2026 at 08:23 UTC, at the founder's choice ("Delete the site", over removing its database access or leaving it).

## Consequences

- Half the PRs and production deploys: one deploy of about 15 Netlify credits per change, not two.
- No separate check site. Test on the local production build before merging (`npm run serve:build`); the founder checks bansalstore after the deploy. A PR's Netlify Deploy Preview is an option if a pre-merge check is ever needed.
- With billingbansal deleted, nothing but bansalstore holds `DATABASE_URL` and `SHOP_PIN`. Bill links sent from billingbansal no longer open.
- GitHub's default branch is still `main`. Fresh clones and `gh pr create` default to it, so always branch from `origin/main-dev` and pass `--base main-dev`, or have the founder switch the default branch.
- Schema changes stay additive anyway (D012): phones may run a cached older app for a while, and rollbacks republish old code.

## Confirmation

- `gh pr list --repo anubhavb11/Billing --base main --state open` is empty, and new PRs target `main-dev`.

## Revisit when

- The founder wants a pre-release check again: use a Deploy Preview of the PR rather than a second site.

## More information

- **Code:** `netlify.toml`; `docs/wiki/operations/release-process.md`
- **Evidence:** [chat 2026-10-17 08:18](../sources/founder-chat-2026-10-17.md) · [chat 2026-10-17 08:23](../sources/founder-chat-2026-10-17.md) · PR [#18](https://github.com/anubhavb11/Billing/pull/18), [#19](https://github.com/anubhavb11/Billing/pull/19) (the last two-PR ship)
- **Related:** [D029 · The father's site is bansalstore.netlify.app, with no redirect from the old name](D029-site-name-bansalstore.md) · [D012 · Create and migrate the database schema on the first request, additive only](D012-schema-on-first-request.md) · [D016 · Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping](D016-netlify-build-command.md)
