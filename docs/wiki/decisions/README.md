---
type: index
title: Decision log
updated: 2026-10-17
---

# Decision log

Every product and architecture decision behind the app, one file each, numbered roughly in
the order they were made (grouped by build round, so a few times overlap).
50 decisions: **27 by the founder**, **6 where the founder chose
an agent proposal**, and **17 technical calls by the agent** inside the founder's brief.

**Decided by** means:
- `founder`: the founder asked for it or picked it.
- `founder-accepted`: the agent proposed it and the founder explicitly said yes.
- `agent`: the agent decided while building, and it shipped with the founder's OK on the PR.
  These are the easiest to revisit, but read the record first: most exist to avoid a bug that already happened.

Records are never deleted or rewritten. When a decision changes, add a new record, set
`superseded-by` on the old one, and add a line to [../log.md](../log.md). Template:
[_template.md](_template.md). Format: a short form of MADR 4.0 (see [../conventions.md](../conventions.md)).

## All decisions

| ID | Decision | Status | Decided by | Date (UTC) | Supersedes | Superseded by |
|---|---|---|---|---|---|---|
| [D001](D001-build-on-the-2022-app.md) | Build on the 2022 app; reuse the Firebase prototype's ideas, not its code | accepted | agent | 2026-10-16 16:40 | — | — |
| [D002](D002-father-first-minimal-change.md) | Father first: mobile, one screen, change as little as possible | partly superseded | founder | 2026-10-16 16:38 | — | [D032](D032-calm-bigger-ui.md) |
| [D003](D003-host-on-netlify.md) | Host on Netlify | accepted | founder | 2026-10-16 16:43 | — | — |
| [D004](D004-neon-postgres.md) | Store bills in Neon Postgres; drop Firebase | accepted | founder | 2026-10-16 16:43 | — | — |
| [D005](D005-api-through-netlify-functions.md) | The browser talks only to Netlify Functions, never to the database | accepted | founder-accepted | 2026-10-16 16:44 | — | — |
| [D006](D006-no-login-shop-pin.md) | No user accounts; one shop PIN protects the API | accepted | founder | 2026-10-16 16:44 | — | — |
| [D007](D007-bill-fields.md) | Each bill has a number, customer name, phone, address and date; no paid/due status | accepted | founder | 2026-10-16 16:43 | — | — |
| [D008](D008-own-neon-not-netlify-database.md) | Use the founder's own free Neon project, not Netlify Database | accepted | founder-accepted | 2026-10-16 17:13 | — | — |
| [D009](D009-two-sites-one-database.md) | Two Netlify sites share one database: main is checked on billingbansal before main-dev goes to the father | superseded | founder | 2026-10-16 17:27 | — | [D050](D050-one-live-site-main-dev-only.md) |
| [D010](D010-keep-fathers-buttons.md) | Keep the father's buttons and colours when replacing the Firebase version | superseded | agent | 2026-10-16 17:23 | — | [D031](D031-auto-save.md), [D032](D032-calm-bigger-ui.md), [D033](D033-view-and-send-two-options.md) |
| [D011](D011-phone-fit-rules.md) | Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad | accepted | agent | 2026-10-16 17:00 | — | — |
| [D012](D012-schema-on-first-request.md) | Create and migrate the database schema on the first request, additive only | accepted | agent | 2026-10-16 16:53 | — | — |
| [D013](D013-soft-delete.md) | Deleting a bill hides it; nothing is erased | accepted | agent | 2026-10-16 16:53 | — | — |
| [D014](D014-one-api-handler-local-and-netlify.md) | One API handler runs both on Netlify and on a local server | accepted | agent | 2026-10-16 16:53 | — | — |
| [D015](D015-hash-routing.md) | Hash routes for the app; a real path for customer links | accepted | agent | 2026-10-16 16:53 | — | — |
| [D016](D016-netlify-build-command.md) | Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping | accepted | agent | 2026-10-16 17:14 | — | — |
| [D017](D017-bill-survives-refresh.md) | The bill on screen lives on the phone until it is saved | accepted | agent | 2026-10-16 16:53 | — | — |
| [D018](D018-wrap-long-item-names.md) | Long item names wrap downward instead of scrolling sideways | accepted | founder | 2026-10-16 17:48 | — | — |
| [D019](D019-draft-and-sent-status.md) | Bills are Drafts until sent; edited-after-sending and missing rates are flagged | accepted | founder-accepted | 2026-10-16 17:54 | — | — |
| [D020](D020-all-bills-cards-with-edit.md) | All bills (Master View) is a list of cards that open the bill for editing | accepted | founder | 2026-10-16 17:54 | — | — |
| [D021](D021-private-bill-link.md) | Every bill has a private link the customer can open without the PIN | accepted | founder-accepted | 2026-10-16 18:00 | — | — |
| [D022](D022-bill-design.md) | A clean, printed-style bill design shared by the screen, the picture and the customer page | accepted | founder-accepted | 2026-10-16 18:00 | — | — |
| [D023](D023-picture-is-the-bill-plus-text-option.md) | The bill picture is the bill, and a text bill to the number is also offered | accepted | founder | 2026-10-16 18:23 | — | — |
| [D024](D024-customer-page-three-actions.md) | The customer's page offers only Call shop, Save picture and Download PDF | accepted | founder | 2026-10-16 18:23 | — | — |
| [D025](D025-payment-qr-in-settings.md) | Payment QRs live in Settings (UPI ID or QR photo) and each bill picks one | accepted | founder | 2026-10-16 18:43 | — | — |
| [D026](D026-delivery-people.md) | Delivery people are set in Settings, picked per bill and printed on it | accepted | founder | 2026-10-16 18:43 | — | — |
| [D027](D027-bill-keeps-a-snapshot.md) | A bill keeps a copy of its payment QR and delivery person; QR photos are looked up | accepted | agent | 2026-10-16 18:25 | — | — |
| [D028](D028-bansal-store-branding.md) | Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away | accepted | founder | 2026-10-16 18:43 | — | — |
| [D029](D029-site-name-bansalstore.md) | The father's site is bansalstore.netlify.app, with no redirect from the old name | accepted | founder | 2026-10-16 18:47 | — | — |
| [D030](D030-bill-picture-html-to-image.md) | The browser draws the bill picture with html-to-image; pictures are always checked on a production build | accepted | agent | 2026-10-16 19:01 | — | — |
| [D031](D031-auto-save.md) | Bills save themselves; no Save button | accepted | founder | 2026-10-16 19:03 | [D010](D010-keep-fathers-buttons.md) | — |
| [D032](D032-calm-bigger-ui.md) | Calm, bigger UI: one orange accent, outlined secondary buttons, 52px buttons and icons | accepted | founder-accepted | 2026-10-16 19:03 | [D002](D002-father-first-minimal-change.md), [D010](D010-keep-fathers-buttons.md) | — |
| [D033](D033-view-and-send-two-options.md) | View & Send: the exact picture, then exactly two ways to send | accepted | founder | 2026-10-16 19:12 | [D010](D010-keep-fathers-buttons.md) | — |
| [D034](D034-iphone-picture-without-caption.md) | On iPhone the picture is shared alone; on Android it carries the link as a caption | accepted (unverified on a real iPhone) | agent | 2026-10-16 18:29 | — | — |
| [D035](D035-two-spare-rows.md) | Two empty rows appear when he types in the last row | accepted | founder | 2026-10-16 19:26 | — | — |
| [D036](D036-details-bin-new-bill.md) | "Details" heading, a bin icon, and "New bill (saves as draft)" instead of Clear | accepted | founder | 2026-10-17 06:56 | — | — |
| [D037](D037-suggestions-before-other-ideas.md) | Build item and customer suggestions first; the other three ideas were not picked | accepted | founder | 2026-10-17 07:04 | — | — |
| [D038](D038-chips-not-dropdowns.md) | Suggestions are up to 3 small chips, never a dropdown | accepted | founder | 2026-10-17 07:06 | — | — |
| [D039](D039-address-first-customer-box.md) | The customer box asks for the address first | accepted | founder | 2026-10-17 07:06 | — | — |
| [D040](D040-inventory-from-bills-items-customers-tabs.md) | The inventory is worked out from the bills; Items and Customers tabs are for weekly clean-up | accepted | founder | 2026-10-17 07:08 | — | — |
| [D041](D041-cleanup-as-rules-bills-never-change.md) | Clean-ups are stored as rules; bills are never rewritten | accepted | agent | 2026-10-17 07:10 | — | — |
| [D042](D042-catalog-built-on-read.md) | The item and customer lists are rebuilt from all bills on each request | accepted | agent | 2026-10-17 07:10 | — | — |
| [D043](D043-customer-identity-key.md) | A customer is identified by phone, else address, else name | accepted | agent | 2026-10-17 07:10 | — | — |
| [D044](D044-fuzzy-matching-own-normaliser.md) | Fuzzy matching: normalise, then allow small typos, in one module shared by app and server | accepted | agent | 2026-10-17 07:18 | — | — |
| [D045](D045-no-extras-in-first-build.md) | No extras in the first suggestions build | accepted | founder | 2026-10-17 07:08 | — | — |
| [D046](D046-see-bills-by-customer-group.md) | "See bills" shows every bill in a customer's group, not a phone search | accepted | agent | 2026-10-17 07:24 | — | — |
| [D047](D047-branch-demo-ship-workflow.md) | Feature branch, demo on local, ship only on the founder's word | partly superseded | founder | 2026-10-16 17:02 | — | [D050](D050-one-live-site-main-dev-only.md) |
| [D048](D048-agent-access-and-secrets.md) | The founder holds the secrets; agents work through the CLIs the founder authorised | accepted | founder | 2026-10-16 17:26 | — | — |
| [D049](D049-keep-an-llm-wiki.md) | Keep an LLM wiki of every decision in the repo | accepted | founder | 2026-10-17 07:38 | — | — |
| [D050](D050-one-live-site-main-dev-only.md) | One live site: bansalstore.netlify.app; ship with one PR into main-dev; billingbansal is deprecated | accepted | founder | 2026-10-17 08:18 | [D009](D009-two-sites-one-database.md), [D047](D047-branch-demo-ship-workflow.md) | — |

