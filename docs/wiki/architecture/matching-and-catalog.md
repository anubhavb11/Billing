---
type: architecture
title: Matching and catalog (fuzzy matching deep dive)
updated: 2026-10-17
last-verified: 2026-10-17
sources: [../../../src/normalize.mjs, ../../../src/catalog.js, ../../../netlify/lib/catalog.mjs, ../sources/research.md]
---

# Matching and catalog

How the app turns free-typed bills into **items** and **customers**, suggests them as chips,
and matches addresses however they were typed. Decisions:
[D038](../decisions/D038-chips-not-dropdowns.md) (chips),
[D040](../decisions/D040-inventory-from-bills-items-customers-tabs.md) (tabs),
[D041](../decisions/D041-cleanup-as-rules-bills-never-change.md) (rules),
[D042](../decisions/D042-catalog-built-on-read.md) (built on read),
[D043](../decisions/D043-customer-identity-key.md) (customer key),
[D044](../decisions/D044-fuzzy-matching-own-normaliser.md) (fuzzy matching).

## The problem (founder, 17 Oct 2026)

> "Most likely, the second time, instead of A A, he might type A135 once, or maybe A-135. We
> need to take care of things like this when we are doing this suggestion thing."

The same customer shows up as `A-135, Madhu Vihar Ln no. 8`, `A135 madhu vihar` and
`a 135 Madhu vihaar`. The same item shows up as `चीनी`, `चिनी` and `Sugar`.

## The approach: normalise, then tolerate small typos

The standard approach in address matching (libpostal's `expand_address`, HyperVerge's Indian
address matching, `indian-address-matcher`; see [research](../sources/research.md)) is to
**clean every address the same way, then compare the cleaned forms**, allowing a small edit
distance. `src/normalize.mjs` does exactly that in about 100 lines. It is imported by **both**
the browser (chips) and the server (grouping customers), so the two can never disagree.

### Step 1: `norm(s)`

Unicode NFC, lower-case, collapse whitespace, trim. Used for item keys and names.

### Step 2: `words(s)`

1. Replace anything that isn't a letter, mark or digit (`[^\p{L}\p{M}\p{N}]`) with a space.
   Unicode-aware, so Devanagari letters and matras survive.
2. Split where digits meet letters, in both directions: `A135` → `a 135`, `12B` → `12 b`.
3. Split on spaces.

### Step 3 (addresses only): `addressWords(s)`

- **Expand short forms**: ln→lane, rd→road, st→street, ngr/nagr→nagar, apt→apartment,
  apts→apartments, sec/sect→sector, blk→block, ph→phase, ext/extn→extension, mkt→market,
  clny→colony, opp→opposite, nr→near.
- **Drop filler words**: h, no, hno, house, flat, plot, number, num.

`addressKey(s)` = `addressWords(s).join(' ')`. Examples:

| Typed | addressKey |
|---|---|
| `A-135, Madhu Vihar Ln no. 8` | `a 135 madhu vihar lane 8` |
| `a135 madhu vihar lane 8` | `a 135 madhu vihar lane 8` |
| `H.No. 12B, Laxmi Ngr` | `12 b laxmi nagar` |
| `C-22, Rose Apts` | `c 22 rose apartments` |

### Step 4: `matchScore(typed, text, toWords)`

| Score | Rule | Example (typed → text) |
|---|---|---|
| 4 | The text's words, joined, **start with** the typed words joined | `a-1` → `A 135 Madhu Vihar` |
| 3 | **Every typed word starts some word** of the text, in any order | `madhu 135` |
| 2 | Same as 3, but a typed word of **3+ letters may be 1 edit off** (2 edits for 7+ letters), from a word or from its start | `madu vihar`, `vihaar` |
| 0 | No match | `C-9` |

`editDistance(a, b, max)` is Levenshtein over code points (so Hindi letters count as one
each), stopping early once over `max`.

## Chips: `src/catalog.js`

