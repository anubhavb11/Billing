---
id: D028
title: "Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:43"
decision-makers: [founder]
area: [brand, ux]
supersedes: []
superseded-by: []
related: [D016, D029]
evidence:
  - "chat 2026-10-16 18:31"
  - "PR #8, #9"
code:
  - "public/logo.svg"
  - "src/Logo.jsx"
  - "public/manifest.json"
  - "public/index.html"
  - "public/og-image.png"
last-verified: 2026-10-17
---

# D028 · Bansal Store branding everywhere, a new logo, and a bill number that never scrolls away

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:43 UTC

## Context and problem

Link previews on WhatsApp said "React App", and the loading screen showed the React
logo.

## In the founder's words

> On the top, the bill number should always be visible, and do the Bansal Store branding everywhere because when you send the link it shows React, and when you load the UI, the React logo comes up. … Create a logo yourself … It should look like a Bunsel Store app.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:31

## Decision

- A logo was made: an orange tile with a white-and-peach shop awning over a bold white **B**. `public/logo.svg` is the master, and `Logo.jsx` draws the same SVG inline so it also appears in the bill picture.
- Favicon, home-screen icons (including Android maskable and iPhone), the manifest name, the page title, loading and PIN screens are all "Bansal Store".
- A 1200×630 `og-image.png` gives WhatsApp a Bansal Store preview card. Its absolute URL comes from `REACT_APP_SITE_URL=$URL` at build time.
- A slim sticky top bar always shows **Bill #N**.

## Consequences

- The site name decision followed (D029).

## More information

- **Code:** `public/logo.svg`; `src/Logo.jsx`; `public/manifest.json`; `public/index.html`; `public/og-image.png`
- **Evidence:** [chat 2026-10-16 18:31](../sources/founder-chat-2026-10-16.md) · PR [#8](https://github.com/anubhavb11/Billing/pull/8), [#9](https://github.com/anubhavb11/Billing/pull/9)
- **Related:** [D016 · Netlify builds with CI= (lint can't block a deploy); check strictly with CI=true before shipping](D016-netlify-build-command.md) · [D029 · The father's site is bansalstore.netlify.app, with no redirect from the old name](D029-site-name-bansalstore.md)
