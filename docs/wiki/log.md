---
type: log
title: Log
updated: 2026-10-17
---

# Log

Append-only and oldest first. Every entry starts `## [YYYY-MM-DD HH:MM] kind | title` (UTC),
so this lists the latest:

```bash
grep "^## \[" docs/wiki/log.md | tail -10
```

Kinds: `build` (work done), `ship` (merged and deployed), `decision`, `incident` (something
broke or nearly did), `ingest` / `query` / `lint` (wiki upkeep). Link decisions as Dnnn and
lessons as Ln.

## [2022-07-02 00:00] build | First version: a billing table

Create React App. Rows for item, description, qty, rate and amount, kept in the browser
(`userOrder`). Live on billingbansal.netlify.app (branch `main`, published 4 Jul 2022).

## [2022-07-16 00:00] build | Invoice view, screenshot sharing, Firebase prototype

"Customer view" invoice with the Bansal Store header, html2canvas **Take screenshot** and
share, and a Firebase prototype with a Master View (PR #1, `main-dev-firebase` → `main-dev`).
Live on billingdev.netlify.app (published 10 Sep 2022, last commit "reverse order"). This is
what the father used until October 2026, by which time its Firebase database was off.

## [2026-10-16 16:34] build | Repo cloned and run locally

Plain CRA front end, no backend. Ran on :3000 and the line maths worked.

## [2026-10-16 16:38] decision | The founder's brief: father first; save bills; an all-bills page

"Very, very, very curated for my father … Don't change it too much." Also persistent bills and
a list with sort and filters. → [D002](decisions/D002-father-first-minimal-change.md).
The agent found Rate and Amount cut off at 375px, three bugs, and a dead Firebase prototype → [D001](decisions/D001-build-on-the-2022-app.md).

## [2026-10-16 16:44] decision | Netlify, Neon, Netlify Functions, no login + shop PIN, bill fields

Two rounds of questions. The founder chose Netlify, Neon ("deprecate Firebase"), no login,
then accepted the API-through-functions and shop PIN recommendations, and picked bill number,
phone and address. → [D003](decisions/D003-host-on-netlify.md), [D004](decisions/D004-neon-postgres.md), [D005](decisions/D005-api-through-netlify-functions.md), [D006](decisions/D006-no-login-shop-pin.md), [D007](decisions/D007-bill-fields.md).

## [2026-10-16 17:00] build | Saved bills, phone fit and All Bills built on feature/saved-bills

Local Postgres, shared API handler, schema on first request, soft delete, hash routes, bill
kept on the phone, 10 unit tests. The total was not pinned to the bottom (Android keyboard).
→ [D011](decisions/D011-phone-fit-rules.md)–[D017](decisions/D017-bill-survives-refresh.md). Committed as `afa353f` at 17:02 ("don't push yet").

## [2026-10-16 17:11] decision | Own free Neon instead of Netlify Database

The Netlify account is on the credit-based Free plan with a hard stop. Netlify Database would
eat the credits that keep the sites up. The founder: "Yes, use my own free Neon account."
→ [D008](decisions/D008-own-neon-not-netlify-database.md), research [R1](sources/research.md#r1-netlify-database-vs-own-neon).

## [2026-10-16 17:16] incident | The agent had assumed the wrong site was the father's

The founder set the env vars on billingdev, and the agent had assumed billingbansal was the
father's site. The founder then said the father uses billingdev. The vars were cloned with `netlify env:clone`, and the rebuild kept main-dev's
buttons. → [D010](decisions/D010-keep-fathers-buttons.md), lessons L10 and L15.

## [2026-10-16 17:26] ship | Access sorted; PR #2 opened into main-dev; Auto-fix on

The founder invited `anubhav-stay` (second try, exact username); the agent accepted with `gh`.
→ [D048](decisions/D048-agent-access-and-secrets.md), lesson L12.

## [2026-10-16 17:34] ship | Saved bills live: PR #3 (main), then PR #2 (main-dev)

"To main, we will check on the prod URL." The founder checked billingbansal ("works with my
PIN"), then the father's site got it. → [D009](decisions/D009-two-sites-one-database.md).

## [2026-10-16 17:51] ship | Long item names wrap downward (PR #4, #5)

→ [D018](decisions/D018-wrap-long-item-names.md).

## [2026-10-16 18:00] decision | Drafts, editing from Master View, one-tap Send, nicer bill, bill links

The founder described the real routine (draft now, finish later, send). The agent proposed 4
steps; the founder chose 1+2, then "do the points 3 and 4 as well".
→ [D019](decisions/D019-draft-and-sent-status.md), [D020](decisions/D020-all-bills-cards-with-edit.md), [D021](decisions/D021-private-bill-link.md), [D022](decisions/D022-bill-design.md).

## [2026-10-16 18:09] ship | Drafts and Send live (PR #6 main, PR #7 main-dev)

"Send works on my phone on billingbansal." Note: this round dropped some CSS (lesson L2).

## [2026-10-16 18:23] decision | Picture is the bill, plus a text option; customer page; Settings

At 18:17 the founder asked for the picture only; at 18:23 for **both** options, a customer page
with three actions, payment QRs (UPI ID or photo) and delivery people in Settings.
→ [D023](decisions/D023-picture-is-the-bill-plus-text-option.md)–[D027](decisions/D027-bill-keeps-a-snapshot.md).

## [2026-10-16 18:31] decision | Bansal Store branding everywhere; bill number always visible

→ [D028](decisions/D028-bansal-store-branding.md). Incidents fixed on the way: `Settings.jsx`/`settings.js`
case clash (L3), blank pictures (L4), a hung PDF (L5), a 2.7 MB PDF (L6).

## [2026-10-16 18:49] ship | Settings, two sends and branding live (PR #8 main, PR #9 main-dev); site renamed

The founder chose `bansalstore.netlify.app` and declined a redirect from billingdev ("Don't
really care about old billings"). The inventory site moved to bansalstore-inventory.
→ [D029](decisions/D029-site-name-bansalstore.md).

## [2026-10-16 18:59] incident | Customers got a raw, unstyled bill picture

The founder sent a screenshot. Root cause: html2canvas ran before the production CSS applied,
and the dev server hid it. Switched to html-to-image and tested on a production build.
→ [D030](decisions/D030-bill-picture-html-to-image.md), lesson L1.

## [2026-10-16 19:12] decision | Auto-save, calm bigger UI, View & Send with exactly two options

"There should be auto save … operated without specs … Just those two flows."
→ [D031](decisions/D031-auto-save.md), [D032](decisions/D032-calm-bigger-ui.md), [D033](decisions/D033-view-and-send-two-options.md), [D034](decisions/D034-iphone-picture-without-caption.md). Supersedes [D010](decisions/D010-keep-fathers-buttons.md) and part of [D002](decisions/D002-father-first-minimal-change.md).

## [2026-10-16 19:15] ship | Simple send flow live on both sites (PR #10 main, PR #11 main-dev)

## [2026-10-16 19:28] ship | Two spare rows (PR #12, #13)

→ [D035](decisions/D035-two-spare-rows.md).

## [2026-10-17 06:58] ship | "My father is starting to use it": Details, bin icon, New bill (PR #14, #15)

→ [D036](decisions/D036-details-bin-new-bill.md).

## [2026-10-17 07:08] decision | Suggestions, address first, inventory tabs; no extras yet

Five ideas were explained simply. The founder picked items and customer suggestions plus an
inventory built from bills, worried about dropdowns, then asked for 2–3 chips, address first,
and a tab for clean-up. Extras: "For now, nothing."
→ [D037](decisions/D037-suggestions-before-other-ideas.md)–[D043](decisions/D043-customer-identity-key.md), [D045](decisions/D045-no-extras-in-first-build.md).

## [2026-10-17 07:18] decision | Fuzzy address matching after web research

"A135 once, or maybe A-135 … Maybe search on the internet." Normalise-then-compare in a
shared `src/normalize.mjs`. → [D044](decisions/D044-fuzzy-matching-own-normaliser.md), research [R2](sources/research.md#r2-fuzzy-address-matching).

## [2026-10-17 07:24] incident | See bills missed merged bills

Found in testing; fixed by filtering on the group's keys. → [D046](decisions/D046-see-bills-by-customer-group.md), lesson L11.

## [2026-10-17 07:28] ship | Suggestions and Items/Customers tabs live (PR #16 main, PR #17 main-dev)

Merged before Netlify's previews finished, after a local strict build (lesson L17). 40 tests.

## [2026-10-17 07:38] decision | Keep an LLM wiki of every decision

"I need every decision to be recorded. I need every architectural decision to be recorded."
→ [D049](decisions/D049-keep-an-llm-wiki.md), research [R3](sources/research.md#r3-how-to-build-an-llm-wiki-for-agents).

## [2026-10-17 07:58] ingest | Wiki created from the whole build session

Sources: [founder chat](sources/founder-chat-2026-10-16.md) and [agent proposals](sources/agent-proposals-2026-10-16.md) (48 founder messages, 4 question
rounds with 9 questions), PRs #1–#17, the full git history, the code at `375a811`, and research R1–R3.
Created 49 decision records, product, architecture, operations and knowledge pages,
`AGENTS.md`/`CLAUDE.md`, `scripts/wiki-lint.mjs` and `scripts/serve-build.mjs` on branch
`docs/llm-wiki`. An independent agent fact-checked every page against the chat and the code;
its 11 wrong facts and ~10 unsupported claims were fixed, and the agent's proposals were
added as a second source so they can be cited.

## [2026-10-17 08:16] ship | Wiki merged (PR #18 main, PR #19 main-dev)

The founder: "Commit it, push docs/llm-wiki and merge into both main and main-dev." Docs and
scripts only; both sites redeployed with the app unchanged.
