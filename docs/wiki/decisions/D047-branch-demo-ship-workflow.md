---
id: D047
title: "Feature branch, demo on local, ship only on the founder's word"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:02"
decision-makers: [founder]
area: [process]
supersedes: []
superseded-by: []
related: [D009, D048]
evidence:
  - "chat 2026-10-16 17:02"
  - "chat 2026-10-16 17:48"
  - "chat 2026-10-16 19:14"
  - "PRs #2–#17"
code:
last-verified: 2026-10-17
---

# D047 · Feature branch, demo on local, ship only on the founder's word

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 17:02 UTC

## Context and problem

The founder reviews every change before the father sees it.

## In the founder's words

> Commit the changes to feature/saved-bills (don't push yet). … Can you show me it on my local? … Commit it, push and merge into both main and main-dev so bansalstore gets it too.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:02, 2026-10-16 17:48, 2026-10-16 19:14

## Decision

1. Branch `feature/<slug>` from `origin/main-dev` (the father's live code).
2. Build and test, then show it locally (dev server :3000 with API :8787, or a production build).
3. Only when the founder says so: commit, push, open PRs into `main` and `main-dev`, and merge with merge commits.
4. Check that both Netlify deploys are ready and serve the same build.

PR descriptions say what changed, what was tested and what wasn't.

## Consequences

- Two PRs per feature (one per branch) with the same commits.

## More information

- **Evidence:** [chat 2026-10-16 17:02](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:48](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 19:14](../sources/founder-chat-2026-10-16.md) · PRs [#2](https://github.com/anubhavb11/Billing/pull/2)–[#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father](D009-two-sites-one-database.md) · [D048 · The founder holds the secrets; agents work through the CLIs the founder authorised](D048-agent-access-and-secrets.md)
