---
type: schema
title: Wiki conventions
updated: 2026-10-17
last-verified: 2026-10-17
sources:
  - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f
  - https://adr.github.io/madr/
  - https://agents.md/
---

# How this wiki works

This is an **LLM wiki**: a set of markdown pages that agents write and keep up to date, so
the next agent (or person) knows what was decided, why, and what to do next. It follows
Andrej Karpathy's [LLM Wiki pattern](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f),
with decisions written in a short form of [MADR 4.0](https://adr.github.io/madr/).

## Three layers

| Layer | Where | Who changes it |
|---|---|---|
| **Raw sources** | [sources/](sources/) | Nobody. Never edited after capture; new sources are added as new files. |
| **Wiki pages** | everything else in `docs/wiki/` | Agents, on every change, as part of the same PR. |
| **Schema** | this page + [/AGENTS.md](../../AGENTS.md) | The founder and agents together, rarely. |

Two special files:
- [index.md](index.md) lists every page with a one-line summary. Read it first.
- [log.md](log.md) is append-only and chronological. Every entry starts
  `## [YYYY-MM-DD HH:MM] kind | title`, so `grep "^## \[" docs/wiki/log.md | tail` shows the
  latest. Kinds: `build`, `ship`, `decision`, `incident`, `ingest`, `query`, `lint`.

## Page types and folders

| Folder | Type | One page per… |
|---|---|---|
| `decisions/` | `decision` | decision (`DNNN-kebab-title.md`, numbers never reused) |
| `product/` | `product` | topic: principles, users, features, backlog |
| `architecture/` | `architecture` | part of the system |
| `operations/` | `operations` | task: run, test, release |
| `knowledge/` | `knowledge` | cross-cutting list: invariants, lessons, glossary, open questions |
| `sources/` | `source` | captured source (chat, research) |

Every page starts with YAML frontmatter: at least `type`, `title`, `updated` and
`last-verified` (the date someone last checked it against the code). Decisions add `id`,
`status`, `date`, `decision-makers`, `supersedes`, `superseded-by`, `related`, `evidence` and
`code`. See [decisions/_template.md](decisions/_template.md).

## Writing rules

1. **Plain, short sentences.** Name the file and function (`src/App.js` `saveNow`), not "the save logic".
2. **Say who decided.** `founder` (the owner asked or chose), `founder-accepted` (the agent proposed, the founder said yes), or `agent` (a technical call while building).
3. **Quote the founder exactly** when they gave a reason, and link the [chat source](sources/founder-chat-2026-10-16.md).
4. **Record rejected options** so nobody proposes them again without new facts.
5. **Never rewrite history.** Supersede a decision with a new one, then set `superseded-by` on the old one. Fix wrong *facts* in place and add a `log.md` line saying what changed.
6. **Times are UTC** (India is UTC+5:30). Commit times shown by git are the author's local time.
7. **Relative links only** (`../architecture/api.md`), so they work on GitHub and in any editor.
8. **No secrets or private data.** The repo is public. Name environment variables (`SHOP_PIN`), never their values. No connection strings, no PINs, no real customer details, no raw chat logs with tool output.

## Operations

### Ingest: after any change ships, or when a new source arrives

1. Add the source if there is one: a new file in `sources/` (scrub secrets first).
2. Add or supersede decision records for every choice made. Founder choices are decisions too.
3. Update the affected pages: features, architecture, invariants, runbook, backlog.
4. Append a `log.md` entry, and update `index.md` if pages were added.
5. Run `npm run wiki:lint`.

### Query: before answering "why is it like this?" or planning work

1. Read [index.md](index.md), then the pages it points to.
2. Answer from the wiki and cite the pages. If the wiki and the code disagree, the code is
   the truth: fix the wiki and say so in `log.md`.
3. If the answer is worth keeping (a comparison, an analysis), file it as a new page.

### Lint: before every PR, and whenever something looks stale

`npm run wiki:lint` (see `scripts/wiki-lint.mjs`) checks:
- relative links resolve, and every page is reachable from `index.md`;
- frontmatter exists, and decision IDs, supersede links and code paths are valid;
- no secret-looking strings.

By hand, also look for contradictions between pages, pages whose `last-verified` is old,
decisions whose "Revisit when" signal has happened, and topics that deserve their own page.

## Why not llms.txt or a vector store?

[llms.txt](https://llmstxt.org/) is for websites. Inside a repo, `index.md` plus
`AGENTS.md` do the same job. The wiki is small (well under 100 pages), so reading the index
beats embeddings, as Karpathy's gist notes.
