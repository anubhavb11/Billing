---
type: index
title: Index
updated: 2026-10-17
---

# Wiki index

Read this first. Every page in the wiki, with one line on what it holds. How the wiki is kept:
[conventions.md](conventions.md). The latest changes: [log.md](log.md).

## Start here

- [overview.md](overview.md): what the app is, who uses it, where it runs (bansalstore.netlify.app only), what it does today.
- [conventions.md](conventions.md): the wiki's layers, page types, frontmatter, and the ingest / query / lint routines.
- [log.md](log.md): what happened, oldest first, from the 2022 version to now.
- [/AGENTS.md](../../AGENTS.md): the short guide every agent loads: commands, Always / Ask first / Never.

## Product

- [product/vision-and-principles.md](product/vision-and-principles.md): the founder's 8 principles, with quotes and the decisions behind each.
- [product/users-and-journeys.md](product/users-and-journeys.md): the father, the founder, customers and delivery people, and their step-by-step journeys.
- [product/features.md](product/features.md): every feature by screen, with its code and decision.
- [product/ideas-and-backlog.md](product/ideas-and-backlog.md): held ideas (udhaar, repeat order, Excel…) and engineering follow-ups, with a suggested order.

## Architecture

- [architecture/overview.md](architecture/overview.md): system diagram, parts table, request flows.
- [architecture/data-model.md](architecture/data-model.md): `bills`, `settings`, `catalog_rules`, JSON shapes, the derived catalog, `localStorage` keys, safe schema changes.
- [architecture/api.md](architecture/api.md): every route, auth, validation, errors.
- [architecture/frontend.md](architecture/frontend.md): routing, state, the auto-save algorithm, chips, styling, gotchas.
- [architecture/bill-picture-and-sending.md](architecture/bill-picture-and-sending.md): how the send flow evolved, the picture pipeline, WhatsApp text, share menu, PDF, customer page.
- [architecture/matching-and-catalog.md](architecture/matching-and-catalog.md): **fuzzy matching deep dive**: normalisation, scores, grouping, clean-up rules, tests, known limits.
- [architecture/delivery-and-payments.md](architecture/delivery-and-payments.md): **delivery and payment tracking**: statuses, who can change what, Raju's page `/d`, cash handover, UPI check, udhaar khata, live map, limits and costs.
- [architecture/deployment-and-environments.md](architecture/deployment-and-environments.md): the sites, branches, env var names, build, functions, cost limits, deploy checks.
- [architecture/security-and-privacy.md](architecture/security-and-privacy.md): the PIN model, public links, personal data, known weaknesses, rules for agents.

## Operations

- [operations/runbook.md](operations/runbook.md): setup, run, check, common tasks (restore a bill, change the PIN, roll back), troubleshooting.
- [operations/testing.md](operations/testing.md): the automated suites, the manual production-build checklist, what can't be tested locally, test data.
- [operations/release-process.md](operations/release-process.md): branch → demo → founder's go → PRs into `main` and `main-dev` → verify. PR template.

## Knowledge

- [knowledge/invariants.md](knowledge/invariants.md): 17 must-not-break rules, each with a check.
- [knowledge/lessons-learned.md](knowledge/lessons-learned.md): 17 incidents and gotchas from the build, and the rule each left.
- [knowledge/open-questions.md](knowledge/open-questions.md): questions for the founder, things never verified, accepted risks.
- [knowledge/glossary.md](knowledge/glossary.md): shop, product and code terms (draft, chip, customer key, udhaar…).

## Sources (never edited)

- [sources/founder-chat-2026-10-16.md](sources/founder-chat-2026-10-16.md): the founder's messages and every question/answer round, word for word, 16–17 Oct 2026.
- [sources/founder-chat-2026-10-17.md](sources/founder-chat-2026-10-17.md): the founder's follow-up messages on 17 Oct, including "We are only using this website" (D050).
- [sources/founder-chat-2026-10-17-delivery.md](sources/founder-chat-2026-10-17-delivery.md): the founder's brief for delivery and payment tracking, word for word, and the four choices.
- [sources/agent-proposals-2026-10-17-delivery.md](sources/agent-proposals-2026-10-17-delivery.md): the agent's plan for it (statuses, Raju's page, why not a live map, costs).
- [sources/agent-proposals-2026-10-16.md](sources/agent-proposals-2026-10-16.md): the agent's plans, findings and offered options at each turning point, word for word (scrubbed).
- [sources/research.md](sources/research.md): web research R1 (Netlify vs Neon), R2 (fuzzy address matching), R3 (LLM wiki practices), with links.

