---
id: D003
title: "Host on Netlify"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:43"
decision-makers: [founder]
area: [infrastructure]
supersedes: []
superseded-by: []
related: [D005, D008, D009]
evidence:
  - "chat 2026-10-16 16:41 (question)"
  - "chat 2026-10-16 16:43 (answer)"
code:
last-verified: 2026-10-17
---

# D003 · Host on Netlify

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 16:43 UTC

## Context and problem

The agent asked where the app should live and offered Firebase Hosting
(recommended at the time), GitHub Pages (which only showed the README) and Vercel. Both
existing sites, billingbansal and billingdev, were already on Netlify and connected to the
GitHub repo.

## In the founder's words

> We are using Netlify for deploying, or maybe for production.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 16:41 (question), 2026-10-16 16:43 (answer)

## Considered options

| Option | Outcome |
|---|---|
| Firebase Hosting | Rejected: Firebase was being dropped. |
| GitHub Pages | Rejected: static only, no functions. |
| Vercel | Rejected: the founder already runs the sites on Netlify. |
| Netlify | **Chosen.** |

## Decision

Keep hosting on Netlify: static React build plus Netlify Functions for the API,
deployed from GitHub on every merge.

## Consequences

- The API is a Netlify Function (D005), and each pull request gets a Deploy Preview.
- The Netlify account is on the credit-based Free plan. When the credits run out, every site on the account goes offline, so the database lives elsewhere (D008).

## Confirmation

- `netlify.toml` exists, and both sites show the merge commit as their latest production deploy.

## Revisit when

- Netlify's pricing or limits change, or the account outgrows the free credits.

## More information

- **Evidence:** [chat 2026-10-16 16:41 (question)](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 16:43 (answer)](../sources/founder-chat-2026-10-16.md)
- **Related:** [D005 · The browser talks only to Netlify Functions, never to the database](D005-api-through-netlify-functions.md) · [D008 · Use the founder's own free Neon project, not Netlify Database](D008-own-neon-not-netlify-database.md) · [D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father](D009-two-sites-one-database.md)
