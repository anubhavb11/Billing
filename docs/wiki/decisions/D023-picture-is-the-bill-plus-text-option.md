---
id: D023
title: "The bill picture is the bill, and a text bill to the number is also offered"
type: decision
status: accepted
date: 2026-10-16
time-utc: "18:23"
decision-makers: [founder]
area: [product, sending]
supersedes: []
superseded-by: []
related: [D030, D033, D034]
evidence:
  - "chat 2026-10-16 18:17"
  - "agent 2026-10-16 18:18"
  - "chat 2026-10-16 18:23"
  - "PR #8, #9"
code:
last-verified: 2026-10-17
---

# D023 · The bill picture is the bill, and a text bill to the number is also offered

> **Status:** accepted · **Decided by:** Founder · **When:** 16 Oct 2026, 18:23 UTC

## Context and problem

The father's old habit: tap View, take a screenshot and share the picture on
WhatsApp. At 18:17 the founder asked for the picture only, and the agent began removing the
text option. Six minutes later the founder asked for **both**: the picture, and a text bill
with the link sent straight to the customer's number.

## In the founder's words

> I don't want to send text as a bill. I want to send that image, the beautiful image that we have built, as a bill. … We should have both options.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-16 18:17, 2026-10-16 18:23

## Considered options

| Option | Outcome |
|---|---|
| Picture only | Built locally at 18:18 (agent message), never shipped; reversed by the founder at 18:23. |
| Both | **Chosen.** |

## Decision

Keep two ways to send: (1) straight to the customer's WhatsApp number as a text bill
with the link, and (2) the bill picture through the phone's share menu, with the customer
picked in WhatsApp. The final shape of the screen is D033.

## Consequences

- A website can't put a picture straight into one WhatsApp chat. `wa.me` links carry text only, so the picture always goes through the share menu and the father picks the chat himself.

## More information

- **Evidence:** [chat 2026-10-16 18:17](../sources/founder-chat-2026-10-16.md) · [agent 2026-10-16 18:18](../sources/agent-proposals-2026-10-16.md) · [chat 2026-10-16 18:23](../sources/founder-chat-2026-10-16.md) · PR [#8](https://github.com/anubhavb11/Billing/pull/8), [#9](https://github.com/anubhavb11/Billing/pull/9)
- **Related:** [D030 · The browser draws the bill picture with html-to-image; pictures are always checked on a production build](D030-bill-picture-html-to-image.md) · [D033 · View & Send: the exact picture, then exactly two ways to send](D033-view-and-send-two-options.md) · [D034 · On iPhone the picture is shared alone; on Android it carries the link as a caption](D034-iphone-picture-without-caption.md)
