import { DEFAULT_FILTERS, filterBills, itemPreview } from './billsFilter';

const now = new Date(2026, 9, 16, 18, 0); // 16 Oct 2026, 6 pm local
const at = (day, hour) => new Date(2026, 9, day, hour).toISOString();
const bill = (billNo, createdAt, extra = {}) => ({
  billNo,
  createdAt,
  customerName: '',
  customerPhone: '',
  customerAddress: '',
  items: [{ name: 'Rice', description: '', qty: 1, rate: 10, amount: 10 }],
  total: 10,
  ...extra,
});

const bills = [
  bill(1, at(1, 10), { customerName: 'Sunita', total: 500 }),
  bill(2, at(10, 12), { customerName: 'amit', customerPhone: '98765 43210', total: 50 }),
  bill(3, at(15, 20), { customerName: 'Bharat', total: 1200 }),
  bill(4, at(16, 9), { total: 75, items: [{ name: 'Mustard oil', description: '1L' }] }),
];

const run = (changes) => filterBills(bills, { ...DEFAULT_FILTERS, ...changes }, now).map((b) => b.billNo);

test('newest first by default', () => {
  expect(run({})).toEqual([4, 3, 2, 1]);
});

test('date ranges', () => {
  expect(run({ range: 'today' })).toEqual([4]);
  expect(run({ range: 'yesterday' })).toEqual([3]);
  expect(run({ range: '7d' })).toEqual([4, 3, 2]);
  expect(run({ range: 'month' })).toEqual([4, 3, 2, 1]);
  expect(run({ range: 'custom', from: '2026-10-10', to: '2026-10-15' })).toEqual([3, 2]);
});

test('search by name, phone digits, item and bill number', () => {
  expect(run({ q: 'AMIT' })).toEqual([2]);
  expect(run({ q: '9876543' })).toEqual([2]);
  expect(run({ q: 'mustard' })).toEqual([4]);
  expect(run({ q: '#3' })).toEqual([3]);
});

test('sorts', () => {
  expect(run({ sort: 'oldest' })).toEqual([1, 2, 3, 4]);
  expect(run({ sort: 'total-desc' })).toEqual([3, 1, 4, 2]);
  expect(run({ sort: 'name' })).toEqual([2, 3, 1, 4]);
});

test('status filter and item preview', () => {
  const withStatus = bills.map((b) => ({ ...b, status: b.billNo % 2 ? 'sent' : 'draft' }));
  const ids = (status) => filterBills(withStatus, { ...DEFAULT_FILTERS, status }, now).map((b) => b.billNo);
  expect(ids('draft')).toEqual([4, 2]);
  expect(ids('sent')).toEqual([3, 1]);
  expect(ids('all')).toEqual([4, 3, 2, 1]);
  const many = { items: ['A', 'B', 'C', 'D'].map((name) => ({ name, description: '' })) };
  expect(itemPreview(many)).toBe('A, B +2 more');
});

test('bills of one customer, including merged-in phones and addresses', () => {
  const list = [
    bill(1, at(1, 10), { customerPhone: '98111 22233' }),
    bill(2, at(2, 10), { customerName: 'Test draft' }),
    bill(3, at(3, 10), { customerAddress: 'A-140, Madhu Vihar' }),
    bill(4, at(4, 10), { customerPhone: '+91 98111-22233', customerAddress: 'somewhere' }),
    bill(5, at(5, 10), { customerPhone: '98100 12345' }),
  ];
  const customer = { label: 'Verma ji', keys: ['p:9811122233', 'n:test draft', 'a:a 140 madhu vihar'] };
  const shown = filterBills(list, { ...DEFAULT_FILTERS, customer }, now).map((b) => b.billNo);
  expect(shown).toEqual([4, 3, 2, 1]);
});
