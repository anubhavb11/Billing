---
id: D029
title: "The father's site is bansalstore.netlify.app, with no redirect from the old name"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:47"
decision-makers: [founder]
area: [infrastructure, brand]
supersedes: []
superseded-by: []
related: [D009, D028]
evidence:
  - "chat 2026-10-16 18:45"
  - "chat 2026-10-16 18:47"
code:
last-verified: 2026-10-17
---

# D029 · The father's site is bansalstore.netlify.app, with no redirect from the old name

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:47 UTC

## Context and problem

`bansalstore.netlify.app` belonged to the founder's older inventory site. The agent offered `bansal-store` (free) or freeing `bansalstore`, plus
an optional forwarding site on the old name (about 15 credits).

## In the founder's words

> can we have bansalstore.netlify.app … Keep the old billingdev.netlify.app link working by forwarding it to the new address? → "Don't really care about old billings."
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:45, 2026-10-16 18:47

## Considered options

| Option | Outcome |
|---|---|
| bansal-store.netlify.app | Not chosen. |
| bansalstore.netlify.app | **Chosen.** |
| Forward billingdev to the new name | Declined by the founder. |

## Decision

The inventory site was renamed to `bansalstore-inventory.netlify.app`, and the
billing site (formerly billingdev, branch `main-dev`) was renamed to
`bansalstore.netlify.app`. No redirect was set up from billingdev.

## Consequences

- billingdev.netlify.app stopped working, including any bill links sent before the rename. The father's home-screen shortcut had to be added again for the new address (the agent's instructions said so; not confirmed in chat).
- billingbansal.netlify.app (branch `main`) remains the founder's checking site.

## More information

- **Evidence:** [chat 2026-10-16 18:45](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 18:47](../sources/founder-chat-2026-10-16.md)
- **Related:** [D009 · Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father](D009-two-sites-one-database.md) · [D028 · Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away](D028-bansal-store-branding.md)
