// Items and customers, worked out from the bills themselves, plus the clean-up
// rules from the Items / Customers tabs (merge, rename, hide, edit). Bills are
// never changed: the rules only decide how they are grouped and named here.
//
// Rules:
//   itemAliases     { spellingKey: itemKey }      merged spellings -> the item they belong to
//   itemNames       { itemKey: "Name" }           renamed items
//   itemHidden      [itemKey]                     not suggested any more
//   customerAliases { customerKey: customerKey }  merged customers
//   customerEdits   { customerKey: { name, phone, address } }
//   customerHidden  [customerKey]

import { customerKey, norm } from "../../src/normalize.mjs";
import { khata } from "../../src/tracking.mjs";

export const EMPTY_RULES = {
  itemAliases: {},
  itemNames: {},
  itemHidden: [],
  customerAliases: {},
  customerEdits: {},
  customerHidden: [],
};

function follow(aliases, key) {
  let k = key;
  for (let i = 0; i < 20 && aliases[k] && aliases[k] !== k; i += 1) k = aliases[k];
  return k;
}

const mostCommon = (counts) => {
  let best = '';
  let top = 0;
  for (const [value, n] of counts) if (n >= top) [best, top] = [value, n]; // ties: latest wins
  return best;
};

const bump = (map, value) => map.set(value, (map.get(value) ?? 0) + 1);

// bills: [{ billNo, createdAt, customerName, customerPhone, customerAddress, total, items, paymentStatus }]
// payments: [{ id, customerKey, amount, method, at }] received against udhaar (khata)
export function buildCatalog(bills, rules, payments = []) {
  const r = { ...EMPTY_RULES, ...rules };
  const hiddenItems = new Set(r.itemHidden);
  const hiddenCustomers = new Set(r.customerHidden);
  const items = new Map();
  const customers = new Map();
  const sorted = [...bills].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  for (const bill of sorted) {
    const seen = new Set();
    for (const item of bill.items ?? []) {
      const name = String(item.name ?? '').trim();
      if (!name) continue;
      const spelling = norm(name);
      const key = follow(r.itemAliases, spelling);
      let agg = items.get(key);
      if (!agg) {
        agg = { key, spellings: new Map(), spellingKeys: new Set(), details: new Map(), bills: 0, rate: null, lastAt: null };
        items.set(key, agg);
      }
      bump(agg.spellings, name);
      agg.spellingKeys.add(spelling);
      if (String(item.description ?? '').trim()) bump(agg.details, String(item.description).trim());
      if (item.rate !== null && item.rate !== undefined && item.rate !== '') agg.rate = Number(item.rate);
      agg.lastAt = bill.createdAt;
      if (!seen.has(key)) {
        agg.bills += 1;
        seen.add(key);
      }
    }

    const ownKey = customerKey({ phone: bill.customerPhone, address: bill.customerAddress, name: bill.customerName });
    if (!ownKey) continue;
    const key = follow(r.customerAliases, ownKey);
    let c = customers.get(key);
    if (!c) {
      c = { key, keys: new Set(), name: '', phone: '', address: '', bills: 0, total: 0, lastAt: null, udhaar: [], paid: [] };
      customers.set(key, c);
    }
    c.keys.add(ownKey);
    if (bill.customerName?.trim()) c.name = bill.customerName.trim();
    if (bill.customerPhone?.trim()) c.phone = bill.customerPhone.trim();
    if (bill.customerAddress?.trim()) c.address = bill.customerAddress.trim();
    c.bills += 1;
    c.total += Number(bill.total) || 0;
    c.lastAt = bill.createdAt;
    if (bill.paymentStatus?.method === 'udhaar') {
      c.udhaar.push({ billNo: bill.billNo, total: Number(bill.total) || 0, createdAt: bill.createdAt });
    }
  }

  // Hisaab payments belong to whichever customer their key now points to (merges included).
  for (const p of payments) {
    const c = customers.get(follow(r.customerAliases, p.customerKey));
    if (c) c.paid.push({ id: p.id, amount: p.amount, method: p.method, at: p.at });
  }

  return {
    items: [...items.values()].map((agg) => ({
      key: agg.key,
      name: r.itemNames[agg.key] || mostCommon(agg.spellings),
      spellings: [...agg.spellings.keys()],
      spellingKeys: [...agg.spellingKeys],
      details: mostCommon(agg.details),
      rate: agg.rate,
      bills: agg.bills,
      lastAt: agg.lastAt,
      hidden: hiddenItems.has(agg.key),
    })),
    customers: [...customers.values()].map((c) => ({
      key: c.key,
      keys: [...c.keys],
      ...{ name: c.name, phone: c.phone, address: c.address },
      ...(r.customerEdits[c.key] ?? {}),
      bills: c.bills,
      total: Math.round(c.total * 100) / 100,
      lastAt: c.lastAt,
      hidden: hiddenCustomers.has(c.key),
      khata: c.udhaar.length || c.paid.length ? khata(c.udhaar, c.paid) : null,
    })),
  };
}

const isObj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const strMap = (v, max = 2000) =>
  Object.fromEntries(
    Object.entries(isObj(v) ? v : {})
      .filter(([k, val]) => typeof val === 'string' && k.length <= 200 && val.length <= 200)
      .slice(0, max)
  );
const strList = (v, max = 2000) =>
  (Array.isArray(v) ? v : []).filter((s) => typeof s === 'string' && s.length <= 200).slice(0, max);

export function parseRules(body) {
  if (!isObj(body)) throw new Error('Rules must be a JSON object.');
  const edits = {};
  for (const [k, v] of Object.entries(isObj(body.customerEdits) ? body.customerEdits : {}).slice(0, 2000)) {
    if (!isObj(v)) continue;
    const pick = (f, max) => (typeof v[f] === 'string' ? v[f].trim().slice(0, max) : undefined);
    edits[k] = Object.fromEntries(
      [
        ['name', pick('name', 120)],
        ['phone', pick('phone', 20)],
        ['address', pick('address', 300)],
      ].filter(([, val]) => val !== undefined)
    );
  }
  return {
    itemAliases: strMap(body.itemAliases),
    itemNames: Object.fromEntries(Object.entries(strMap(body.itemNames)).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)),
    itemHidden: strList(body.itemHidden),
    customerAliases: strMap(body.customerAliases),
    customerEdits: edits,
    customerHidden: strList(body.customerHidden),
  };
}
