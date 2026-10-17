---
id: D004
title: "Store bills in Neon Postgres; drop Firebase"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:43"
decision-makers: [founder]
area: [data, infrastructure]
supersedes: []
superseded-by: []
related: [D005, D008, D012]
evidence:
  - "chat 2026-10-16 16:41 (question)"
  - "chat 2026-10-16 16:43 (answer)"
code:
last-verified: 2026-10-17
---

# D004 · Store bills in Neon Postgres; drop Firebase

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 16:43 UTC

## Context and problem

The agent offered Firestore (recommended for its offline sync), Supabase
(Postgres) or phone-only storage. The founder preferred Postgres, named Neon, and said
Supabase would also be fine.

## In the founder's words

> For the database, I think we can deprecate Firebase, and maybe let's use Neon as a database. What do you think? … I recommended Neon. Maybe we can use Supabase. It's fine.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 16:41 (question), 2026-10-16 16:43 (answer)

## Considered options

| Option | Outcome |
|---|---|
| Firebase Firestore | Rejected by the founder ("deprecate Firebase"). Its advantage was saving with no signal. |
| Supabase | Acceptable, but D005 needs a server-side API and D008 needs separate billing, which Neon gives. |
| Phone only (localStorage) | Rejected: bills would be lost if the phone's data is cleared, and the founder couldn't see them. |
| Neon Postgres | **Chosen.** |

## Decision

Use Postgres on Neon. Bills are one table with the items as `jsonb`; shop settings
and clean-up rules are single-row `jsonb` tables.

## Consequences

- Saving needs internet. This is softened by keeping the bill on the phone (D017) and by auto-save retrying when the connection is back (D031).
- Real SQL means easy export or reporting later.

## Confirmation

- `netlify/lib/db.mjs` connects with `pg`; there is no other datastore in the code.

## Revisit when

- The shop often has no signal and the father loses work: consider an offline queue (IndexedDB) rather than switching databases.

## More information

- **Evidence:** [chat 2026-10-16 16:41 (question)](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 16:43 (answer)](../sources/founder-chat-2026-10-16.md)
- **Related:** [D005 · The browser talks only to Netlify Functions, never to the database](D005-api-through-netlify-functions.md) · [D008 · Use the founder's own free Neon project, not Netlify Database](D008-own-neon-not-netlify-database.md) · [D012 · Create and migrate the database schema on the first request, additive only](D012-schema-on-first-request.md)
