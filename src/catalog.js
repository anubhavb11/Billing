// Suggestions while typing a bill, and the clean-up actions of the Items /
// Customers tabs. The item and customer lists come from the server
// (netlify/lib/catalog.mjs), worked out from all bills plus these rules.
import { addressWords, matchScore, norm } from './normalize.mjs';

export { norm };

export const EMPTY_CATALOG = { items: [], customers: [] };
export const EMPTY_RULES = {
  itemAliases: {},
  itemNames: {},
  itemHidden: [],
  customerAliases: {},
  customerEdits: {},
  customerHidden: [],
};
const MAX_CHIPS = 3;
const CACHE_KEY = 'shopCatalog';

export function cachedCatalog() {
  try {
    const saved = JSON.parse(localStorage.getItem(CACHE_KEY));
    return saved?.catalog ? saved : { catalog: EMPTY_CATALOG, rules: EMPTY_RULES };
  } catch {
    return { catalog: EMPTY_CATALOG, rules: EMPTY_RULES };
  }
}

export function cacheCatalog(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Too big or blocked: fetched again next time.
  }
}

const digits = (s) => String(s ?? '').replace(/\D/g, '');

const byUse = (a, b) => b.bills - a.bills || new Date(b.lastAt) - new Date(a.lastAt);

// Up to 3 items for what he has typed (2+ letters), best match first, then
// most sold, then most recent. Merged spellings point to the cleaned-up item,
// and a small typo still matches ("चिनी" finds "चीनी").
export function suggestItems(items, typed) {
  if (norm(typed).length < 2) return [];
  return items
    .filter((item) => !item.hidden)
    .map((item) => ({
      item,
      s: Math.max(matchScore(typed, item.name), ...item.spellings.map((sp) => matchScore(typed, sp))),
    }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || byUse(a.item, b.item))
    .slice(0, MAX_CHIPS)
    .map(({ item }) => item);
}

// The item he typed in full (any of its spellings), for filling in its rate.
export const exactItem = (items, typed) => {
  const q = norm(typed);
  return q ? items.find((item) => !item.hidden && (norm(item.name) === q || item.spellingKeys?.includes(q))) : null;
};

// Up to 3 customers for the address / phone / name being typed. Addresses match
// however the house number was written ("A-135", "A135", "a 135") and with small
// typos ("madu vihar"); phones match on their digits.
export function suggestCustomers(customers, typed, field) {
  const d = digits(typed);
  if (field === 'phone' ? d.length < 3 : norm(typed).length < 2) return [];
  return customers
    .filter((c) => !c.hidden)
    .map((c) => {
      let s;
      if (field === 'phone') s = digits(c.phone).includes(d) ? 4 : 0;
      else if (field === 'address') s = matchScore(typed, c.address, addressWords);
      else s = matchScore(typed, c.name);
      return { c, s };
    })
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || byUse(a.c, b.c))
    .slice(0, MAX_CHIPS)
    .map(({ c }) => c);
}

// ---- Clean-up rules (Items / Customers tabs) ----

// Point every key in `from` (and anything already merged into them) at `to`.
function mergeAliases(aliases, from, to) {
  const next = { ...aliases };
  for (const [k, v] of Object.entries(next)) if (from.includes(v)) next[k] = to;
  for (const k of from) if (k !== to) next[k] = to;
  delete next[to];
  return next;
}

const withoutKeys = (list, keys) => list.filter((k) => !keys.includes(k));

// Merge items into the one with the most bills (its name is kept).
export function mergeItems(rules, items) {
  const target = [...items].sort(byUse)[0];
  const from = items.map((i) => i.key).filter((k) => k !== target.key);
  return {
    target,
    rules: {
      ...rules,
      itemAliases: mergeAliases(rules.itemAliases, from, target.key),
      itemHidden: withoutKeys(rules.itemHidden, from),
    },
  };
}

// Undo part of a merge: this spelling becomes its own item again.
export function separateSpelling(rules, spellingKey) {
  const itemAliases = { ...rules.itemAliases };
  delete itemAliases[spellingKey];
  return { ...rules, itemAliases };
}

export const renameItem = (rules, key, name) => ({ ...rules, itemNames: { ...rules.itemNames, [key]: name.trim() } });

export const toggleHideItem = (rules, key) => ({
  ...rules,
  itemHidden: rules.itemHidden.includes(key) ? withoutKeys(rules.itemHidden, [key]) : [...rules.itemHidden, key],
});

export function mergeCustomers(rules, customers) {
  const target = [...customers].sort(byUse)[0];
  const from = customers.map((c) => c.key).filter((k) => k !== target.key);
  return {
    target,
    rules: {
      ...rules,
      customerAliases: mergeAliases(rules.customerAliases, from, target.key),
      customerHidden: withoutKeys(rules.customerHidden, from),
    },
  };
}

export function separateCustomer(rules, key) {
  const customerAliases = { ...rules.customerAliases };
  delete customerAliases[key];
  return { ...rules, customerAliases };
}

export const editCustomer = (rules, key, fields) => ({
  ...rules,
  customerEdits: { ...rules.customerEdits, [key]: fields },
});

export const toggleHideCustomer = (rules, key) => ({
  ...rules,
  customerHidden: rules.customerHidden.includes(key)
    ? withoutKeys(rules.customerHidden, [key])
    : [...rules.customerHidden, key],
});
