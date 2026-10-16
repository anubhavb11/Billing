// Bill helpers shared by the billing screen and the bills list.

export const MIN_ROWS = 5;
const DRAFT_KEY = 'billDraft';
const LEGACY_KEY = 'userOrder';

let nextRowId = 1;
const rowId = () => `row-${nextRowId++}`;

export const emptyRow = () => ({ id: rowId(), name: '', description: '', qty: '', rate: '', amount: '' });

const round2 = (n) => Math.round(n * 100) / 100;

// Keeps only digits and one dot (and a leading minus when allowed), so the
// phone keypad can't put letters or "1.2.3" into qty/rate.
export function cleanNumber(value, allowNegative = false) {
  let v = String(value).replace(allowNegative ? /[^0-9.-]/g : /[^0-9.]/g, '');
  if (allowNegative) v = (v.startsWith('-') ? '-' : '') + v.replace(/-/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) v = v.slice(0, dot + 1) + v.slice(dot + 1).replace(/\./g, '');
  return v;
}

export function lineAmount(qty, rate) {
  if (qty === '' || rate === '' || qty == null || rate == null) return '';
  const q = Number(qty);
  const r = Number(rate);
  return Number.isFinite(q) && Number.isFinite(r) ? round2(q * r) : '';
}

export const withAmount = (row) => ({ ...row, amount: lineAmount(row.qty, row.rate) });

export const rowHasContent = (row) =>
  [row.name, row.description, row.qty, row.rate].some((v) => String(v ?? '').trim() !== '');

export const billTotal = (items) =>
  round2(items.reduce((sum, row) => sum + (typeof row.amount === 'number' ? row.amount : 0), 0));

const asText = (v) => (v == null ? '' : String(v));

export function padRows(items) {
  const rows = (Array.isArray(items) ? items : []).map((item) =>
    withAmount({
      id: rowId(),
      name: asText(item?.name),
      description: asText(item?.description),
      qty: asText(item?.qty),
      rate: asText(item?.rate),
    })
  );
  while (rows.length < MIN_ROWS) rows.push(emptyRow());
  return rows;
}

const draftKey = () => `new-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const newDraft = () => ({
  key: draftKey(),
  billNo: null,
  createdAt: null,
  updatedAt: null,
  status: null,
  sentAt: null,
  shareToken: null,
  payment: null, // payment QR picked for this bill (see settings.js)
  delivery: null, // delivery person picked for this bill
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  items: padRows([]),
  dirty: false,
  rev: 0,
});

export const draftFromBill = (bill) => ({
  key: `bill-${bill.billNo}`,
  billNo: bill.billNo,
  createdAt: bill.createdAt,
  updatedAt: bill.updatedAt,
  status: bill.status,
  sentAt: bill.sentAt,
  shareToken: bill.shareToken ?? null,
  payment: bill.payment ?? null,
  delivery: bill.delivery ?? null,
  customerName: bill.customerName || '',
  customerPhone: bill.customerPhone || '',
  customerAddress: bill.customerAddress || '',
  items: padRows(bill.items),
  dirty: false,
  rev: 0,
});

const blank = (v) => v === '' || v == null;

// Rows that have an item but no qty or rate yet (a draft waiting for rates).
export const missingRates = (items) =>
  items.filter((row) => rowHasContent(row) && (blank(row.qty) || blank(row.rate))).length;

// The bill on screen in the same shape the server returns, for the invoice and sharing.
export const draftAsBill = (draft) => ({
  billNo: draft.billNo,
  createdAt: draft.createdAt,
  updatedAt: draft.updatedAt,
  status: draft.status,
  sentAt: draft.sentAt,
  shareToken: draft.shareToken,
  payment: draft.payment ?? null,
  delivery: draft.delivery ?? null,
  customerName: draft.customerName,
  customerPhone: draft.customerPhone,
  customerAddress: draft.customerAddress,
  items: draft.items.filter(rowHasContent),
  total: billTotal(draft.items),
});

// Sent bills edited afterwards need sending again.
export const changedSinceSent = (bill) =>
  bill.status === 'sent' && bill.sentAt && bill.updatedAt && new Date(bill.updatedAt) > new Date(bill.sentAt);

export const hasUnsavedWork = (draft) =>
  draft.dirty &&
  (draft.items.some(rowHasContent) ||
    [draft.customerName, draft.customerPhone, draft.customerAddress].some((v) => v.trim() !== ''));

export const billPayload = (draft) => ({
  payment: draft.payment ?? null,
  delivery: draft.delivery ?? null,
  customerName: draft.customerName,
  customerPhone: draft.customerPhone,
  customerAddress: draft.customerAddress,
  items: draft.items
    .filter(rowHasContent)
    .map(({ name, description, qty, rate }) => ({ name, description, qty, rate })),
});

// The bill on screen survives a refresh. Bills typed before this version were
// kept under "userOrder" (items only), so pick those up once.
export function loadDraft() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    if (saved && Array.isArray(saved.items)) {
      return { ...newDraft(), ...saved, key: saved.key || draftKey(), items: padRows(saved.items), rev: 0 };
    }
    const legacy = JSON.parse(localStorage.getItem(LEGACY_KEY));
    if (Array.isArray(legacy)) {
      const items = padRows(legacy);
      return { ...newDraft(), items, dirty: items.some(rowHasContent) };
    }
  } catch {
    // Unreadable storage: start a fresh bill.
  }
  return newDraft();
}

export function saveDraft(draft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or blocked: the bill still works, it just won't survive a refresh.
  }
}
