import {
  EMPTY_RULES,
  exactItem,
  mergeCustomers,
  mergeItems,
  renameItem,
  separateSpelling,
  suggestCustomers,
  suggestItems,
  toggleHideItem,
} from './catalog';

const item = (key, name, bills, extra = {}) => ({
  key,
  name,
  spellings: [name],
  spellingKeys: [key],
  details: '',
  rate: 10,
  bills,
  lastAt: '2026-10-17T10:00:00Z',
  hidden: false,
  ...extra,
});

const items = [
  item('चीनी', 'चीनी', 40, { spellings: ['चीनी', 'चिनी', 'Sugar'], spellingKeys: ['चीनी', 'चिनी', 'sugar'], rate: 48 }),
  item('चना दाल', 'चना दाल', 12),
  item('चाय पत्ती', 'चाय पत्ती', 25),
  item('चावल', 'चावल', 30),
  item('मूंग दाल', 'मूंग दाल', 8),
  item('old', 'चटनी', 50, { hidden: true }),
];

test('at most 3 suggestions, best match then most sold, hidden left out', () => {
  expect(suggestItems(items, 'च').length).toBe(0); // needs 2 letters
  expect(suggestItems(items, 'चा').map((i) => i.name)).toEqual(['चावल', 'चाय पत्ती']);
  expect(suggestItems(items, 'दाल').map((i) => i.name)).toEqual(['चना दाल', 'मूंग दाल']); // word starts
  expect(suggestItems(items, 'sug').map((i) => i.name)).toEqual(['चीनी']); // via a merged spelling
  expect(suggestItems(items, 'चट')).toEqual([]);
});

test('a fully typed item is found by any of its spellings', () => {
  expect(exactItem(items, '  Sugar ').name).toBe('चीनी');
  expect(exactItem(items, 'चीनी').rate).toBe(48);
  expect(exactItem(items, 'चीन')).toBeUndefined();
});

test('customers by address, phone or name', () => {
  const customers = [
    { key: 'p:9810012345', name: 'Sharma ji', phone: '98100 12345', address: 'A-135 Madhu Vihar', bills: 9, lastAt: '2026-10-16' },
    { key: 'a:b-12 lane 3', name: 'Gupta ji', phone: '', address: 'B-12 Lane 3', bills: 2, lastAt: '2026-10-15' },
    { key: 'p:9811122233', name: 'Verma ji', phone: '98111 22233', address: 'A-140 Madhu Vihar', bills: 1, lastAt: '2026-10-17' },
  ];
  expect(suggestCustomers(customers, 'a-1', 'address').map((c) => c.name)).toEqual(['Sharma ji', 'Verma ji']);
  expect(suggestCustomers(customers, 'madhu', 'address').length).toBe(2);
  expect(suggestCustomers(customers, '981', 'phone').map((c) => c.name)).toEqual(['Sharma ji', 'Verma ji']);
  expect(suggestCustomers(customers, '98', 'phone')).toEqual([]); // needs 3 digits
  expect(suggestCustomers(customers, 'gup', 'name').map((c) => c.name)).toEqual(['Gupta ji']);
});

test('merge keeps the most-sold name, and separate undoes one spelling', () => {
  const a = item('चीनी', 'चीनी', 40);
  const b = item('चिनी', 'चिनी', 3);
  const c = item('sugar', 'Sugar', 5);
  const { target, rules } = mergeItems(EMPTY_RULES, [b, a, c]);
  expect(target.key).toBe('चीनी');
  expect(rules.itemAliases).toEqual({ चिनी: 'चीनी', sugar: 'चीनी' });

  // merging the merged item into another moves its spellings along
  const d = item('शक्कर', 'शक्कर', 60);
  const again = mergeItems(rules, [{ ...a, bills: 48 }, d]).rules;
  expect(again.itemAliases).toEqual({ चिनी: 'शक्कर', sugar: 'शक्कर', चीनी: 'शक्कर' });

  expect(separateSpelling(rules, 'sugar').itemAliases).toEqual({ चिनी: 'चीनी' });
  expect(renameItem(rules, 'चीनी', ' Sugar (चीनी) ').itemNames).toEqual({ चीनी: 'Sugar (चीनी)' });
  expect(toggleHideItem(toggleHideItem(rules, 'x'), 'x').itemHidden).toEqual([]);
});

test('merging customers keeps the one with most bills', () => {
  const { target, rules } = mergeCustomers(EMPTY_RULES, [
    { key: 'a:a 135 madhu vihar', bills: 1, lastAt: '2026-10-01' },
    { key: 'p:9810012345', bills: 9, lastAt: '2026-10-16' },
  ]);
  expect(target.key).toBe('p:9810012345');
  expect(rules.customerAliases).toEqual({ 'a:a 135 madhu vihar': 'p:9810012345' });
});

describe('addresses typed different ways', () => {
  const customers = [
    { key: 'p:9810012345', name: 'Sharma ji', phone: '98100 12345', address: 'A-135, Madhu Vihar Ln no. 8', bills: 9, lastAt: '2026-10-16' },
    { key: 'a:b 12 lane 3', name: 'Gupta ji', phone: '', address: 'B-12 Lane 3', bills: 2, lastAt: '2026-10-15' },
    { key: 'a:a 2 rose apt', name: 'Mehta', phone: '', address: 'A 2, Rose Apts', bills: 1, lastAt: '2026-10-14' },
  ];
  const first = (typed) => suggestCustomers(customers, typed, 'address')[0]?.name;

  test.each(['A-135', 'A135', 'a 135', 'a-1', 'A 13', '135', 'madhu 135', 'madhu vihar lane 8', 'Madhu Vihar Lane No 8'])(
    '"%s" finds Sharma ji',
    (typed) => expect(first(typed)).toBe('Sharma ji')
  );

  test('small typos still match', () => {
    expect(first('madu vihar')).toBe('Sharma ji');
    expect(first('Madhu vihaar')).toBe('Sharma ji');
  });

  test('other house numbers do not', () => {
    expect(suggestCustomers(customers, 'A 2', 'address').map((c) => c.name)).toEqual(['Mehta']);
    expect(suggestCustomers(customers, 'b12', 'address').map((c) => c.name)).toEqual(['Gupta ji']);
    expect(suggestCustomers(customers, 'C-9', 'address')).toEqual([]);
  });

  test('server groups A-135 and A135 as one address', () => {
    const { addressKey } = require('./normalize.mjs');
    expect(addressKey('A-135, Madhu Vihar Ln no. 8')).toBe(addressKey('a135 madhu vihar lane 8'));
    expect(addressKey('H.No. 12B, Laxmi Ngr')).toBe('12 b laxmi nagar');
  });

  test('item typos: चिनी finds चीनी', () => {
    expect(suggestItems(items, 'चिनी').map((i) => i.name)).toEqual(['चीनी']);
  });
});
