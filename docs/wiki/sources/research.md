---
type: source
title: External research notes
status: append-only
captured: 2026-10-17
---

# External research notes

What agents looked up on the web during the build, and what was concluded. Facts about
prices and limits are **as read on the date shown**, so re-check them before relying on them.

## R1: Netlify Database vs own Neon

*16 Oct 2026, 17:08–17:11 UTC*

Question: should the database be Netlify's built-in Neon ("Netlify Database") or a separate
Neon account? Led to [D008](../decisions/D008-own-neon-not-netlify-database.md).

- [Netlify Database: getting started](https://docs.netlify.com/build/data-and-storage/netlify-database/getting-started/), [API](https://docs.netlify.com/build/data-and-storage/netlify-database/api/), [switching to it](https://docs.netlify.com/build/data-and-storage/netlify-database/switch-to-netlify-database/): attached through the CLI (`netlify db`); the connection string comes as `NETLIFY_DATABASE_URL`.
- [Netlify Database billing](https://docs.netlify.com/build/data-and-storage/netlify-database/billing-and-usage/): usage is paid from the account's credits (about 10 credits per hour while awake, as read).
- [How Netlify credits work](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/): Free plan 300 credits a month; hard stop, and every site shows "Site not available" when they run out; a production deploy is about 15 credits.
- [Neon Free plan limits](https://neon.com/faqs/free-plan-limits-and-quotas): about 100 compute-hours per project per month, scale to zero after 5 minutes idle; separate from Netlify billing.

Conclusion: use a separate free Neon project so database use can never take the sites offline.

## R2: Fuzzy address matching

*17 Oct 2026, 07:17 UTC*

Question (founder): "Maybe search on the internet. There might be this thing that must have
been already solved by someone." Led to [D044](../decisions/D044-fuzzy-matching-own-normaliser.md).

- [HyperVerge: Indian address matching](https://hyperverge.co/blog/address-match-onboarding-ai-india/): treats "12-B, Lakshmi Nagar" and "12B, Laxmi Ngr" as equal through normalisation plus fuzzy matching; house numbers appear as "H NO 17", "Flat 2B" and so on. A product write-up, not a reusable library.
- [indian-address-matcher (PyPI)](https://pypi.org/project/indian-address-matcher/): Python. Lower-cases, strips punctuation, extracts components, scores with a threshold.
- libpostal ([openvenues/libpostal](https://github.com/openvenues/libpostal)): C library; `expand_address` produces normalised variants. No practical serverless JS binding.
- [GeoPostcodes: address matching guide](https://www.geopostcodes.com/blog/address-matching/): normalise, then compare.
- [Fuse.js](https://github.com/krisk/Fuse) and [fuzzysort](https://github.com/farzher/fuzzysort): JS fuzzy-search libraries, about 5–9 kB, good at ranking typos in a list, with no address normalisation.

Conclusion: the common recipe is **normalise every address the same way, then compare with
a small edit distance**. Separate letters from digits so `A135` = `A-135`, expand short
forms, drop filler like "H.No.". Implemented in `src/normalize.mjs`, shared by the app and
the server.

## R3: How to build an LLM wiki for agents

*17 Oct 2026, 07:39 UTC*

Question (founder): "go to the internet, and see if there are any other things that we need
to add." Shaped [conventions.md](../conventions.md) and [D049](../decisions/D049-keep-an-llm-wiki.md).

- **Karpathy's LLM Wiki** ([gist, 4 Apr 2026](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f)). Three layers: raw sources (never edited), the wiki (LLM-written pages) and a schema (`CLAUDE.md`/`AGENTS.md`). `index.md` is a catalog read first; `log.md` is append-only with entries like `## [YYYY-MM-DD] ingest | Title`. Operations: **ingest** (one source may touch 10–15 pages), **query** (answer from the index; file good answers back), **lint** (contradictions, stale claims, orphans, missing pages and links). The index beats embeddings up to roughly 100 sources. Follow-up: ["LLM Wiki v2"](https://gist.github.com/rohitg00/2067ab416f7bbe447c1977edaaa681e2) adds supersession links, typed relations, confidence and privacy filtering on ingest.
- **Architecture Decision Records**:
  - [Nygard 2011](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions): Title, Context, Decision, Status, Consequences. Numbered and never reused; superseded records are kept.
  - [MADR 4.0](https://adr.github.io/madr/) ([template](https://raw.githubusercontent.com/adr/madr/4.0.0/template/adr-template.md)): frontmatter `status`, `date`, `decision-makers`, `consulted`, `informed`. Sections: Context and Problem Statement, Decision Drivers, Considered Options, Decision Outcome (Consequences, **Confirmation**), Pros and Cons, More Information.
  - [adr-tools](https://github.com/npryce/adr-tools) and [Henderson's ADR guide](https://github.com/joelparkerhenderson/architecture-decision-record): one decision per record; supersede, don't rewrite.
- **AGENTS.md / CLAUDE.md**:
  - [agents.md](https://agents.md/): plain markdown, the nearest file wins.
  - [Claude Code memory docs](https://code.claude.com/docs/en/memory): use `@AGENTS.md` inside `CLAUDE.md`; keep files under ~200 lines.
  - [GitHub's study of 2,500 AGENTS.md files](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/): commands early; **Always / Ask first / Never** boundaries; "never commit secrets" is the most useful rule.
  - An [ETH Zurich study](https://arxiv.org/abs/2602.11988) found generic overviews don't help agents much; non-obvious practices do. So AGENTS.md here is a short map, and the detail lives in the wiki.
- **llms.txt** ([llmstxt.org](https://llmstxt.org/)): meant for websites; not needed inside a repo (see [conventions](../conventions.md#why-not-llmstxt-or-a-vector-store)).
- **Often forgotten**, all added here:
  - an [invariants](../knowledge/invariants.md) list with checks
  - [rejected options](../decisions/README.md) recorded in each decision
  - a [glossary](../knowledge/glossary.md)
  - [runbooks](../operations/runbook.md) naming env vars without values
  - [gotchas](../knowledge/lessons-learned.md)
  - [open questions](../knowledge/open-questions.md)
  - frontmatter with `last-verified`
  - a lint script
  - scrubbing secrets from sources

## R4: Live location, free maps and free-plan costs

*17 Oct 2026, 08:33 UTC*

Question: can the customer see where the delivery boy is, for free, without hurting the free
plans? Led to [D056](../decisions/D056-live-map-while-on-the-way.md) and [D058](../decisions/D058-refresh-only-while-on-screen.md).

- [Netlify credits](https://docs.netlify.com/manage/accounts-and-billing/billing/billing-for-credit-based-plans/how-credits-work/):
  - production deploy 15 credits;
  - compute 10 credits per GB-hour;
  - web requests 2 credits per 10,000;
  - bandwidth 20 credits per GB;
  - Deploy Previews 0;
  - Free plan 300 a month, hard stop (all sites paused).
- [Neon Free plan](https://neon.com/faqs/free-plan-limits-and-quotas): 100 CU-hours per project per month, scale to zero after 5 idle minutes (can't be turned off). When used up, compute is suspended until next month.
- [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/): free tiles for light use with visible credit; heavy use or bulk downloading can be blocked.
- Browser location ([forum reports](https://forum.ionicframework.com/t/pwa-geolocation-watchposition-pauses/231595), older W3C threads): `watchPosition` stops when the screen is off or the tab is hidden. The Screen Wake Lock API only works for a visible page. Background tracking needs a native app.

Conclusion:
- **Live location from a web page works only while the page is open.**
- **Constant updates would keep Neon awake all shop hours**, about 90 of its 100 hours.
- So the agent recommended status steps only. The founder chose a live map, built to send and refresh only during a delivery and only while the page is on screen.

## How to add research

Add a new `## R<n>: topic` section, with the date and time (UTC) in italics under it, and the question, the sources (links),
the facts that mattered, and the conclusion and its decision link. Don't edit older sections
except to add a dated "Update:" line.
