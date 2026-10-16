import { DEFAULT_FILTERS, filterBills } from './billsFilter';

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
