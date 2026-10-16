import { rowHasContent } from './bill';

export const DEFAULT_FILTERS = { q: '', status: 'all', range: 'all', from: '', to: '', sort: 'newest' };

export const STATUSES = [
  ['all', 'All'],
  ['draft', 'Drafts'],
  ['sent', 'Sent'],
];

export const RANGES = [
  ['all', 'Any date'],
  ['today', 'Today'],
  ['yesterday', 'Yesterday'],
  ['7d', 'Last 7 days'],
  ['month', 'This month'],
  ['custom', 'Pick dates…'],
];

export const isDraft = (bill) => bill.status !== 'sent';

export const SORTS = [
  ['newest', 'Newest first'],
  ['oldest', 'Oldest first'],
  ['total-desc', 'Highest total'],
  ['total-asc', 'Lowest total'],
  ['name', 'Name A–Z'],
];

const DAY = 24 * 60 * 60 * 1000;
const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
// "2026-10-16" from a date input, read as local midnight.
const fromInput = (s) => (s ? new Date(`${s}T00:00`) : null);

function dateWindow({ range, from, to }, now) {
  const today = startOfDay(now);
  switch (range) {
    case 'today':
      return [today, null];
    case 'yesterday':
      return [addDays(today, -1), today];
    case '7d':
      return [addDays(today, -6), null];
    case 'month':
      return [new Date(now.getFullYear(), now.getMonth(), 1), null];
    case 'custom': {
      const end = fromInput(to);
      return [fromInput(from), end ? new Date(end.getTime() + DAY) : null];
    }
    default:
      return [null, null];
  }
}

function matchesSearch(bill, q) {
  if (!q) return true;
  if (q.startsWith('#')) return String(bill.billNo) === q.slice(1).trim();
  const needle = q.toLowerCase();
  if (String(bill.billNo) === needle) return true;
  const digits = needle.replace(/\D/g, '');
  if (digits.length >= 3 && (bill.customerPhone || '').replace(/\D/g, '').includes(digits)) return true;
  const haystack = [
    bill.customerName,
    bill.customerPhone,
    bill.customerAddress,
    ...bill.items.flatMap((item) => [item.name, item.description]),
  ]
    .join('\n')
    .toLowerCase();
  return haystack.includes(needle);
}

const byNewest = (a, b) => new Date(b.createdAt) - new Date(a.createdAt) || b.billNo - a.billNo;

const SORTERS = {
  newest: byNewest,
  oldest: (a, b) => -byNewest(a, b),
  'total-desc': (a, b) => b.total - a.total || byNewest(a, b),
  'total-asc': (a, b) => a.total - b.total || byNewest(a, b),
  name: (a, b) => {
    const an = a.customerName.trim();
    const bn = b.customerName.trim();
    if (!an !== !bn) return an ? -1 : 1; // unnamed bills last
    return an.localeCompare(bn, 'en-IN', { sensitivity: 'base' }) || byNewest(a, b);
  },
};

export function filterBills(bills, filters, now = new Date()) {
  const [start, end] = dateWindow(filters, now);
  const q = filters.q.trim();
  return bills
    .filter((bill) => {
      const created = new Date(bill.createdAt);
      if (start && created < start) return false;
      if (end && created >= end) return false;
      if (filters.status === 'draft' && !isDraft(bill)) return false;
      if (filters.status === 'sent' && isDraft(bill)) return false;
      return matchesSearch(bill, q);
    })
    .sort(SORTERS[filters.sort] || byNewest);
}

export const itemCount = (bill) => bill.items.filter(rowHasContent).length;

// "अरहर दाल तूर, Mustard oil +2 more"
export function itemPreview(bill, shown = 2) {
  const names = bill.items.filter(rowHasContent).map((item) => item.name || item.description);
  const extra = names.length - shown;
  return names.slice(0, shown).join(', ') + (extra > 0 ? ` +${extra} more` : '');
}
