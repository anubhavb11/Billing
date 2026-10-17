---
id: D011
title: "Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad"
type: decision
status: accepted
date: 2026-10-16
time-utc: "17:00"
decision-makers: [agent]
area: [ux, frontend]
supersedes: []
superseded-by: []
related: [D002, D018]
evidence:
  - "agent 2026-10-16 16:41 (plan)"
  - "agent 2026-10-16 17:00 (changes from the plan)"
  - "commit afa353f"
code:
  - "src/App.css"
  - "src/Billing.jsx"
  - "src/bill.js (cleanNumber)"
  - "src/format.js"
last-verified: 2026-10-17
---

# D011 · Phone-fit rules: 360px with no sideways scroll, 16px inputs, number keypad

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 17:00 UTC

## Context and problem

On a 375px phone the Rate and Amount columns were off-screen. There were also bugs:
Clear didn't empty the screen, totals dropped decimals (0.5 × 15 showed 7), and Delete sat
outside the table.

## Considered options

| Option | Outcome |
|---|---|
| Pin the total to the bottom | Proposed, then dropped after testing (keyboard overlap). |
| Total under the table | **Chosen.** |

## Decision

- The bill fits a **360px** screen with no sideways scroll; on a computer the app is centred at up to 720px.
- Inputs are **16px**, so iPhones don't zoom in. Qty and Rate open the number keypad and accept only digits and one dot.
- **Enter** moves to the next box.
- The **Total stays under the table**, not pinned to the screen bottom: on Android a pinned bar sits above the keyboard and covers the row being typed.
- Money keeps decimals and uses Indian grouping (₹1,250.50).

## Consequences

- The Item box became narrow (about 10 characters at 360px). Fixed by wrapping in D018.

## Confirmation

- In the browser at 360px, `document.documentElement.scrollWidth` is 360; tests `cleanNumber keeps digits and one dot`, `total adds decimal amounts`.

## Revisit when

- The father's phone is narrower than 360px, or he enlarges the system font.

## More information

- **Code:** `src/App.css`; `src/Billing.jsx`; `src/bill.js (cleanNumber)`; `src/format.js`
- **Evidence:** [agent 2026-10-16 16:41 (plan)](../sources/agent-proposals-2026-10-16.md) · [agent 2026-10-16 17:00 (changes from the plan)](../sources/agent-proposals-2026-10-16.md) · commit [`afa353f`](https://github.com/anubhavb11/Billing/commit/afa353f)
- **Related:** [D002 · Father first: mobile, one screen, change as little as possible](D002-father-first-minimal-change.md) · [D018 · Long item names wrap downward instead of scrolling sideways](D018-wrap-long-item-names.md)
