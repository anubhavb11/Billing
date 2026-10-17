---
type: operations
title: Runbook
updated: 2026-10-17
last-verified: 2026-10-17
---

# Runbook

Commands assume the repo root (`~/Documents/Billing` on the founder's Mac). Never paste
secret values into commands that end up in files, chats or this wiki.

## First-time local setup

```bash
npm install
cp .env.example .env        # then fill DATABASE_URL (local Postgres) and a test SHOP_PIN
createdb billing_dev        # if using local Postgres (Homebrew postgresql)
```
The API creates its tables on the first request ([D012](../decisions/D012-schema-on-first-request.md)).

## Run locally

| What | Command | URL |
|---|---|---|
| API | `npm run api` | http://localhost:8787 |
| App (dev, hot reload) | `npm start` | http://localhost:3000 (proxies `/api` to 8787) |
| App (production build) | `npm run build && npm run serve:build` | http://localhost:5050 |
| On a phone on the same Wi-Fi | open `http://<mac LAN IP>:3000` | Sharing pictures needs HTTPS, so Send falls back to Save picture |

Use the production build whenever pictures, CSS or the bundle matter ([testing](testing.md)).

## Check before asking to ship

```bash
CI=true npx react-scripts test --watchAll=false
CI=true npm run build
npm run wiki:lint
```

## Ship

See [release process](release-process.md). In short: the founder says "commit, push, merge";
open **one PR into `main-dev`** (`--base main-dev`); merge; confirm the bansalstore deploy is
`ready`. Never PR into `main` ([D050](../decisions/D050-one-live-site-main-dev-only.md)).

## Common tasks

| Task | How | Notes |
|---|---|---|
| Restore a deleted bill | In the Neon SQL editor: `update bills set deleted_at = null where bill_no = N;` | The founder runs it, or an agent with explicit OK |
| Find recent bills | `select bill_no, customer_name, total, status, created_at from bills where deleted_at is null order by bill_no desc limit 20;` | Read-only |
| Start numbering from 1 again | `truncate bills restart identity;` | **Erases every bill.** Only before real use, only with the founder's explicit OK |
| Reset clean-up rules | In the app, undo with Separate / Show; or `PUT /api/catalog/rules` with `{}` | `{}` clears **all** merges, renames, hides and edits |
| Give a delivery boy the app | Settings → Delivery people → his mobile number + Set PIN; tell him to open `bansalstore.netlify.app/d` | [D055](../decisions/D055-delivery-boy-page-own-pin.md) |
| Undo a wrong "Got it" | `update bills set payment_status = payment_status - 'handedOverAt' where bill_no = N;` | Founder's OK; [D052](../decisions/D052-cash-stays-with-delivery-boy-until-handover.md) |
| Change the PIN | The founder edits `SHOP_PIN` on both Netlify sites, then redeploys | [security](../architecture/security-and-privacy.md#if-the-pin-may-have-leaked) |
| Copy env vars between sites | `netlify env:clone --from <site> --to <site>` (CLI logged in as the founder) | Names only in logs |
| Check which code is live | see [deployment](../architecture/deployment-and-environments.md#checking-a-deploy) | |
| Roll back a bad deploy | Netlify UI → Deploys → pick the previous deploy → **Publish deploy**. Then `git revert` the merge on that branch | Publishing an older deploy needs no rebuild (check Netlify's current credit rules); the revert's deploy costs credits like any deploy |
| Father sees an old version | Close and reopen the app (or pull to refresh) | No service worker caches the app |

## When something breaks

| Symptom | Likely cause | Check |
|---|---|---|
| Every save says "Wrong PIN" | `SHOP_PIN` changed or missing on that site | Netlify env vars for that site |
| "Server error" on every call | `DATABASE_URL` wrong, or Neon over quota or paused | Netlify function logs; Neon dashboard |
| First save slow (a few seconds) | Neon waking from sleep | Normal |
| New route returns 404 on Netlify but works locally | Route missing from `config.path` | `netlify/functions/bills.mjs` |
| Customer picture unstyled or blank | Picture code changed and was only tested on the dev server | Reproduce on `npm run serve:build` ([lessons](../knowledge/lessons-learned.md)) |
| "Site not available" on both sites | Netlify credits used up | Netlify billing; wait for reset or upgrade (founder's call) |
| Build fails on Netlify with lint errors | Someone set `CI=true` in the build | `netlify.toml` ([D016](../decisions/D016-netlify-build-command.md)) |
