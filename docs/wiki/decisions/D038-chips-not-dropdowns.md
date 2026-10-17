---
id: D038
title: "Suggestions are up to 3 small chips, never a dropdown"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:06"
decision-makers: [founder]
area: [ux]
supersedes: []
superseded-by: []
related: [D039, D044]
evidence:
  - "chat 2026-10-17 07:04"
  - "agent 2026-10-17 07:05 (one chip)"
  - "chat 2026-10-17 07:06"
  - "PR #16, #17"
code:
  - "src/Billing.jsx (focus, keepFocus, blurLater, pickItem, pickCustomer, fillKnownItem)"
  - "src/catalog.js (suggestItems, suggestCustomers, exactItem, MAX_CHIPS)"
last-verified: 2026-10-17
---

# D038 · Suggestions are up to 3 small chips, never a dropdown

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 07:06 UTC

## Context and problem

The agent proposed a single chip. The founder asked for two or three.

## In the founder's words

> He is going to use this app on his mobile, and I think having a dropdown and giving the suggestions constantly would be quite overwhelming. … Maybe instead of only one chip, we can show two or at most three chips that are relevant to it.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 07:04, 2026-10-17 07:06

## Considered options

| Option | Outcome |
|---|---|
| Dropdown list | Rejected: overwhelming on a phone. |
| One chip | Proposed; the founder asked for more. |
| Up to 3 chips | **Chosen.** |

## Decision

- Up to **3** pill chips appear under the box being typed in: after **2 letters** (or **3 digits** for a phone), ordered by best match, then most bills, then most recent. Hidden entries never appear.
- Tapping a chip doesn't take focus away from the box (`preventDefault` on pointer and mouse down). Chips disappear 200 ms after the box loses focus, so a tap still lands.
- **Item chip** ("चीनी · 1 kg · ₹48"): fills the name, plus details and rate only if they're empty, then jumps to Qty.
- **Customer chip** ("A 135 Madhu Vihar · Sharma · +91 98100…"): fills address, phone and name, then jumps to the first empty item row.
- Typing a known item in full and moving on fills its last rate and details if they're empty. What he typed is never overwritten.

## Consequences

- The rate offered is the **last rate used**. If prices change, he types over it. A "usual rate" was offered and declined (D045).

## Confirmation

- Tests `at most 3 suggestions, best match then most sold, hidden left out`, `a fully typed item is found by any of its spellings`.

## Revisit when

- The father ignores the chips, or taps the wrong one often.

## More information

- **Code:** `src/Billing.jsx (focus, keepFocus, blurLater, pickItem, pickCustomer, fillKnownItem)`; `src/catalog.js (suggestItems, suggestCustomers, exactItem, MAX_CHIPS)`
- **Evidence:** [chat 2026-10-17 07:04](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-17 07:05 (one chip)](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-17 07:06](../sources/founder-chat-2026-10-16.md) · PR [#16](https://github.com/anubhavb11/Billing/pull/16), [#17](https://github.com/anubhavb11/Billing/pull/17)
- **Related:** [D039 · The customer box asks for the address first](D039-address-first-customer-box.md) · [D044 · Fuzzy matching: normalise, then allow small typos, in one module shared by app and server](D044-fuzzy-matching-own-normaliser.md)
