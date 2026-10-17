---
id: D044
title: "Fuzzy matching: normalise, then allow small typos, in one module shared by app and server"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:18"
decision-makers: [agent]
area: [matching, architecture]
supersedes: []
superseded-by: []
related: [D038, D039, D043]
evidence:
  - "chat 2026-10-17 07:16"
  - "web research 2026-10-17 07:17 (see sources/research.md)"
  - "PR #16, #17"
code:
  - "src/normalize.mjs"
  - "src/catalog.test.js"
last-verified: 2026-10-17
---

# D044 · Fuzzy matching: normalise, then allow small typos, in one module shared by app and server

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 17 Oct 2026, 07:18 UTC

## Context and problem

Addresses are typed differently every time ("A-135", "A135", "a 135", "Madhu Vihar Ln
no. 8"). The founder asked for fuzzy matching and for research on existing solutions (the
*what*, 07:16); the agent chose the method (the *how*) and it shipped with the founder's OK at
07:26.

## In the founder's words

> You need to do more fuzzy matching in the address. Most likely, the second time, instead of A A, he might type A135 once, or maybe A-135. … Maybe search on the internet. There might be this thing that must have been already solved by someone.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 07:16

## Considered options

| Option | Outcome |
|---|---|
| Fuse.js / fuzzysort | Rejected: they rank fuzzy substrings but don't normalise addresses (A-135 vs A135, short forms), and the server needs the exact same normalisation for grouping. |
| libpostal | Rejected: a C library with heavy data files and no practical JS or serverless binding. |
| indian-address-matcher (Python) | Rejected: Python only. |
| Own normaliser + Levenshtein, shared | **Chosen.** No dependency, works with Hindi, about 100 lines. |

## Decision

The agent found that the standard approach (libpostal's normalise-then-match, and
Indian address matchers such as HyperVerge's) is to **clean the text the same way every
time, then compare with a small typo allowance**. It wrote that as a tiny module,
`src/normalize.mjs`, used by both the chips and the server's customer grouping. Full detail
is in [matching and catalog](../architecture/matching-and-catalog.md).

## Consequences

- Known gaps (see the deep-dive): a block letter `H` is dropped as "house"; `st` always becomes "street"; Hindi short forms aren't expanded, and transliteration (चीनी vs cheeni) isn't matched.

## Confirmation

- `describe('addresses typed different ways')` in `src/catalog.test.js` (A-135, A135, a 135, typos, other house numbers).

## Revisit when

- The father reports missed or wrong matches. Add the case to `src/catalog.test.js` first, then change the rules.

## More information

- **Code:** `src/normalize.mjs`; `src/catalog.test.js`
- **Evidence:** [chat 2026-10-17 07:16](../sources/founder-chat-2026-10-16.md) · [web research 2026-10-17 07:17](../sources/research.md) · PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D038 · Suggestions are up to 3 small chips, never a dropdown](D038-chips-not-dropdowns.md) · [D039 · The customer box asks for the address first](D039-address-first-customer-box.md) · [D043 · A customer is identified by phone, else address, else name](D043-customer-identity-key.md)
