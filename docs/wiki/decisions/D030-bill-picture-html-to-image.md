---
id: D030
title: "The browser draws the bill picture with html-to-image; pictures are always checked on a production build"
type: decision
status: accepted
date: 2026-10-16
time-utc: "19:01"
decision-makers: [agent]
area: [sending, frontend]
supersedes: []
superseded-by: []
related: [D022, D033]
evidence:
  - "chat 2026-10-16 18:56"
  - "chat 2026-10-16 18:59 (screenshot)"
  - "agent 2026-10-16 19:10 (root cause)"
  - "PR #10, #11"
  - "commit 8e62b57"
code:
  - "src/share.js (renderBillImage, preloadImageTools)"
last-verified: 2026-10-17
---

# D030 · The browser draws the bill picture with html-to-image; pictures are always checked on a production build

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 19:01 UTC

## Context and problem

Customers were receiving an unstyled bill picture. **Root cause:** html2canvas copied
the page before the production stylesheet (a separate CSS file) applied. The dev server
injects CSS differently, so the picture looked fine locally. html2canvas also lost word
spacing.

## In the founder's words

> The send image flow is not good enough. It is sending a very raw type of image. I want the proper screenshot image of the bill that we had earlier, so we need that.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:56, 2026-10-16 18:59 (screenshot)

## Considered options

| Option | Outcome |
|---|---|
| Keep html2canvas | Rejected: the bug. |
| Render on the server (Puppeteer, Satori) | Rejected: costs credits and complicates Hindi text. |
| html-to-image in the browser | **Chosen.** |

## Decision

Draw the picture with `html-to-image` (`toCanvas`): render `InvoiceSheet` off-screen
in a 420px host inside a framed background (`.shot-frame`), at **pixelRatio 3**, background
`#f4efe9`, `skipFonts`, saved as **JPEG 0.92** (about 200 KB). It renders inside
`setTimeout` + `flushSync` so the sheet is on the page before drawing. Safari gets two
passes, because it paints embedded images such as a QR photo only on the second. The
library preloads 1.5 s after unlock.

## Consequences

- **Rule: test pictures and styles on a production build** (`npm run build` served statically), never only on the dev server. See [lessons learned](../knowledge/lessons-learned.md).

## Confirmation

- Make a bill on a production build (`npm run build` + static server) and compare the picture with the screen.

## Revisit when

- A phone model produces broken pictures: check its browser with the production build first.

## More information

- **Code:** `src/share.js (renderBillImage, preloadImageTools)`
- **Evidence:** [chat 2026-10-16 18:56](../sources/founder-chat-2026-10-16.md) · [chat 2026-10-16 18:59 (screenshot)](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-16 19:10 (root cause)](../sources/agent-proposals-2026-10-16.md) · PR [#10](https://github.com/anubhavb11/Billing/pull/10), [#11](https://github.com/anubhavb11/Billing/pull/11) · commit [`8e62b57`](https://github.com/anubhavb11/Billing/commit/8e62b57)
- **Related:** [D022 · A clean, printed-style bill design shared by the screen, the picture and the customer page](D022-bill-design.md) · [D033 · View & Send: the exact picture, then exactly two ways to send](D033-view-and-send-two-options.md)
