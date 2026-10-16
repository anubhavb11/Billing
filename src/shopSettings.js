// Shop settings (payment QRs and delivery people), shared by every phone through
// the API and cached on the phone so bills still show them without internet.
import { SHOP } from './shop';

const CACHE_KEY = 'shopSettings';
export const EMPTY_SETTINGS = { payments: [], delivery: [], defaultPaymentId: null };
export const UPI_ID = /^[a-zA-Z0-9._-]{2,256}@[a-zA-Z][a-zA-Z0-9.-]{1,64}$/;

export function cachedSettings() {
  try {
    return { ...EMPTY_SETTINGS, ...JSON.parse(localStorage.getItem(CACHE_KEY)) };
  } catch {
    return EMPTY_SETTINGS;
  }
}

export function cacheSettings(settings) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(settings));
  } catch {
    // Too big or blocked: settings are fetched again next time.
  }
}

export const newId = () => Math.random().toString(36).slice(2, 10);

export const defaultPayment = (settings) =>
  settings.payments.find((p) => p.id === settings.defaultPaymentId) ?? settings.payments[0] ?? null;

// What a bill keeps of a payment QR. A QR photo stays in settings (looked up by id).
export function paymentSnapshot(payment) {
  if (!payment) return null;
  const { id, type, label } = payment;
  if (type === 'upi') return { id, type, label, upiId: payment.upiId, payeeName: payment.payeeName || '' };
  if (type === 'qr') return { id, type, label, payload: payment.payload };
  return { id, type, label };
}

export const deliverySnapshot = (person) => person && { id: person.id, name: person.name, phone: person.phone };

// The bill's payment with its QR photo filled in (null once the photo is removed from settings).
export function resolvePayment(payment, settings) {
  if (!payment || payment.type !== 'image' || payment.image) return payment ?? null;
  const photo = settings.payments.find((p) => p.id === payment.id && p.type === 'image');
  return photo ? { ...payment, image: photo.image } : null;
}

export const resolveBill = (bill, settings) => ({ ...bill, payment: resolvePayment(bill.payment, settings) });

// upi://pay link with this bill's amount: any UPI app opens it (or scans its QR) ready to pay.
export function upiPayLink(payment, bill) {
  const params = [
    `pa=${payment.upiId}`,
    `pn=${encodeURIComponent(payment.payeeName || SHOP.name)}`,
    bill.total > 0 && `am=${Number(bill.total).toFixed(2)}`,
    'cu=INR',
    `tn=${encodeURIComponent(bill.billNo ? `Bill ${bill.billNo}` : SHOP.name)}`,
  ].filter(Boolean);
  return `upi://pay?${params.join('&')}`;
}

// Text inside the QR on the bill. A QR read from a photo is kept exactly as printed.
export function qrText(payment, bill) {
  if (payment.type === 'upi') return upiPayLink(payment, bill);
  if (payment.type === 'qr') return payment.payload;
  return null;
}

// The UPI ID to print under the QR (read out of a scanned QR when it has one).
export function paymentUpiId(payment) {
  if (payment.type === 'upi') return payment.upiId;
  if (payment.type === 'qr') {
    const match = payment.payload.match(/[?&]pa=([^&]+)/i);
    return match ? decodeURIComponent(match[1]) : '';
  }
  return '';
}

export const paymentKind = (payment) => {
  if (payment.type === 'upi') return `UPI ID · ${payment.upiId}`;
  if (payment.type === 'qr') return paymentUpiId(payment) ? `QR · ${paymentUpiId(payment)}` : 'QR code';
  return 'QR photo';
};
