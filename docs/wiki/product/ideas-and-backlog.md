---
type: product
title: Ideas and backlog
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../sources/founder-chat-2026-10-16.md, ../decisions/README.md]
---

# Ideas and backlog

Everything that was proposed but not built, with who held it and why, plus engineering
follow-ups. **Nothing here is approved.** Ask the founder before building any of it, and
record the answer as a decision.

## Product ideas the founder held

| Idea | What the father would see | Origin | Status and reason | Size |
|---|---|---|---|---|
| ~~**Paid / Udhaar (credit)**~~ **Built 17 Oct** ([D051](../decisions/D051-track-delivery-and-money-on-every-bill.md), [D054](../decisions/D054-udhaar-khata-any-amount.md)) | A Paid/Due switch per bill, a Due filter, "Sharma ji owes ₹1,250 across 3 bills" | Offered 16 Oct 16:41 (not picked, [D007](../decisions/D007-bill-fields.md)); again in the agent's 17 Oct 07:02 ideas ([D037](../decisions/D037-suggestions-before-other-ideas.md)) | Not picked. The agent advised asking the father first whether he wants credit tracked in the app; it's only as accurate as his marking. | Medium |
| **Today at a glance** | "Today: 12 bills · ₹8,450 · 2 drafts waiting" at the top of All bills | Agent, 17 Oct 07:02 | Not picked ([D037](../decisions/D037-suggestions-before-other-ideas.md)). The Today date filter already gives the count and total. | Small |
| **Hindi labels** | A Settings switch for नया बिल, देखें और भेजें, सभी बिल… (bills unchanged) | Agent, 17 Oct 07:02 | Not picked. The agent: only if he'd honestly find Hindi easier. | Small |
| **Possible duplicates** | Items/Customers tabs list likely duplicates (चीनी · चिनी · Sugar → merge?) | 17 Oct 07:07 | Held ([D045](../decisions/D045-no-extras-in-first-build.md)). `matchScore` and `addressKey` could power it. | Small–medium |
| **Repeat last order** | Picking a regular customer shows "Repeat last bill (6 items)" | 17 Oct 07:07 | Held. Kirana regulars often order the same things. | Medium |
| **Usual rate** | Set "Sugar is ₹50 now" once; suggestions use it | Agent, 17 Oct 07:05 and 07:07 | Not chosen in the 07:07 question ([D045](../decisions/D045-no-extras-in-first-build.md)). Chips offer the **last** rate used. | Small |
| **Excel export** | Download bills, items and customers as a spreadsheet | 17 Oct 07:07 | Held. Useful for the accountant. | Small |
| **Rate list picture** | The Items list as a "Bansal Store rate list" image for WhatsApp | Agent, 17 Oct 07:07 (not in the question) | Not built. | Small |
| **Stock counting** | How many bags are left | 17 Oct 07:05 | Out of scope: needs purchases entered too ([D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md)). | Large |
| **Forward billingdev.netlify.app** | Old links keep working | 16 Oct 18:45 | Declined: "Don't really care about old billings." ([D029](../decisions/D029-site-name-bansalstore.md)) | — |

## Delivery and payment follow-ups (from the 17 Oct build)

| Item | Why | Size |
|---|---|---|
| **Test on real phones** | Raju's location in the field (Android and iPhone), the screen wake lock, how often it drops when the phone is pocketed | Small (needs phones) |
| **Undo "Got it" in the app** | A mistaken cash handover can only be undone in SQL today | Small |
| **Partial cash handover** | If he hands over only part of his cash; today "Got it" settles all of it | Small |
| **Khata statement** | A picture or PDF of a customer's udhaar for the hisaab, like the bill picture | Medium |
| **New-order alert for Raju** | Today his page refreshes every 30 s while open; a push notification needs a service worker | Medium |
| **Watch Neon hours** | Delivery updates keep the database awake while delivering ([D058](../decisions/D058-refresh-only-while-on-screen.md)) | Ongoing |

## Engineering follow-ups (agent recommendations, not yet discussed)

| Item | Why | Size |
|---|---|---|
| **Test sending on real phones** | WhatsApp share on iPhone and Android hasn't been checked by an agent. Is the caption dropped on iPhone ([D034](../decisions/D034-iphone-picture-without-caption.md))? Does the picture arrive styled? | Small (needs the founder's phones) |
| **Collect missed matches** | The father's real typing will show which addresses and items the matcher misses. Add each as a test in `src/catalog.test.js`, then fix `normalize.mjs` ([D044](../decisions/D044-fuzzy-matching-own-normaliser.md)). | Ongoing |
| **Limit PIN guesses** | There is no rate limit on wrong PINs ([security](../architecture/security-and-privacy.md)). A small counter in the database, or a Netlify rate-limit rule. | Small |
| **Clear test data** | Bills, settings and rules made while checking on billingbansal live in the father's database. | Small (ask first) |
| **Move off Create React App** | CRA is deprecated; Netlify's build image or Node may stop supporting it. Move to Vite while the app is small ([D001](../decisions/D001-build-on-the-2022-app.md)). | Medium |
| **Node version on Netlify** | The agent saw a Node 16 warning in Netlify's build on 16 Oct; set a current LTS (`NODE_VERSION` or `.nvmrc`) and test the build. | Small |
| **Backups** | Check what Neon Free keeps for restore, and consider a periodic export (pairs with Excel export). | Small |
| **Offline queue** | If signal is poor in the shop, queue saves in IndexedDB instead of only retrying the bill on screen ([D004](../decisions/D004-neon-postgres.md)). | Medium |
| **Catalog at scale** | `/api/catalog` rebuilds from every bill each time; fine for thousands ([D042](../decisions/D042-catalog-built-on-read.md)). Watch its response time. | Later |
| **Bill link revoke/expiry** | Links can't be revoked except by deleting the bill ([D021](../decisions/D021-private-bill-link.md)). | Small |
| **Matcher gaps** | Block letter `H` dropped as "house", `st` → street, no Hindi↔English transliteration (चीनी vs cheeni). See [matching](../architecture/matching-and-catalog.md#known-limits). | Small each |
| **Fix the Settings remove-QR message** | `Settings.jsx` says "Bills already made with it keep showing it", which is wrong for QR photos: they disappear from old bills ([D027](../decisions/D027-bill-keeps-a-snapshot.md)). Ask the founder before changing what the father sees. | Small |
| **Wiki lint in CI** | Run `npm run wiki:lint` in a GitHub Action on PRs. Not in the Netlify build, so a doc slip can't block a deploy. | Small |

## Suggested order (agent's view, 17 Oct 2026)

1. Let the father use it for a week. Then ask him and the founder what slowed him down, and collect missed chip matches.
2. Real-phone send test (both buttons, Android and iPhone if available).
3. Ask about Udhaar. If yes, it's the biggest remaining everyday win.
4. Small safety items: PIN rate limit, clear test data, backup check.
5. Platform upkeep before it's forced: Node version, then CRA → Vite.
