import {
  billPayload,
  billTotal,
  cleanNumber,
  draftFromBill,
  hasUnsavedWork,
  lineAmount,
  loadDraft,
  newDraft,
  withAmount,
} from './bill';

test('cleanNumber keeps digits and one dot', () => {
  expect(cleanNumber('12a.5.3')).toBe('12.53');
  expect(cleanNumber('-5')).toBe('5');
  expect(cleanNumber('-5-0', true)).toBe('-50');
  expect(cleanNumber('')).toBe('');
});

test('line amounts keep decimals and avoid float noise', () => {
  expect(lineAmount('0.5', '15')).toBe(7.5);
  expect(lineAmount('3', '0.1')).toBe(0.3);
  expect(lineAmount('2', '')).toBe('');
  expect(lineAmount('.', '5')).toBe('');
});

test('total adds decimal amounts (old version dropped them)', () => {
  const items = [withAmount({ qty: '0.5', rate: '15' }), withAmount({ qty: '2', rate: '50' }), { amount: '' }];
  expect(billTotal(items)).toBe(107.5);
});

test('payload drops empty rows and row ids', () => {
  const draft = newDraft();
  draft.items[1] = withAmount({ ...draft.items[1], name: 'Rice', qty: '2', rate: '60' });
  expect(billPayload(draft).items).toEqual([{ name: 'Rice', description: '', qty: '2', rate: '60' }]);
});

test('saved bills open with at least five rows', () => {
  const draft = draftFromBill({
    billNo: 7,
    createdAt: '2026-10-16T10:00:00.000Z',
    customerName: 'Ravi',
    customerPhone: '',
    customerAddress: '',
    items: [{ name: 'Sugar', description: '1kg', qty: 2, rate: 45, amount: 90 }],
  });
  expect(draft.items).toHaveLength(5);
  expect(draft.items[0]).toMatchObject({ name: 'Sugar', qty: '2', rate: '45', amount: 90 });
  expect(hasUnsavedWork(draft)).toBe(false);
});

test('picks up a bill typed in the old version', () => {
  localStorage.clear();
  localStorage.setItem('userOrder', JSON.stringify([{ name: 'Dal', description: '', qty: '1', rate: '120', amount: 120 }]));
  const draft = loadDraft();
  expect(draft.items[0]).toMatchObject({ name: 'Dal', amount: 120 });
  expect(draft.items).toHaveLength(5);
  expect(hasUnsavedWork(draft)).toBe(true);
  localStorage.clear();
});
