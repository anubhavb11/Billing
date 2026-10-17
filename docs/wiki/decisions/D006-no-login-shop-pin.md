---
id: D006
title: "No user accounts; one shop PIN protects the API"
type: decision
status: partly superseded
date: 2026-10-16
time-utc: "16:44"
decision-makers: [founder]
area: [security, ux]
supersedes: []
superseded-by: [D055]
related: [D005, D021, D048]
evidence:
  - "chat 2026-10-16 16:43 (\"No login\")"
  - "chat 2026-10-16 16:44 (\"Add a shop PIN\")"
code:
  - "netlify/lib/bills-api.mjs (pinMatches)"
  - "src/api.js (getPin, pin-required event)"
  - "src/PinScreen.jsx"
last-verified: 2026-10-17
---

# D006 · No user accounts; one shop PIN protects the API

> **Status:** partly superseded · **Decided by:** Founder · **When:** 16 Oct 2026, 16:44 UTC
> **Superseded by:** [D055](D055-delivery-boy-page-own-pin.md)

## Context and problem

The agent recommended Google sign-in. The founder chose no login. The agent then
warned that with no login anyone with the link could read, change and delete every bill,
including customers' phones and addresses, and offered a shop PIN. The founder accepted.

## In the founder's words

> How should he sign in? → "No login". Protect the bills with a one-time shop PIN? → "Add a shop PIN (Recommended)".
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 16:43 ("No login"), 2026-10-16 16:44 ("Add a shop PIN")

## Considered options

| Option | Outcome |
|---|---|
| Google sign-in | Rejected by the founder: no login. |
| Email + password | Rejected: no login. |
| No login and no PIN | Rejected: anyone with the link could see or delete every bill. |
| No login + shop PIN | **Chosen.** |

## Decision

One shared secret, `SHOP_PIN`, set as a Netlify environment variable. The phone asks
for it once and keeps it in `localStorage`. Every request sends it in the `X-Shop-Pin` header.
The server compares sha256 hashes with `timingSafeEqual`. A 401 clears the stored PIN and
shows the PIN screen again. `GET /api/ping` checks a PIN. Customer bill links are the only
routes without a PIN (D021).

## Consequences

- Anyone who knows the PIN has full access. There are no per-person accounts and no audit trail.
- There is no rate limit on PIN guesses. A 6+ digit PIN is the only defence (see [security](../architecture/security-and-privacy.md)).
- Changing the PIN means updating `SHOP_PIN` on both Netlify sites. Every phone is then asked for the new one.

## Confirmation

- `curl -s -o /dev/null -w '%{http_code}' https://bansalstore.netlify.app/api/bills` prints `401`.

## Revisit when

- More people (staff) use the app, a PIN may have leaked, or bills ever hold payment data.

## More information

- **Code:** `netlify/lib/bills-api.mjs (pinMatches)`; `src/api.js (getPin, pin-required event)`; `src/PinScreen.jsx`
- **Evidence:** [chat 2026-10-16 16:43 ("No login")](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 16:44 ("Add a shop PIN")](../sources/founder-chat-2026-10-16.md)
- **Related:** [D005 · The browser talks only to Netlify Functions, never to the database](D005-api-through-netlify-functions.md) · [D021 · Every bill has a private link the customer can open without the PIN](D021-private-bill-link.md) · [D048 · The founder holds the secrets; agents work through the CLIs the founder authorised](D048-agent-access-and-secrets.md)
