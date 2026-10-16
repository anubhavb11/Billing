import { changedSinceSent, missingRates } from './bill';
import { formatWhen } from './format';

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

describe('payment QR and picture caption', () => {
  const { paymentUpiId, qrText, resolvePayment, upiPayLink } = require('./shopSettings');
  const { shareFile } = require('./share');

  test('UPI ID QR carries the amount; a scanned QR stays exactly as printed', () => {
    const upi = { id: 'p1', type: 'upi', label: 'GPay', upiId: 'shop@okicici', payeeName: '' };
    expect(upiPayLink(upi, { total: 505, billNo: 2 })).toBe(
      'upi://pay?pa=shop@okicici&pn=Bansal%20Store&am=505.00&cu=INR&tn=Bill%202'
    );
    expect(upiPayLink(upi, { total: 0, billNo: null })).not.toContain('am=');
    const scanned = { id: 'p2', type: 'qr', label: 'PhonePe', payload: 'upi://pay?pa=biz%40ybl&mc=5411' };
    expect(qrText(scanned, { total: 505 })).toBe(scanned.payload);
    expect(paymentUpiId(scanned)).toBe('biz@ybl');
  });

  test('a QR photo is looked up in settings and dropped once removed', () => {
    const settings = { payments: [{ id: 'p3', type: 'image', label: 'QR', image: 'data:image/jpeg;base64,AA==' }] };
    expect(resolvePayment({ id: 'p3', type: 'image', label: 'QR' }, settings).image).toContain('data:image');
    expect(resolvePayment({ id: 'gone', type: 'image', label: 'QR' }, settings)).toBeNull();
    expect(resolvePayment(null, settings)).toBeNull();
  });

  test('picture goes with the link on Android, alone on iPhone', async () => {
    const file = new File(['png'], 'Bill-2.png', { type: 'image/png' });
    const share = jest.fn().mockResolvedValue(undefined);
    Object.assign(navigator, { canShare: () => true, share });
    const ua = jest.spyOn(navigator, 'userAgent', 'get');

    ua.mockReturnValue('Mozilla/5.0 (Linux; Android 14) Chrome/130');
    await shareFile(file, 'Bansal Store · Bill #2\nhttps://x/b/abc');
    expect(share).toHaveBeenLastCalledWith({ files: [file], text: 'Bansal Store · Bill #2\nhttps://x/b/abc' });

    ua.mockReturnValue('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)');
    await shareFile(file, 'Bansal Store · Bill #2\nhttps://x/b/abc');
    expect(share).toHaveBeenLastCalledWith({ files: [file] });
    ua.mockRestore();
  });
});

describe('WhatsApp text bill', () => {
  const { billText, waLink, waNumber } = require('./share');
  const bill = {
    billNo: 12,
    createdAt: '2026-10-16T10:00:00.000Z',
    customerName: 'Ramesh',
    customerPhone: '98765 43210',
    shareToken: '72cd3bd037d24683',
    payment: { id: 'p1', type: 'upi', label: 'GPay', upiId: 'shop@okicici' },
    delivery: { id: 'd1', name: 'Raju', phone: '98100 11111' },
    items: [
      { name: 'अरहर दाल तूर', description: '1 kg', qty: 2, rate: 160, amount: 320 },
      { name: 'Mustard oil', description: '', qty: null, rate: null, amount: 0 },
    ],
    total: 320,
  };

  test('numbers get the India prefix', () => {
    expect(waNumber('98765 43210')).toBe('919876543210');
    expect(waNumber('098765-43210')).toBe('919876543210');
    expect(waNumber('+91 98765 43210')).toBe('919876543210');
    expect(waNumber('12345')).toBeNull();
  });

  test('the message has items, total, delivery, UPI and the bill link', () => {
    const text = billText(bill);
    expect(text).toContain('*Bansal Store*');
    expect(text).toContain('Bill #12');
    expect(text).toContain('1. अरहर दाल तूर (1 kg)\n    2 × ₹160 = *₹320*');
    expect(text).toContain('2. Mustard oil\n');
    expect(text).toContain('*Total: ₹320*');
    expect(text).toContain('Delivery: Raju · 98100 11111');
    expect(text).toContain('Pay by UPI: shop@okicici');
    expect(text).toContain(`View bill: ${window.location.origin}/b/72cd3bd037d24683`);
    expect(waLink(bill)).toMatch(/^https:\/\/wa\.me\/919876543210\?text=/);
  });
});
