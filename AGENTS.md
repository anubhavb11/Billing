# Bansal Store billing app: agent guide

A phone-first billing app for a family kirana shop. The founder (repo owner) decides; agents
build. **Read [docs/wiki/index.md](docs/wiki/index.md) before changing anything.** It maps
every decision, why it was made, and what must not break.

## Commands

```bash
npm install
npm run api                    # local API on :8787 (needs .env: DATABASE_URL, SHOP_PIN)
npm start                      # app on :3000, proxies /api to :8787
CI=true npx react-scripts test --watchAll=false   # unit tests (40)
CI=true npm run build          # strict build; Netlify uses CI= so run this before shipping
npm run wiki:lint              # check the wiki's links, frontmatter and secrets
```

To test bill pictures or styles, run a **production build** with a static server that
proxies `/api` to :8787. The dev server hides CSS-loading bugs
([lesson](docs/wiki/knowledge/lessons-learned.md)).

## Map

- What and who: [docs/wiki/overview.md](docs/wiki/overview.md)
- Why it is built this way: [docs/wiki/decisions/README.md](docs/wiki/decisions/README.md) (49 decisions)
- How it works: [docs/wiki/architecture/overview.md](docs/wiki/architecture/overview.md)
- How to run, test and ship: [docs/wiki/operations/](docs/wiki/operations/runbook.md)
- What must not break: [docs/wiki/knowledge/invariants.md](docs/wiki/knowledge/invariants.md)
- What's next: [docs/wiki/product/ideas-and-backlog.md](docs/wiki/product/ideas-and-backlog.md)
- How to keep the wiki: [docs/wiki/conventions.md](docs/wiki/conventions.md)

## Always

- Design for the father's phone first: 360px wide, big text, everything he types on one
  screen ([principles](docs/wiki/product/vision-and-principles.md)).
- Make schema changes additive only. Two sites share one database and may run different code.
- Add every new API route to `config.path` in `netlify/functions/bills.mjs` as well as to `netlify/lib/bills-api.mjs`.
- Run the tests and `CI=true npm run build` before asking to ship.
- Update the wiki in the same change: new or superseded decision records, affected pages,
  a `log.md` entry ([conventions](docs/wiki/conventions.md#operations)).

## Ask the founder first

- Committing, pushing, opening or merging PRs (the workflow is in [release process](docs/wiki/operations/release-process.md)).
- Anything that changes what the father sees or how he types.
- Renaming sites, changing Netlify settings or environment variables, or spending Netlify credits.
- Deleting or rewriting bills or other shop data.

## Never

- Type, print or commit secrets (`DATABASE_URL`, `SHOP_PIN`). The founder sets them in Netlify. **This repo is public.**
- Rewrite item names or customer details inside saved bills. Clean-ups are rules ([D041](docs/wiki/decisions/D041-cleanup-as-rules-bills-never-change.md)).
- Send anything to customers' phones or WhatsApp while testing.
- Delete or rewrite a decision record. Supersede it instead.