## By area

- **architecture:** [D001](D001-build-on-the-2022-app.md), [D005](D005-api-through-netlify-functions.md), [D012](D012-schema-on-first-request.md), [D014](D014-one-api-handler-local-and-netlify.md), [D015](D015-hash-routing.md), [D041](D041-cleanup-as-rules-bills-never-change.md), [D042](D042-catalog-built-on-read.md), [D044](D044-fuzzy-matching-own-normaliser.md)
- **brand:** [D022](D022-bill-design.md), [D028](D028-bansal-store-branding.md), [D029](D029-site-name-bansalstore.md)
- **copy:** [D036](D036-details-bin-new-bill.md)
- **cost:** [D008](D008-own-neon-not-netlify-database.md)
- **data:** [D004](D004-neon-postgres.md), [D007](D007-bill-fields.md), [D012](D012-schema-on-first-request.md), [D013](D013-soft-delete.md), [D017](D017-bill-survives-refresh.md), [D019](D019-draft-and-sent-status.md), [D027](D027-bill-keeps-a-snapshot.md), [D031](D031-auto-save.md), [D040](D040-inventory-from-bills-items-customers-tabs.md), [D041](D041-cleanup-as-rules-bills-never-change.md), [D043](D043-customer-identity-key.md)
- **deployment:** [D016](D016-netlify-build-command.md)
- **docs:** [D049](D049-keep-an-llm-wiki.md)
- **frontend:** [D011](D011-phone-fit-rules.md), [D015](D015-hash-routing.md), [D017](D017-bill-survives-refresh.md), [D030](D030-bill-picture-html-to-image.md), [D031](D031-auto-save.md), [D046](D046-see-bills-by-customer-group.md)
- **history:** [D001](D001-build-on-the-2022-app.md)
- **infrastructure:** [D003](D003-host-on-netlify.md), [D004](D004-neon-postgres.md), [D008](D008-own-neon-not-netlify-database.md), [D009](D009-two-sites-one-database.md), [D029](D029-site-name-bansalstore.md), [D050](D050-one-live-site-main-dev-only.md)
- **matching:** [D043](D043-customer-identity-key.md), [D044](D044-fuzzy-matching-own-normaliser.md), [D046](D046-see-bills-by-customer-group.md)
- **payments:** [D025](D025-payment-qr-in-settings.md)
- **performance:** [D042](D042-catalog-built-on-read.md)
- **process:** [D009](D009-two-sites-one-database.md), [D047](D047-branch-demo-ship-workflow.md), [D048](D048-agent-access-and-secrets.md), [D049](D049-keep-an-llm-wiki.md), [D050](D050-one-live-site-main-dev-only.md)
- **product:** [D002](D002-father-first-minimal-change.md), [D007](D007-bill-fields.md), [D019](D019-draft-and-sent-status.md), [D020](D020-all-bills-cards-with-edit.md), [D021](D021-private-bill-link.md), [D023](D023-picture-is-the-bill-plus-text-option.md), [D024](D024-customer-page-three-actions.md), [D025](D025-payment-qr-in-settings.md), [D026](D026-delivery-people.md), [D037](D037-suggestions-before-other-ideas.md), [D039](D039-address-first-customer-box.md), [D040](D040-inventory-from-bills-items-customers-tabs.md), [D045](D045-no-extras-in-first-build.md)
- **roadmap:** [D037](D037-suggestions-before-other-ideas.md), [D045](D045-no-extras-in-first-build.md)
- **security:** [D005](D005-api-through-netlify-functions.md), [D006](D006-no-login-shop-pin.md), [D021](D021-private-bill-link.md), [D048](D048-agent-access-and-secrets.md)
- **sending:** [D023](D023-picture-is-the-bill-plus-text-option.md), [D030](D030-bill-picture-html-to-image.md), [D033](D033-view-and-send-two-options.md), [D034](D034-iphone-picture-without-caption.md)
- **testing:** [D014](D014-one-api-handler-local-and-netlify.md), [D016](D016-netlify-build-command.md)
- **ux:** [D002](D002-father-first-minimal-change.md), [D006](D006-no-login-shop-pin.md), [D010](D010-keep-fathers-buttons.md), [D011](D011-phone-fit-rules.md), [D018](D018-wrap-long-item-names.md), [D020](D020-all-bills-cards-with-edit.md), [D022](D022-bill-design.md), [D024](D024-customer-page-three-actions.md), [D028](D028-bansal-store-branding.md), [D031](D031-auto-save.md), [D032](D032-calm-bigger-ui.md), [D033](D033-view-and-send-two-options.md), [D035](D035-two-spare-rows.md), [D036](D036-details-bin-new-bill.md), [D038](D038-chips-not-dropdowns.md), [D039](D039-address-first-customer-box.md)
