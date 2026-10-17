---
id: D034
title: "On iPhone the picture is shared alone; on Android it carries the link as a caption"
type: decision
status: accepted (unverified on a real iPhone)
date: 2026-10-16
time-utc: "18:29"
decision-makers: [agent]
area: [sending]
supersedes: []
superseded-by: []
related: [D033]
evidence:
  - "commit 5b5b876"
code:
  - "src/share.js (isIPhone, shareFile, pictureCaption)"
last-verified: 2026-10-17
---

# D034 · On iPhone the picture is shared alone; on Android it carries the link as a caption

> **Status:** accepted (unverified on a real iPhone) · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 18:29 UTC

## Context and problem

On iPhone, WhatsApp drops the picture or sends it separately when text is shared with
it.

## Decision

`shareFile` adds the caption ("Bansal Store · Bill #N" and the link) only when the
device isn't an iPhone or iPad.

## Consequences

- iPhone customers don't get the link with the picture. The WhatsApp text option includes it.

## Confirmation

- Test `picture goes with the link on Android, alone on iPhone`.

## Revisit when

- Test on a real iPhone. If WhatsApp keeps both, drop the special case.

## More information

- **Code:** `src/share.js (isIPhone, shareFile, pictureCaption)`
- **Evidence:** commit [`5b5b876`](https://github.com/anubhavb11/Billing/commit/5b5b876)
- **Related:** [D033 · View & Send: the exact picture, then exactly two ways to send](D033-view-and-send-two-options.md)
