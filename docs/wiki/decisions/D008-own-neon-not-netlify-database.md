---
id: D008
title: "Use the founder's own free Neon project, not Netlify Database"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:13"
decision-makers: [founder, agent]
area: [infrastructure, cost]
supersedes: []
superseded-by: []
related: [D003, D004, D009]
evidence:
  - "chat 2026-10-16 17:13"
  - "agent 2026-10-16 17:11 (finding, with Netlify and Neon docs)"
  - "web research 2026-10-16 17:08"
code:
  - "netlify/lib/db.mjs (NETLIFY_DATABASE_URL || DATABASE_URL)"
last-verified: 2026-10-17
---

# D008 · Use the founder's own free Neon project, not Netlify Database

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 17:13 UTC

## Context and problem

Netlify's CLI can attach a Neon database ("Netlify Database"). When the agent checked
on 16 Oct 2026, the account was on Netlify's **credit-based Free plan**: 300 credits a month
with a hard stop. When the credits run out, *every* site on the account shows "Site not
available" until the next month. Netlify Database is paid from the same credits, about
10 credits per hour while it is awake, so a shop open all day could take the billing site
down within days. A free Neon account is billed separately: about 100 compute-hours a month
per project, and it sleeps after 5 idle minutes. If it ever runs out, only saving stops.

## In the founder's words

> Yes, use my own free Neon account. I'll create the project and add DATABASE_URL and SHOP_PIN in Netlify, then tell you.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 17:13

## Considered options

| Option | Outcome |
|---|---|
| Netlify Database (built into the CLI) | Rejected: it draws from the same credits that keep the sites online. |
| Founder's own free Neon project | **Chosen.** |

## Decision

The founder created their own Neon project and set `DATABASE_URL` and `SHOP_PIN` in
Netlify themselves. The agent recommended an AWS US East region (to sit near Netlify Functions)
and Neon's **pooled** connection string; the chat doesn't confirm which region or string was
used. The code also accepts `NETLIFY_DATABASE_URL` in case Netlify Database is used later.

## Consequences

- Production deploys also cost credits (about 15 each, as read on 16 Oct 2026), so ship in sensible batches.
- The first request after Neon sleeps can take a few seconds.

## Confirmation

- `netlify env:list` (names only) shows `DATABASE_URL` and `SHOP_PIN` on both sites.

## Revisit when

- Netlify or Neon change their free plans: re-check the limits; the numbers above were read on 16 Oct 2026.

## More information

- **Code:** `netlify/lib/db.mjs (NETLIFY_DATABASE_URL || DATABASE_URL)`
- **Evidence:** [chat 2026-10-16 17:13](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-16 17:11 (finding, with Netlify and Neon docs)](../sources/agent-proposals-2026-10-16.md) · [web research 2026-10-16 17:08](../sources/research.md)
- **Related:** [D003 · Host on Netlify](D003-host-on-netlify.md) · [D004 · Store bills in Neon Postgres; drop Firebase](D004-neon-postgres.md) · [D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father](D009-two-sites-one-database.md)
