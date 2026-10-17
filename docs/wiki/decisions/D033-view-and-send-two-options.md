---
id: D033
title: "View & Send: the exact picture, then exactly two ways to send"
type: decision
status: accepted
date: 2026-10-16
time-utc: "19:12"
decision-makers: [founder]
area: [sending, ux]
supersedes: [D010]
superseded-by: []
related: [D023, D030, D034]
evidence:
  - "agent 2026-10-16 18:57 (plan)"
  - "agent 2026-10-16 19:10"
  - "chat 2026-10-16 19:12"
  - "PR #10, #11"
code:
  - "src/SendPage.jsx"
  - "src/share.js (waNumber, billText, waLink, shareFile)"
last-verified: 2026-10-17
---

# D033 · View & Send: the exact picture, then exactly two ways to send

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 19:12 UTC
> **Supersedes:** [D010](D010-keep-fathers-buttons.md)

## Context and problem

Earlier versions had a send sheet with two choices (PR #8), then a single "Send on
WhatsApp" screen (planned at 18:57, shown locally at 19:10, never shipped). The founder
found having to tap "Save Picture" first confusing.

## In the founder's words

> After clicking on View and Send, there should be two options: 1. If we have added the number, it should show that green WhatsApp button. I click on that, and I will send the good-formatted text bill with the link of the bill and the UPI, whatever we have. 2. Send a pic. … WhatsApp opens, you select the customer manually, and you send the image. Just those two flows.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 19:12

## Considered options

| Option | Outcome |
|---|---|
| Send sheet with two choices | Replaced. |
| One Send on WhatsApp button | Replaced the same evening. |
| Picture preview + two options | **Chosen.** |

## Decision

`#/send` shows the exact bill picture (made as soon as the screen opens), then:
1. **Green WhatsApp button** with the number, shown only when the bill has a valid number. It opens `wa.me/<number>?text=…` with a formatted text bill: items, total, delivery, UPI ID, the bill link and the shop's phone (`*bold*` for WhatsApp).
2. **Send picture**: the phone's share menu with the JPEG; he picks the customer.

Then the bill is marked Sent (the WhatsApp button on tap; Send picture once the share menu
reports success) and the screen shows "✓ Bill #N sent" with **Make a new bill**. If the phone
can't share pictures, the picture is saved instead. **Copy bill link** is also there.
`waNumber`: 10 digits get `91` added; 11 digits starting with 0 become `91…`; 11–13 digits
are used as they are.

## Consequences

- The WhatsApp button marks the bill Sent even if he doesn't send the message in WhatsApp.

## Confirmation

- Tests in `share.test.js`: `numbers get the India prefix`, `the message has items, total, delivery, UPI and the bill link`.

## More information

- **Code:** `src/SendPage.jsx`; `src/share.js (waNumber, billText, waLink, shareFile)`
- **Evidence:** [agent 2026-10-16 18:57 (plan)](../sources/agent-proposals-2026-10-16.md) · [agent 2026-10-16 19:10](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-16 19:12](../sources/founder-chat-2026-10-16.md) · PR [#10](https://github.com/anubhavb11/Billing/pull/10), [#11](https://github.com/anubhavb11/Billing/pull/11)
- **Related:** [D023 · The bill picture is the bill, and a text bill to the number is also offered](D023-picture-is-the-bill-plus-text-option.md) · [D030 · The browser draws the bill picture with html-to-image; pictures are always checked on a production build](D030-bill-picture-html-to-image.md) · [D034 · On iPhone the picture is shared alone; on Android it carries the link as a caption](D034-iphone-picture-without-caption.md)
