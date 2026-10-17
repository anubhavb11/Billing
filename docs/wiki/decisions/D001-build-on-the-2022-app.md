---
id: D001
title: "Build on the 2022 app; reuse the Firebase prototype's ideas, not its code"
type: decision
status: accepted
date: 2026-10-16
time-utc: "16:40"
decision-makers: [agent]
area: [history, architecture]
supersedes: []
superseded-by: []
related: [D002, D004]
evidence:
  - "agent 2026-10-16 16:41 (findings and plan)"
  - "PR #2"
code:
  - "src/ (whole app)"
  - "package.json"
last-verified: 2026-10-17
---

# D001 · Build on the 2022 app; reuse the Firebase prototype's ideas, not its code

> **Status:** accepted · **Decided by:** Agent, inside the founder's brief (shipped with the founder's OK) · **When:** 16 Oct 2026, 16:40 UTC

## Context and problem

The repo `anubhavb11/Billing` was a Create React App project from July 2022:

- `main`: the plain billing table (rows kept in the browser under `userOrder`), live on
  billingbansal.netlify.app since July 2022.
- `main-dev`: added a "Customer view" invoice with a Bansal Store header, an html2canvas
  screenshot-and-share button, and a Firebase prototype (PR #1, `main-dev-firebase`) with
  a Master View list. Live on billingdev.netlify.app; **this is what the father used**.
- `nightly`: a Tailwind experiment.

The agent found on 16 Oct 2026 that the Firebase database had been deactivated, so Save and
Master View on the father's site no longer worked (also stated in PR #2). It noted that the
prototype had no login (anyone could read the bills) and pulled in heavy libraries: bootstrap, mdbreact, reactstrap, easyinvoice,
react-toastify, use-react-screenshot and a pinned webpack 4.

## Considered options

| Option | Outcome |
|---|---|
| Rewrite in a new stack | Rejected: the founder asked for small changes to a screen the father already knows. |
| Revive Firebase | Rejected: the database was off, there was no access control, and the founder chose to drop Firebase (D004). |
| Keep the React app and extend it | **Chosen.** |

## Decision

Keep the React app and the father's familiar screen. Reuse the prototype's
*ideas* (customer fields, an all-bills list, the invoice) but none of its Firebase code or
UI libraries.

## Consequences

- The app stays on Create React App (`react-scripts` 5). The React team deprecated CRA in 2025. It still builds, but it is a long-term risk (see [open questions](../knowledge/open-questions.md)).
- The old `userOrder` browser key is still read once, so the father's half-typed bill carried over (D017).

## Confirmation

- `package.json` has `react-scripts` and no Firebase or Bootstrap packages.

## Revisit when

- CRA stops building on Netlify's Node version, or a dependency needs a security fix CRA can't take: move to Vite.

## More information

- **Code:** `src/ (whole app)`; `package.json`
- **Evidence:** [agent 2026-10-16 16:41 (findings and plan)](../sources/agent-proposals-2026-10-16.md) · PR [#2](https://github.com/anubhavb11/Billing/pull/2)
- **Related:** [D002 · Father first: mobile, one screen, change as little as possible](D002-father-first-minimal-change.md) · [D004 · Store bills in Neon Postgres; drop Firebase](D004-neon-postgres.md)