## Decisions (58)

Full table with status and supersede links: [decisions/README.md](decisions/README.md).
Template: [decisions/_template.md](decisions/_template.md).

### Starting point and foundations (16 Oct, 16:38–17:36)

- [D001](decisions/D001-build-on-the-2022-app.md) Build on the 2022 app; reuse the Firebase prototype's ideas, not its code (agent)
- [D002](decisions/D002-father-first-minimal-change.md) Father first: mobile, one screen, change as little as possible (founder) · *partly superseded*
- [D003](decisions/D003-host-on-netlify.md) Host on Netlify (founder)
- [D004](decisions/D004-neon-postgres.md) Store bills in Neon Postgres; drop Firebase (founder)
- [D005](decisions/D005-api-through-netlify-functions.md) The browser talks only to Netlify Functions, never to the database (founder, agent's proposal)
- [D006](decisions/D006-no-login-shop-pin.md) No user accounts; one shop PIN protects the API (founder) · *partly superseded*
- [D007](decisions/D007-bill-fields.md) Each bill has a number, customer name, phone, address and date; no paid/due status (founder) · *partly superseded*
- [D008](decisions/D008-own-neon-not-netlify-database.md) Use the founder's own free Neon project, not Netlify Database (founder, agent's proposal)
- [D009](decisions/D009-two-sites-one-database.md) Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father (founder) · *superseded*
- [D010](decisions/D010-keep-fathers-buttons.md) Keep the father's buttons and colours when replacing the Firebase version (agent) · *superseded*
- [D011](decisions/D011-phone-fit-rules.md) Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad (agent)
- [D012](decisions/D012-schema-on-first-request.md) Create and migrate the database schema on the first request, additive only (agent)
- [D013](decisions/D013-soft-delete.md) Deleting a bill hides it; nothing is erased (agent)
- [D014](decisions/D014-one-api-handler-local-and-netlify.md) One API handler runs both on Netlify and on a local server (agent)
- [D015](decisions/D015-hash-routing.md) Hash routes for the app; a real path for customer links (agent)
- [D016](decisions/D016-netlify-build-command.md) Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping (agent)
- [D017](decisions/D017-bill-survives-refresh.md) The bill on screen lives on the phone until it is saved (agent)

### Daily workflow: drafts, editing, links (16 Oct, 17:48–18:10)

