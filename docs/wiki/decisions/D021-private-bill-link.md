---
id: D021
title: "Every bill has a private link the customer can open without the PIN"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:00"
decision-makers: [founder, agent]
area: [product, security]
supersedes: []
superseded-by: []
related: [D006, D015, D024]
evidence:
  - "agent 2026-10-16 17:54 (plan, step 4)"
  - "chat 2026-10-16 18:00"
  - "PR #6, #7"
code:
  - "netlify/lib/bills-api.mjs (share_token, publicBill, toPublicBill)"
  - "src/PublicBill.jsx"
last-verified: 2026-10-17
---

# D021 · Every bill has a private link the customer can open without the PIN

> **Status:** accepted · **Decided by:** Founder, choosing the agent's proposal · **When:** 16 Oct 2026, 18:00 UTC

## Context and problem

The agent listed a bill link as a later step 4 ("more work, because the bill page has
to be viewable without the PIN"). The founder asked for it in the same round.

## In the founder's words

> do the  points 3 and 4 as well
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:00

## Considered options

| Option | Outcome |
|---|---|
| Send only pictures | Kept as an option, but a link lets the customer re-open the latest version. |
| Unguessable link per bill | **Chosen.** |

## Decision

Each bill gets a random `share_token` (16 hex characters from `gen_random_uuid()`,
unique). `/b/<token>` shows that one bill. `GET /api/public/bills/:token` needs no PIN and
returns only what the customer should see: no status, send time or token. Deleted bills
return "This bill link is not valid".

## Consequences

- Anyone the link is forwarded to can see that bill, including the customer's name, phone and address.
- A link can't be revoked except by deleting the bill. There is no expiry.

## Confirmation

- `/api/public/bills/<16 hex>` answers without a PIN; an unknown token returns 404 JSON.

## Revisit when

- Customers complain about privacy, or links get shared publicly: add revoke or expiry.

## More information

- **Code:** `netlify/lib/bills-api.mjs (share_token, publicBill, toPublicBill)`; `src/PublicBill.jsx`
- **Evidence:** [agent 2026-10-16 17:54 (plan, step 4)](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-16 18:00](../sources/founder-chat-2026-10-16.md) · PR [#6](https://github.com/anubhavb11/Billing/pull/6), [#7](https://github.com/anubhavb11/Billing/pull/7)
- **Related:** [D006 · No user accounts; one shop PIN protects the API](D006-no-login-shop-pin.md) · [D015 · Hash routes for the app; a real path for customer links](D015-hash-routing.md) · [D024 · The customer's page offers only Call shop, Save picture and Download PDF](D024-customer-page-three-actions.md)