| Function | Rule |
|---|---|
| `suggestItems(items, typed)` | 2+ characters; score = best of name and all merged spellings; drop hidden; sort by score, then bills, then last sold; top 3 |
| `exactItem(items, typed)` | The item whose name or any spelling equals `norm(typed)`; used to fill the rate when he leaves the box |
| `suggestCustomers(customers, typed, field)` | **phone**: 3+ digits, substring of the phone's digits (score 4); **address**: `matchScore` with `addressWords`; **name**: `matchScore` with `words`. Drop hidden; sort by score, then bills, then recency; top 3 |

## Grouping: `netlify/lib/catalog.mjs` `buildCatalog(bills, rules)`

Bills are processed oldest first.

- **Items**: key = `follow(itemAliases, norm(name))`. Per key it counts spellings (as typed),
  spelling keys, details, the last rate, bills (once per bill) and the last sale. The name
  is the `itemNames` rename if any, else the most common spelling (on a tie, the spelling
  that first appeared most recently wins).
- **Customers**: own key = `customerKey({ phone, address, name })`:
  `p:<last 10 digits>` if 6+ digits, else `a:<addressKey>`, else `n:<norm(name)>`. Group key =
  `follow(customerAliases, ownKey)`. Per group: all own keys, latest non-empty name, phone and
  address, bills, total spent, last bill; then `customerEdits` are applied.
- `follow()` walks alias chains for at most 20 hops.

## Clean-up rules (`src/catalog.js`)

| Action | Rule change |
|---|---|
| Merge items | All picked keys alias to the one with the most bills (ties: most recent); anything already aliased to them is repointed; those keys leave `itemHidden` |
| Separate a spelling | Delete that alias |
| Rename | `itemNames[key] = name` |
| Hide / show | Toggle in `itemHidden` |
| Merge customers | Same as items, using `customerAliases` |
| Edit customer | `customerEdits[key] = { address, phone, name }` |
| Separate a customer | Delete that alias |

Rules are saved with `PUT /api/catalog/rules`, which returns the rebuilt catalog.

## Tests: `src/catalog.test.js`

These cover:
- at most 3 suggestions, in order, with hidden items left out;
- matching by merged spelling and the `चिनी → चीनी` typo;
- customers by address, phone and name;
- merge, separate, rename and hide;
- address variants: `A-135`, `A135`, `a 135`, `a-1`, `A 13`, `135`, `madhu 135`, `Madhu Vihar Lane No 8`;
- typos: `madu vihar`, `vihaar`;
- non-matches: `A 2` finds only Mehta, `b12` only Gupta, `C-9` nothing;
- server key equality.

**When the father reports a miss, add it here first.**

## Known limits

1. **Block letter `H` is dropped** as filler ("house"), so `H-12` and `12` get the same key.
   Rare in Madhu Vihar, but worth fixing if blocks are lettered H: only drop `h` when it is
   followed by `no`.
2. **`st` always means street** (not "saint" or "stage"), and `ph` always means phase.
3. **No transliteration**: `चीनी` and `cheeni` don't match; merge them in the Items tab.
   Devanagari addresses get no short-form expansion.
4. **Item matching doesn't drop units** (`sugar 1kg` vs `sugar`); details are a separate field.
5. **Phone matching is a digit substring**: `981` matches every number containing 981.
   That's fine for 3 chips.
6. **Customer key snapshots**: See bills uses the group's keys at click time ([D046](../decisions/D046-see-bills-by-customer-group.md)).

## Why not a library?

| Option | Verdict |
|---|---|
| Fuse.js / fuzzysort | Good fuzzy *ranking*, but no address normalisation (A-135 vs A135 is a tokenisation problem, not a typo), and the server needs identical keys for grouping |
| libpostal | The reference normaliser, but a C library with large data files and no practical serverless JS binding |
| indian-address-matcher | Python only |
| **Own module** | No dependency, shared by app and server, Unicode-aware, fully tested; **chosen** |
