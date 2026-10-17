---
id: D049
title: "Keep an LLM wiki of every decision in the repo"
type: decision
status: accepted
date: 2026-10-17
time-utc: "07:38"
decision-makers: [founder]
area: [process, docs]
supersedes: []
superseded-by: []
related: [D047]
evidence:
  - "chat 2026-10-17 07:38"
code:
  - "AGENTS.md"
  - "CLAUDE.md"
  - "docs/wiki/"
last-verified: 2026-10-17
---

# D049 · Keep an LLM wiki of every decision in the repo

> **Status:** accepted · **Decided by:** Founder · **When:** 17 Oct 2026, 07:38 UTC

## Context and problem

Two days of chat produced 49 decisions that existed only in a transcript.

## In the founder's words

> Make an LLM wiki for agents so that we know how we developed what we thought. … The future agents … can go back and see why this decision was taken, and then reflect on what we should do next. I need every decision to be recorded. I need every architectural decision to be recorded.
>
> — [founder chat](../sources/founder-chat-2026-10-16.md), 2026-10-17 07:38

## Decision

`docs/wiki/` follows the LLM-wiki pattern: immutable sources, agent-maintained pages, an
index and a log, maintained through ingest, query and lint. Decisions use a short ADR format.
`AGENTS.md` (and `CLAUDE.md`, which imports it) point every agent here first. See
[conventions](../conventions.md).

## Consequences

- Every change must update the wiki in the same PR (new decision, log entry, affected pages).

## More information

- **Code:** `AGENTS.md`; `CLAUDE.md`; `docs/wiki/`
- **Evidence:** [chat 2026-10-17 07:38](../sources/founder-chat-2026-10-16.md)
- **Related:** [D047 · Feature branch, demo on local, ship only on the founder's word](D047-branch-demo-ship-workflow.md)
