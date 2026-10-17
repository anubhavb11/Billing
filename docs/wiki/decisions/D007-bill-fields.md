---
id: D007
title: "Each bill has a number, customer name, phone, address and date; no paid/due status"
type: decision
status: partly superseded
date: 2026-10-16
time-utc: "16:43"
decision-makers: [founder]
area: [data, product]
supersedes: []
superseded-by: [D051]
related: [D037, D039]
evidence:
  - "chat 2026-10-16 16:41 (question)"
  - "chat 2026-10-16 16:43 (answer)"
code:
  - "netlify/lib/bills-api.mjs (SCHEMA)"
last-verified: 2026-10-17
---

# D007 · Each bill has a number, customer name, phone, address and date; no paid/due status

> **Status:** partly superseded · **Decided by:** Founder · **When:** 16 Oct 2026, 16:43 UTC
> **Superseded by:** [D051](D051-track-delivery-and-money-on-every-bill.md)

## Context and problem

The agent offered extra fields: bill number, phone, address, and a Paid / Due status.

## In the founder's words

> What else should each bill have? → "Bill number,Customer phone,Customer address" (name and date/time are always saved).
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 16:41 (question), 2026-10-16 16:43 (answer)

## Considered options

| Option | Outcome |
|---|---|
| Bill number | **Chosen.** |
| Customer phone | **Chosen.** |
| Customer address | **Chosen.** |
| Paid / Due (credit) status | Not chosen. It came back as "Paid / Udhaar" among the agent's five ideas on 17 Oct, and the founder picked other ideas (D037). |

## Decision

Bills get a running number (`bill_no`, a Postgres identity column), customer name,
phone and address, and the date and time. Paid / Due was **not** chosen.

## Consequences

- The phone later drives the WhatsApp button (D033) and customer identity (D043).
- The address later becomes the main way customers are found (D039).
- Identity numbers can have gaps (a failed insert uses a number). That's fine for a shop.

## Confirmation

- The `bills` table in `SCHEMA` (`netlify/lib/bills-api.mjs`) has these columns and no paid/due column.

## Revisit when

- The father wants to track credit (udhaar) in the app.

## More information

- **Code:** `netlify/lib/bills-api.mjs (SCHEMA)`
- **Evidence:** [chat 2026-10-16 16:41 (question)](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 16:43 (answer)](../sources/founder-chat-2026-10-16.md)
- **Related:** [D037 · Build item and customer suggestions first; the other three ideas were not picked](D037-suggestions-before-other-ideas.md) · [D039 · The customer box asks for the address first](D039-address-first-customer-box.md)
