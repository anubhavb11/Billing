---
type: architecture
title: Bill picture and sending
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../src/share.js, ../../../src/SendPage.jsx, ../../../src/PublicBill.jsx]
---

# Bill picture and sending

Sending the bill is the father's most important action ([principle 4](../product/vision-and-principles.md#4-the-bill-picture-is-the-product)).
This page covers how the picture is made, the two ways to send it, and the customer's page.

## How the send flow evolved (16 Oct 2026)

| Time (UTC) | Version | Why it changed |
|---|---|---|
| 2022 | View → **Take screenshot** (html2canvas) → share | The father's original habit |
| 17:34 | Same, rebuilt on the new app ([D010](../decisions/D010-keep-fathers-buttons.md)) | Keep what he knows |
| 18:06 | One-tap **Send** (picture + caption) + WhatsApp-text button on View | Founder: "a more improved flow" |
| 18:18 | Picture only, no caption, text button removed (local only, never shipped) | Founder 18:17: "I want to send that image … as a bill" |
| 18:43 | Send sheet with two choices: *Send to number* / *Send picture* | Founder 18:23: "We should have both options" ([D023](../decisions/D023-picture-is-the-bill-plus-text-option.md)) |
| 19:10 | Single **View & Send** screen with one "Send on WhatsApp" (planned 18:57, shown locally, never shipped) | Founder 18:56: "Unify the flow" |
| 19:14 | **View & Send: exact picture + green WhatsApp + Send picture** (current) | Founder 19:12: "Just those two flows" ([D033](../decisions/D033-view-and-send-two-options.md)) |

## Making the picture: `renderBillImage(bill)` in `src/share.js`

1. Create an off-screen host (`position:fixed; left:-10000px; width:420px`).
2. In `setTimeout(0)`, `flushSync`-render `<div class="shot-frame"><InvoiceSheet bill/></div>`.
   Rendering outside the current React effect guarantees the DOM exists before drawing. An
   earlier version sometimes got a blank picture.
3. `html-to-image` `toCanvas(node, { pixelRatio: 3, backgroundColor: '#f4efe9', skipFonts: true })`.
   On Safari it runs twice, because the first pass may miss embedded images (a QR photo).
4. `canvas.toBlob('image/jpeg', 0.92)` → `File("Bansal Store Bill N.jpg")`, about 200 KB and 1260px wide.
5. Unmount and remove the host.

`preloadImageTools()` imports html-to-image 1.5 s after unlock, so the first Send is quick.

**Why html-to-image** ([D030](../decisions/D030-bill-picture-html-to-image.md)): html2canvas
re-implemented CSS and cloned the page before the production stylesheet had applied, so
customers received unstyled bills. It also lost word spacing. html-to-image serialises the
real DOM with computed styles into an SVG `foreignObject`, which the browser paints itself,
so the picture matches the screen, Hindi shaping included.

> **Always check pictures on a production build.** The CRA dev server injects CSS
> differently and hid the bug. See [testing](../operations/testing.md).

## Option 1: green WhatsApp button (text bill)

- Shown only when `waNumber(bill.customerPhone)` is valid: 10 digits → `91…`; `0` + 10 digits
  → `91…`; 11–13 digits as typed; anything else → hidden.
- Opens `https://wa.me/<number>?text=<billText>` in a new tab, or in the same tab if pop-ups are blocked.
- `billText` (WhatsApp `*bold*`):
  ```
  *Bansal Store*
  Bill #12 · 17 Oct 2026
  Sharma ji

  1. चीनी (1 kg)
      2 × ₹48 = *₹96*

  *Total: ₹96*
  Delivery: Raju · 98…
  Pay by UPI: shop@okicici

  View bill: https://bansalstore.netlify.app/b/<token>

  Thank you! Bansal Store · Ph. 7678642241
  ```

## Option 2: Send picture

- `shareFile(file, caption)` calls `navigator.share({ files:[file], text? })` and returns
  `shared` / `cancelled` / `blocked` (the phone wants a fresh tap) / `unsupported`.
- The caption ("Bansal Store · Bill #N" + link) is added **except on iPhone/iPad**, where
  WhatsApp drops the picture when text comes with it ([D034](../decisions/D034-iphone-picture-without-caption.md)).
- **A website can't attach a picture to a specific WhatsApp chat.** The father always picks
  the customer in the share menu.
- Sharing needs HTTPS, so on `http://192.168…` (phone on LAN to a dev machine) it falls back
  to saving the picture.

## After sending

Either option calls `onSent` → `POST /api/bills/:n/sent` → the bill shows **Sent**. The
screen shows "✓ Bill #N sent" and **Make a new bill**. If the bill is edited later, it shows
**Changed after sending** ([D019](../decisions/D019-draft-and-sent-status.md)).

## Customer page: `/b/<token>` (`src/PublicBill.jsx`)

- Fetches `/api/public/bills/<token>` (no PIN) and shows the bill sheet with the shop logo.
- **Call shop** (`tel:7678642241`), **Save picture** (the same `renderBillImage`) and
  **Download PDF** ([D024](../decisions/D024-customer-page-three-actions.md)).
- `downloadPdf(file, name)`:
  - Reads the JPEG and waits for `img.onload`. `img.decode()` hung in some browsers.
  - Redraws it on a white canvas, then embeds it as JPEG 0.9 in a jsPDF page 120 mm wide plus 8 mm margins.
  - The result is about 120–200 KB; embedding the PNG directly gave 2.7 MB.

## Payment QR on the bill

`InvoiceSheet` draws the chosen payment ([D025](../decisions/D025-payment-qr-in-settings.md)):
- `upi`: `upi://pay?pa=<id>&pn=<name>&am=<total>&cu=INR&tn=Bill N`, drawn as SVG (`QrCode.jsx`, `qrcode` library), with "Scan to pay ₹X".
- `qr`: the exact payload read from a photo.
- `image`: the stored photo (looked up from settings; disappears if it is removed there, [D027](../decisions/D027-bill-keeps-a-snapshot.md)).
