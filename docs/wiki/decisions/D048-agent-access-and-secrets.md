---
id: D048
title: "The founder holds the secrets; agents work through the CLIs the founder authorised"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:26"
decision-makers: [founder]
area: [process, security]
supersedes: []
superseded-by: []
related: [D006, D008]
evidence:
  - "chat 2026-10-16 17:06"
  - "chat 2026-10-16 17:13"
  - "chat 2026-10-16 17:25"
  - "chat 2026-10-16 17:27"
code:
last-verified: 2026-10-17
---

# D048 · The founder holds the secrets; agents work through the CLIs the founder authorised

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 17:26 UTC

## Context and problem

The repo belongs to `anubhavb11`. The agent's `gh` was signed in as `anubhav-stay`.

## In the founder's words

> I've invited anubhav-stay to anubhavb11/Billing. Accept the invite with gh, push feature/saved-bills and open the pull request into main-dev.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:06, 2026-10-16 17:13, 2026-10-16 17:25, 2026-10-16 17:27

## Decision

- The founder made `anubhav-stay` a collaborator with write access. Commits use the repo's configured author.
- The founder approved a Netlify CLI login for the `anubhavb11` account. Agents use it for site info, renames, `env:clone` and deploy status.
- **The founder creates the Neon project and types `DATABASE_URL` and `SHOP_PIN` themselves.** Agents never type, print or commit secrets. The local `.env` (test PIN, local database) is git-ignored.
- Auto-fix was turned on for PR #2.

## Consequences

- The repo is **public**: nothing secret or private goes into code, PRs or this wiki.

## More information

- **Evidence:** [chat 2026-10-16 17:06](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:13](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:25](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 17:27](../sources/founder-chat-2026-10-16.md)
- **Related:** [D006 · No user accounts; one shop PIN protects the API](D006-no-login-shop-pin.md) · [D008 · Use the founder's own free Neon project, not Netlify Database](D008-own-neon-not-netlify-database.md)
