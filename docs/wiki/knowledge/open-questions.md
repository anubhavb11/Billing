---
type: knowledge
title: Open questions, risks and unverified items
updated: 2026-10-17
last-verified: 2026-10-17
---

# Open questions, risks and unverified items

What we **don't know yet**, what was **never checked**, and **risks** we accepted. Ideas for
new features live in the [backlog](../product/ideas-and-backlog.md). When one of these is
answered, record the answer (a decision or a page update) and strike it here with the date.

## Questions for the founder or the father

| # | Question | Why it matters | Raised |
|---|---|---|---|
| ~~Q1~~ | ~~Does the father want credit (udhaar) tracked in the app?~~ **Answered 17 Oct 08:32: yes** ([D054](../decisions/D054-udhaar-khata-any-amount.md)) | — | 17 Oct |
| Q2 | Which phone does the father use: Android or iPhone? | Decides whether the picture carries the link caption ([D034](../decisions/D034-iphone-picture-without-caption.md)) | 17 Oct (wiki) |
| Q3 | The founder said the father "can sit on a computer" for the weekly clean-up: will he, or will the founder help? On which computer? | Shapes the Items/Customers tab design | 17 Oct |
| Q4 | Would Hindi button labels help him? | [D037](../decisions/D037-suggestions-before-other-ideas.md) | 17 Oct |
| Q5 | Are blocks in the area lettered `H`? | The matcher drops a lone `h` ([matching](../architecture/matching-and-catalog.md#known-limits)) | 17 Oct (wiki) |
| Q6 | Should test bills made on billingbansal be deleted from the shared database? | They show in the father's All bills and catalog | 16 Oct |
| Q7 | Is the shop's signal reliable? | Decides whether an offline queue is worth it | 16 Oct |
| ~~Q8~~ | ~~billingbansal is deprecated: delete it or remove its env vars?~~ **Answered 17 Oct 08:23: deleted** ([D050](../decisions/D050-one-live-site-main-dev-only.md)) | — | 17 Oct |
| ~~Q9~~ | ~~Switch GitHub's default branch to `main-dev` and delete `main`?~~ **Done 17 Oct: the founder switched it at 08:29, and `main` was deleted at 08:30** ([D050](../decisions/D050-one-live-site-main-dev-only.md)) | — | 17 Oct |

## Never verified (agents couldn't test these)

| # | Item | How to verify |
|---|---|---|
| V1 | WhatsApp **Send picture** on a real Android and a real iPhone: does the picture arrive styled? Is the caption kept on Android and dropped on iPhone? | The founder sends one bill to themselves from each phone |
| V2 | The number keypad and Enter-to-next on the father's phone keyboard | Watch him type one bill |
| V3 | Suggestion chips on the father's real data (first live use on 17 Oct) | Ask after a few days; collect misses as tests |
| V4 | The `catalog_rules` table creation on production | Happens on the first API request after deploy (any route); open the Items tab once |
| V6 | Raju's live location from a real phone in the colony: how often it updates, and what happens when he pockets the phone | Watch one delivery on the customer link |
| V7 | `delivery_events`, `payment_status`, `khata_payments` and `courier_locations` created on production | Created on the first API request after the deploy |
| V5 | Neon Free limits and Netlify credit costs (read 16 Oct 2026) | Re-check the docs every few months ([deployment](../architecture/deployment-and-environments.md#cost-and-limits-as-read-on-16-oct-2026-so-re-check)) |

## Accepted risks

| # | Risk | Mitigation today | Trigger to act |
|---|---|---|---|
| R1 | Shared PIN, no rate limit on guesses | 6+ digit PIN; HTTPS | A leak, more staff, or any sign of misuse ([security](../architecture/security-and-privacy.md)) |
| R2 | Netlify credits run out, so **both sites go offline** | Batch deploys; DB is outside Netlify | Credits low in the Netlify dashboard |
| R3 | Create React App is deprecated | Still builds | A Netlify build-image or Node change breaks it |
| R4 | Test data made on the live site lands in real data | Test locally; made-up names; clean up | Confusion in the father's list |
| R5 | `/api/catalog` grows with every bill | Fine at shop scale | Over ~1 s response or ~10,000 bills ([D042](../decisions/D042-catalog-built-on-read.md)) |
| R6 | Bill links can't be revoked | Delete the bill | A customer complaint |
| R7 | No backups beyond what Neon Free keeps | — | Check Neon's restore window; add an export |
| R8 | Live location keeps the database awake during deliveries ([D056](../decisions/D056-live-map-while-on-the-way.md)) | Sent only while on the way and open; 20 s spacing | Neon usage page nears 100 hours a month |
| R9 | A wrong "Got it" can't be undone in the app | Confirm dialog | It happens once |
