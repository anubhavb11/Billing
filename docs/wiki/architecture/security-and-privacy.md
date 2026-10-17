---
type: architecture
title: Security and privacy
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../decisions/D006-no-login-shop-pin.md, ../decisions/D021-private-bill-link.md, ../decisions/D048-agent-access-and-secrets.md]
---

# Security and privacy

The founder chose **no logins** and **one shop PIN** ([D006](../decisions/D006-no-login-shop-pin.md)).
That is proportionate for a family shop, but it has limits every agent should know.

## What is protected, and how

| Asset | Protection |
|---|---|
| Database | Not reachable from browsers; only the Netlify Function holds `DATABASE_URL` ([D005](../decisions/D005-api-through-netlify-functions.md)) |
| All bills, settings, catalog | `X-Shop-Pin` must match `SHOP_PIN` (sha256 + `timingSafeEqual`) |
| One bill for its customer | Unguessable 16-hex `share_token` (about 60 random bits: one hex digit of a v4 UUID is fixed); public route returns only customer-facing fields ([D021](../decisions/D021-private-bill-link.md)) |
| Deleted bills | Hidden from every route, including public links ([D013](../decisions/D013-soft-delete.md)) |
| Input | Server-side validation and size limits on every write (`parseBill`, `parseSettings`, `parseRules`) |
| Responses | `Cache-Control: no-store` on every API response |

## Personal data held

Customer names, phone numbers and addresses (in `bills`), what they bought, delivery
people's names and phones, and UPI IDs or QR photos (in `settings`). Nothing is shared with
third parties except what the father sends on WhatsApp himself.

## Known weaknesses (accepted for now)

1. **Shared PIN**: anyone who knows it can read, change and delete everything. There are no
   per-person accounts and no audit trail.
2. **No limit on PIN guesses**: a 6-digit PIN could be brute-forced by someone determined.
   Fix: a counter in the database or a Netlify rate-limit rule ([backlog](../product/ideas-and-backlog.md)).
3. **PIN kept in `localStorage`** on the phone. Anyone holding the unlocked phone has access.
4. **Bill links don't expire** and can be forwarded. Whoever has one sees that bill's
   customer details.
5. **Old test data is mixed in with real data**: bills, settings and rules made while testing on billingbansal (deleted 17 Oct 2026, [D050](../decisions/D050-one-live-site-main-dev-only.md)) are in the father's database.

## If the PIN may have leaked

1. The founder sets a new `SHOP_PIN` on **both** sites (Netlify → Site configuration →
   Environment variables), then triggers a deploy, or waits for the next one, so functions
   pick it up.
2. Every phone gets a 401 and asks for the new PIN.
3. Check All bills for anything unexpected. Deleted bills can be restored in SQL
   ([runbook](../operations/runbook.md)).

## Rules for agents (the repo is public)

- Never type, print, log or commit `DATABASE_URL`, `SHOP_PIN` or any token. Name variables, never values ([D048](../decisions/D048-agent-access-and-secrets.md)).
- The local `.env` is git-ignored. Keep it that way, and don't quote it in chats, PRs or this wiki.
- No real customer data in tests, fixtures, screenshots or docs. Use made-up names (Sharma ji, Verma ji) and fake numbers.
- Don't enter credentials or create accounts for the founder. They sign in and approve CLI logins themselves.
- Sources added to the wiki must be scrubbed of tool output, secrets and private details first ([conventions](../conventions.md)).
