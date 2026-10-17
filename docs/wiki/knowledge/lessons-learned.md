---
type: knowledge
title: Lessons learned and gotchas
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../log.md]
---

# Lessons learned and gotchas

Things that went wrong or nearly did during the build, and the rule each one left behind.
**Add an entry whenever an agent trips over the same thing twice.**

| # | What happened | Root cause | Rule now |
|---|---|---|---|
| L1 | **Customers received an unstyled bill picture** (founder's screenshot, 16 Oct 18:59) | html2canvas cloned the page before the production CSS file applied. The dev server injects CSS differently, so it looked fine locally | Pictures and styles are verified on a **production build** (`npm run serve:build`), never only the dev server ([D030](../decisions/D030-bill-picture-html-to-image.md)) |
| L2 | **Link, error, note and toast styles vanished** after a CSS rewrite (PR #6/#7), and shipped to both sites | The stylesheet was rewritten wholesale and old rules were dropped | When rewriting CSS, diff the selector list before and after; check toasts, errors and links visually. Restored in PR #8 |
| L3 | **Build broke: `Settings.jsx` vs `settings.js`** | macOS file names are case-insensitive | Never have two files differing only by case; the helpers are `shopSettings.js` |
| L4 | **Bill picture sometimes blank** | Rendering with `flushSync` inside a React effect did nothing (a no-op during render) | Render off-screen inside `setTimeout`, then `flushSync` ([bill picture](../architecture/bill-picture-and-sending.md)) |
| L5 | **PDF stuck on "Making the PDF…"** | `img.decode()` hung in some browsers | Wait for `img.onload` instead |
| L6 | **PDF was 2.7 MB** | PNG embedded at 3× | Embed as JPEG (about 120–200 KB) |
| L7 | **View page crashed** after a bill's picture was re-made | Stale object URL kept while the file was null | Clear the URL whenever the picture is reset |
| L8 | **All bills crashed after a hot reload** (`filters.status` undefined) | State shape changed during development | Read new fields defensively (`filters.status \|\| 'all'`) |
| L9 | **Strict build failed** on a missing effect dependency, and on a function named `useCatalog` | CRA lint rules (react-hooks) | Fix the dependency list; don't name non-hooks `use…` |
| L10 | **Env vars landed on a different site than the agent expected** | The agent assumed billingbansal was the father's site; the founder had set them on billingdev, which was the real one | Confirm which site is which before acting; `netlify env:clone` copies names and values without anyone printing them |
| L11 | **"See bills" showed 1 of 2 bills** for a merged customer | It searched by phone; the merged bill had none | Filter by the group's customer keys ([D046](../decisions/D046-see-bills-by-customer-group.md)) |
| L12 | **Push refused (403)** | The agent's GitHub account wasn't a collaborator; the first invite didn't show up for that account | The founder invites the exact username; the agent accepts with `gh api` ([D048](../decisions/D048-agent-access-and-secrets.md)) |
| L13 | **Browser tests gave false failures**: chip taps "didn't work", "Rose apt" found nothing | Synthetic clicks moved focus; steps ran faster than React re-rendered | Dispatch pointerdown/mousedown/click; pace steps ~400 ms; confirm with a unit test before "fixing" code |
| L14 | **The Chrome extension couldn't reach the right Chrome profile** | Only one connected profile, signed out of Netlify | Use the Netlify CLI with a login the founder approves |
| L15 | **The father's live site wasn't the one assumed** (billingbansal vs billingdev) | Two Netlify sites from one repo | Ask which URL the father uses before planning; it's in [overview](../overview.md) now |
| L16 | **A pinned total bar would cover the row being typed** on Android | The keyboard pushes fixed elements up | Keep the total under the table ([D011](../decisions/D011-phone-fit-rules.md)) |
| L17 | **Merged PRs before Netlify's preview finished** (#16/#17) | Speed | Acceptable only after a local strict build; say so to the founder |
| L18 | **Two PRs and two deploys per change, for a site nobody used** (16–17 Oct, #2–#19) | The check-site routine from D009 kept running after its reason had gone, and no one asked whether billingbansal was still used | One live site, one PR into `main-dev` ([D050](../decisions/D050-one-live-site-main-dev-only.md)). When a routine doubles the work, ask whether it is still needed |