- [D018](decisions/D018-wrap-long-item-names.md) Long item names wrap downward instead of scrolling sideways (founder)
- [D019](decisions/D019-draft-and-sent-status.md) Bills are Drafts until sent; edited-after-sending and missing rates are flagged (founder, agent's proposal)
- [D020](decisions/D020-all-bills-cards-with-edit.md) All bills (Master View) is a list of cards that open the bill for editing (founder)
- [D021](decisions/D021-private-bill-link.md) Every bill has a private link the customer can open without the PIN (founder, agent's proposal)
- [D022](decisions/D022-bill-design.md) A clean, printed-style bill design shared by the screen, the picture and the customer page (founder, agent's proposal)

### Sending, settings, branding (16 Oct, 18:17–18:50)

- [D023](decisions/D023-picture-is-the-bill-plus-text-option.md) The bill picture is the bill, and a text bill to the number is also offered (founder)
- [D024](decisions/D024-customer-page-three-actions.md) The customer's page offers only Call shop, Save picture and Download PDF (founder)
- [D025](decisions/D025-payment-qr-in-settings.md) Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one (founder)
- [D026](decisions/D026-delivery-people.md) Delivery people are set in Settings, picked per bill and printed on it (founder)
- [D027](decisions/D027-bill-keeps-a-snapshot.md) A bill keeps a copy of its payment QR and delivery person; QR photos are looked up (agent)
- [D028](decisions/D028-bansal-store-branding.md) Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away (founder)
- [D029](decisions/D029-site-name-bansalstore.md) The father's site is bansalstore.netlify.app, with no redirect from the old name (founder)

### Simplify: picture fix, auto-save, calm UI (16 Oct, 18:56–19:30)

- [D030](decisions/D030-bill-picture-html-to-image.md) The browser draws the bill picture with html-to-image; pictures are always checked on a production build (agent)
- [D031](decisions/D031-auto-save.md) Bills save themselves; no Save button (founder)
- [D032](decisions/D032-calm-bigger-ui.md) Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons (founder, agent's proposal)
- [D033](decisions/D033-view-and-send-two-options.md) View & Send: the exact picture, then exactly two ways to send (founder)
- [D034](decisions/D034-iphone-picture-without-caption.md) On iPhone the picture is shared alone; on Android it carries the link as a caption (agent) · *accepted (unverified on a real iPhone)*
- [D035](decisions/D035-two-spare-rows.md) Two empty rows appear when he types in the last row (founder)

### Polish after first real use (17 Oct, 06:56)

- [D036](decisions/D036-details-bin-new-bill.md) "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear (founder)

### Suggestions, inventory, fuzzy matching (17 Oct, 07:02–07:30)

- [D037](decisions/D037-suggestions-before-other-ideas.md) Build item and customer suggestions first; the other three ideas were not picked (founder)
- [D038](decisions/D038-chips-not-dropdowns.md) Suggestions are up to 3 small chips, never a dropdown (founder)
- [D039](decisions/D039-address-first-customer-box.md) The customer box asks for the address first (founder)
- [D040](decisions/D040-inventory-from-bills-items-customers-tabs.md) The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up (founder)
- [D041](decisions/D041-cleanup-as-rules-bills-never-change.md) Clean-ups are stored as rules; bills are never rewritten (agent)
- [D042](decisions/D042-catalog-built-on-read.md) The item and customer lists are rebuilt from all bills on each request (agent)
- [D043](decisions/D043-customer-identity-key.md) A customer is identified by phone, else address, else name (agent)
- [D044](decisions/D044-fuzzy-matching-own-normaliser.md) Fuzzy matching: normalise, then allow small typos, in one module shared by app and server (agent)
- [D045](decisions/D045-no-extras-in-first-build.md) No extras in the first suggestions build (founder)
- [D046](decisions/D046-see-bills-by-customer-group.md) "See bills" shows every bill in a customer's group, not a phone search (agent)

### Process and governance

- [D047](decisions/D047-branch-demo-ship-workflow.md) Feature branch, demo on local, ship only on the founder's word (founder) · *partly superseded*
- [D048](decisions/D048-agent-access-and-secrets.md) The founder holds the secrets; agents work through the CLIs the founder authorised (founder)
- [D049](decisions/D049-keep-an-llm-wiki.md) Keep an LLM wiki of every decision in the repo (founder)
- [D050](decisions/D050-one-live-site-main-dev-only.md) One live site: bansalstore.netlify.app; ship with one PR into main-dev; billingbansal is deprecated (founder)

### Delivery and payments (17 Oct, 08:32–09:00)

- [D051](decisions/D051-track-delivery-and-money-on-every-bill.md) Every bill tracks its delivery (packed, on the way, delivered) and what happened to the money (founder)
- [D052](decisions/D052-cash-stays-with-delivery-boy-until-handover.md) Cash a delivery boy collects stays "with him" until the father taps "Got it" (founder, agent's proposal)
- [D053](decisions/D053-father-confirms-upi.md) UPI the delivery boy reports waits until the father confirms it (founder)
- [D054](decisions/D054-udhaar-khata-any-amount.md) Udhaar is a khata per customer; any amount received clears the oldest bills first (founder)
- [D055](decisions/D055-delivery-boy-page-own-pin.md) Delivery boys use /d with their mobile number and their own PIN, and see only their orders (founder)
- [D056](decisions/D056-live-map-while-on-the-way.md) The customer's link shows a live map while the order is on the way (founder)
- [D057](decisions/D057-tracking-saved-apart-from-bill-contents.md) Delivery and payment status are saved apart from the bill's contents (agent)
- [D058](decisions/D058-refresh-only-while-on-screen.md) Live updates refresh only while a page is on screen, and only when needed (agent)
