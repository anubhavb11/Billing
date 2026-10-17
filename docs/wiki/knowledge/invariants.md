---
type: knowledge
title: Invariants (must not break)
updated: 2026-10-17
last-verified: 2026-10-17
---

# Invariants: must not break

Breaking any of these hurts the father or his customers. Each one has a check. If a change
needs to break one, it needs a new decision record and the founder's OK first.

| # | Invariant | Why | Check |
|---|---|---|---|
| I1 | The bill fits a **360px** screen with no sideways scroll; inputs ≥16px | The father works on his phone; iPhones zoom into small inputs | Browser at 360px: `document.documentElement.scrollWidth === 360` ([D011](../decisions/D011-phone-fit-rules.md)) |
| I2 | **A typed bill is never lost**: kept on the phone, auto-saved, soft-deleted only | Principle 3 | Tests in `bill.test.js`; manual reload check ([D017](../decisions/D017-bill-survives-refresh.md), [D031](../decisions/D031-auto-save.md), [D013](../decisions/D013-soft-delete.md)) |
| I3 | **One typing session makes exactly one bill** (no duplicates from auto-save) | Duplicate bills confuse numbering and totals | Type, wait, edit, wait: one new row in All bills ([D031](../decisions/D031-auto-save.md)) |
| I4 | **Saved bills are never rewritten by clean-ups** | Customers already have them | Merge or rename, then compare the bill JSON before and after ([D041](../decisions/D041-cleanup-as-rules-bills-never-change.md)) |
| I5 | **Schema changes are additive**; old code keeps working on the new schema | Phones may run a cached older app, and rollbacks republish old code ([D012](../decisions/D012-schema-on-first-request.md)) | Review `SCHEMA` diffs: only `create … if not exists` / `add column if not exists` ([D012](../decisions/D012-schema-on-first-request.md)) |
| I6 | **Every route except `/api/public/bills/:token` requires the PIN** | No logins ([D006](../decisions/D006-no-login-shop-pin.md)) | `curl` without the PIN returns 401 |
| I7 | **The public bill route reveals only that bill's customer-facing fields** | Privacy ([D021](../decisions/D021-private-bill-link.md)) | `toPublicBill` has no status, token or timestamps beyond `createdAt` |
| I8 | **What he previews is what the customer gets** | The picture is the product ([D030](../decisions/D030-bill-picture-html-to-image.md)) | Production-build picture equals the on-screen sheet |
| I9 | **View & Send has exactly two options**: green WhatsApp (only with a valid number) and Send picture | Founder: "Just those two flows" ([D033](../decisions/D033-view-and-send-two-options.md)) | `SendPage.jsx` |
| I10 | **The customer page has only Call shop, Save picture, Download PDF** | Founder ([D024](../decisions/D024-customer-page-three-actions.md)) | `PublicBill.jsx` |
| I11 | **At most 3 suggestion chips, never a dropdown**. An item chip fills details and rate only when they are empty; a customer chip fills all three customer fields | Founder ([D038](../decisions/D038-chips-not-dropdowns.md)) | `catalog.test.js`; `pickItem` only fills empty details/rate |
| I12 | **App and server normalise text identically** (`src/normalize.mjs` is the only implementation) | Chips and customer grouping must agree ([D044](../decisions/D044-fuzzy-matching-own-normaliser.md)) | No second copy of `words`/`addressKey`/`customerKey` anywhere |
| I13 | **Every API route is listed in `config.path`** | Netlify 404s otherwise ([D014](../decisions/D014-one-api-handler-local-and-netlify.md)) | Compare the `bills-api.mjs` header comment with `bills.mjs` |
| I14 | **No secrets or real customer data in the repo** (it is public) | [D048](../decisions/D048-agent-access-and-secrets.md) | `npm run wiki:lint` scans the wiki; `git diff` review for code |
| I15 | **One accent colour**: orange for the main action; green only WhatsApp/Sent; red only delete/errors; buttons ≥52px | Usable without glasses ([D032](../decisions/D032-calm-bigger-ui.md)) | Visual check; `:root` tokens in `App.css` |
| I16 | **Bansal Store branding only**: no "React App" text or logo anywhere a person sees | [D028](../decisions/D028-bansal-store-branding.md) | `grep -ri "react app" public src` finds nothing user-visible |
| I17 | **Ship with one PR into `main-dev`**, only on the founder's word; never a PR into `main` | [D047](../decisions/D047-branch-demo-ship-workflow.md), [D050](../decisions/D050-one-live-site-main-dev-only.md) | `gh pr list --base main --state open` is empty |
