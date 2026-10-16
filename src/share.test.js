import { changedSinceSent, missingRates } from './bill';
import { formatWhen } from './format';
import { billText, waNumber } from './share';

test('WhatsApp numbers get the India prefix', () => {
  expect(waNumber('98765 43210')).toBe('919876543210');
  expect(waNumber('098765-43210')).toBe('919876543210');
  expect(waNumber('+91 98765 43210')).toBe('919876543210');
  expect(waNumber('12345')).toBeNull();
  expect(waNumber('')).toBeNull();
});

test('bill text lists priced and unpriced items', () => {
  const text = billText({
    billNo: 12,
    createdAt: '2026-10-16T10:00:00.000Z',
    customerName: 'Ramesh',
    items: [
      { name: 'अरहर दाल तूर', description: '1 kg', qty: 2, rate: 160, amount: 320 },
      { name: 'Mustard oil', description: '', qty: null, rate: null, amount: 0 },
    ],
    total: 320,
  });
  expect(text).toContain('Bill #12');
  expect(text).toContain('1. अरहर दाल तूर (1 kg) – 2 × ₹160 = ₹320');
  expect(text).toContain('2. Mustard oil\n');
  expect(text).toContain('*Total: ₹320*');
});

test('missing rates counts filled rows without qty or rate', () => {
  expect(
    missingRates([
      { name: 'Dal', qty: '2', rate: '' },
      { name: 'Oil', qty: 1, rate: 185 },
      { name: '', description: '', qty: '', rate: '' },
      { name: 'Rice', qty: null, rate: null },
    ])
  ).toBe(2);
});

test('a sent bill edited later is flagged', () => {
  const sent = { status: 'sent', sentAt: '2026-10-16T10:00:00Z', updatedAt: '2026-10-16T09:00:00Z' };
  expect(changedSinceSent(sent)).toBe(false);
  expect(changedSinceSent({ ...sent, updatedAt: '2026-10-16T11:00:00Z' })).toBe(true);
  expect(changedSinceSent({ status: 'draft' })).toBe(false);
});

test('friendly dates', () => {
  const now = new Date(2026, 9, 16, 18, 0);
  expect(formatWhen(new Date(2026, 9, 16, 10, 42), now)).toMatch(/^Today, 10:42/);
  expect(formatWhen(new Date(2026, 9, 15, 18, 10), now)).toMatch(/^Yesterday, 6:10/);
  expect(formatWhen(new Date(2026, 9, 14, 15, 5), now)).toMatch(/^14 Oct, 3:05/);
  expect(formatWhen(new Date(2025, 9, 14, 15, 5), now)).toMatch(/^14 Oct 2025, 3:05/);
});

test('bill text carries the customer link when the bill has one', () => {
  const text = billText({
    billNo: 3,
    createdAt: '2026-10-16T10:00:00.000Z',
    customerName: '',
    shareToken: '72cd3bd037d24683',
    items: [{ name: 'Sugar', description: '', qty: 1, rate: 45, amount: 45 }],
    total: 45,
  });
  expect(text).toContain(`View bill: ${window.location.origin}/b/72cd3bd037d24683`);
});
