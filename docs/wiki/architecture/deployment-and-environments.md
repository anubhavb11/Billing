---
type: architecture
title: Deployment and environments
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../netlify.toml, ../decisions/D008-own-neon-not-netlify-database.md, ../decisions/D050-one-live-site-main-dev-only.md]
---

# Deployment and environments

## Environments

| Environment | URL | Branch | Database | Who uses it |
|---|---|---|---|---|
| **Father's site** | https://bansalstore.netlify.app | `main-dev` | Neon (shared) | The father (his live site) |
| ~~Check site~~ | ~~billingbansal.netlify.app~~ | `main` | — | **Deleted 17 Oct 2026**; branch `main` deleted too ([D050](../decisions/D050-one-live-site-main-dev-only.md)) |
| Deploy Previews | `deploy-preview-N--<site>.netlify.app` | PR branches | Neon (shared, if the env vars apply to previews) | Optional checks |
| Local dev | http://localhost:3000 (+ API :8787) | any | local Postgres `billing_dev` or a Neon branch | Agents and the founder |
| Local production build | http://localhost:5050 (static server proxying `/api` to :8787) | any | same as local | Picture and style checks ([D030](../decisions/D030-bill-picture-html-to-image.md)) |

Both Netlify sites are in the founder's Netlify account (`anubhavb11`), connected to
`github.com/anubhavb11/Billing`, and publish production on every push to their branch.
Retired: `billingdev.netlify.app` was renamed to bansalstore on 16 Oct 2026, with no redirect
([D029](../decisions/D029-site-name-bansalstore.md)). The founder's separate inventory site
now lives at `bansalstore-inventory.netlify.app`.

## Environment variables (names only, never values)

| Name | Where | Purpose |
|---|---|---|
| `DATABASE_URL` | Both Netlify sites; local `.env` | Neon connection string (the pooled one was recommended; local: Postgres URL) |
| `NETLIFY_DATABASE_URL` | Not set (per the agent's env check, 16 Oct) | Used instead of `DATABASE_URL` if Netlify Database is ever attached |
| `SHOP_PIN` | Both Netlify sites; local `.env` | The shop PIN (6+ digits). Change it on **both** sites together |
| `REACT_APP_SITE_URL` | Set in the build command from Netlify's `$URL`; local `.env` optional | Absolute URL of `og-image.png` for link previews |
| `API_PORT` | Local only, optional | Local API port (default 8787) |

`.env.example` lists the local ones, and `.env` is git-ignored. **The founder sets the Netlify
values themselves** ([D048](../decisions/D048-agent-access-and-secrets.md)). Agents may copy
them between sites with `netlify env:clone` when asked, and may list names with
`netlify env:list`, but must not print values.

## Build (`netlify.toml`)

```toml
[build]
  command = "CI= REACT_APP_SITE_URL=$URL npm run build"   # lint warnings don't fail a deploy (D016)
  publish = "build"
[functions]
  directory = "netlify/functions"
[[redirects]]
  from = "/b/*"            # customer bill links are served by the app (D015)
  to = "/index.html"
  status = 200
```
`netlify.toml` overrides the build command set in the Netlify UI. The agent saw a Node 16
warning in Netlify's build on 16 Oct 2026; the build works. Pinning a current LTS is in the
[backlog](../product/ideas-and-backlog.md).

## Functions

- One function, `netlify/functions/bills.mjs`, with explicit routes in `config.path`. The
  bundler inlines `netlify/lib/*` and `src/normalize.mjs`.
- Runs in Netlify's default functions region (US East, AWS). The agent recommended creating the
  Neon project in AWS US East too, to keep latency low. The regions actually in use weren't
  confirmed in chat; check the Netlify and Neon dashboards ([D008](../decisions/D008-own-neon-not-netlify-database.md)).
- Neon sleeps after about 5 idle minutes, so the first request can take a few seconds. The
  pool's connect timeout is 10 s.

## Cost and limits (as read on 16 Oct 2026, so re-check)

- **Netlify credit-based Free plan**: 300 credits a month with a **hard stop**. When the
  credits run out, every site on the account shows "Site not available" until the month
  resets. A production deploy costs about 15 credits, so ship in batches, not one line at a time.
- **Neon Free**: about 100 compute-hours a month per project, scale-to-zero. If it runs out,
  only saving stops; pages still load.
- This is why the database is the founder's own Neon project and not Netlify Database
  ([D008](../decisions/D008-own-neon-not-netlify-database.md)).

## Checking a deploy

```bash
# Latest deploy per site (Netlify CLI logged in as the founder's account)
netlify api listSiteDeploys --data '{"site_id":"<site id>","per_page":1}'
# Which bundle is live?
curl -s https://bansalstore.netlify.app/ | grep -o 'static/js/main\.[a-z0-9]*\.js'
# API is up and protected (expect 401)
curl -s -o /dev/null -w '%{http_code}\n' https://bansalstore.netlify.app/api/catalog
```
Site ids are shown by `netlify sites:list`. The release steps are in
[release process](../operations/release-process.md).
