// Where a bill's delivery and money are, shared by the app, the delivery boy's page,
// the customer's page and the server, so all of them say the same thing.
//
//   bill.deliveryEvents  { packed?, onTheWay?, delivered? }   times each step was marked
//   bill.paymentStatus   { method, amount, at, by, person, handedOverAt?, upiConfirmedAt? } or null
//     method: cash | upi | later (UPI later) | udhaar (on the customer's khata)
//     by: owner | delivery; person: { id, name } when the delivery boy marked it
//
// Cash a delivery boy collects stays "with" him until the father taps "Got it", and a
// UPI payment he reports stays "to check" until the father sees it in his UPI app.

export const STEPS = ['packed', 'onTheWay', 'delivered'];
export const STEP_LABELS = { packed: 'Packed', onTheWay: 'On the way', delivered: 'Delivered' };
export const PAY_METHODS = ['cash', 'upi', 'later', 'udhaar'];
export const PAY_LABELS = { cash: 'Cash', upi: 'UPI', later: 'UPI later', udhaar: 'Udhaar' };

// 'none' (no delivery) | 'assigned' | 'packed' | 'onTheWay' | 'delivered'
export function deliveryStep(bill) {
  const events = bill.deliveryEvents || {};
  for (const step of [...STEPS].reverse()) if (events[step]) return step;
  return bill.delivery ? 'assigned' : 'none';
}

export function deliveryLabel(bill) {
  const step = deliveryStep(bill);
  if (step === 'none') return '';
  if (step === 'assigned') return `With ${bill.delivery.name}`;
  return STEP_LABELS[step];
}

// What happened to the money. tone: good (in the shop), wait (with someone / to check),
// due (still to collect), khata (udhaar).
export function paymentState(bill) {
  const p = bill.paymentStatus;
  if (!p) {
    return deliveryStep(bill) === 'delivered'
      ? { key: 'due', label: 'Not paid', tone: 'due' }
      : { key: 'none', label: '', tone: '' };
  }
  if (p.method === 'cash') {
    return p.handedOverAt
      ? { key: 'paidCash', label: 'Paid · cash', tone: 'good' }
      : { key: 'cashWith', label: `Cash with ${p.person?.name || 'delivery'}`, tone: 'wait' };
  }
  if (p.method === 'upi') {
    return p.upiConfirmedAt
      ? { key: 'paidUpi', label: 'Paid · UPI', tone: 'good' }
      : { key: 'upiCheck', label: 'UPI · check', tone: 'wait' };
  }
  if (p.method === 'later') return { key: 'later', label: 'UPI later', tone: 'due' };
  return { key: 'udhaar', label: 'Udhaar', tone: 'khata' };
}

export const isPaid = (bill) => ['paidCash', 'paidUpi'].includes(paymentState(bill).key);

// Money still outside the shop for this bill: not paid after delivery, or "UPI later".
export const toCollect = (bill) => ['due', 'later'].includes(paymentState(bill).key);

export const upiToCheck = (bill) => paymentState(bill).key === 'upiCheck';

export const onUdhaar = (bill) => paymentState(bill).key === 'udhaar';

// Cash each delivery person has collected and not handed over yet, biggest first:
// [{ person: { id, name }, amount, billNos }]
export function cashWithPeople(bills) {
  const byPerson = new Map();
  for (const bill of bills) {
    if (paymentState(bill).key !== 'cashWith') continue;
    const { person, amount } = bill.paymentStatus;
    const id = person?.id ?? '';
    const entry = byPerson.get(id) ?? { person: person ?? { id: '', name: 'Delivery' }, amount: 0, billNos: [] };
    entry.amount = Math.round((entry.amount + (Number(amount) || 0)) * 100) / 100;
    entry.billNos.push(bill.billNo);
    byPerson.set(id, entry);
  }
  return [...byPerson.values()].sort((a, b) => b.amount - a.amount);
}

const round2 = (n) => Math.round(n * 100) / 100;

// A customer's udhaar khata. Payments clear the oldest bills first, so whatever he
// pays at the month-end hisaab (any amount) settles bills in order.
//   bills:    [{ billNo, total, createdAt }]   bills marked udhaar
//   payments: [{ id, amount, method, at }]
// -> { total, paid, due, bills: [{ billNo, total, createdAt, cleared, left }], payments }
export function khata(bills, payments) {
  const sorted = [...bills].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt) || a.billNo - b.billNo);
  const total = round2(sorted.reduce((s, b) => s + (Number(b.total) || 0), 0));
  const paid = round2(payments.reduce((s, p) => s + (Number(p.amount) || 0), 0));
  let pool = paid;
  const rows = sorted.map((b) => {
    const cleared = round2(Math.min(Number(b.total) || 0, Math.max(pool, 0)));
    pool = round2(pool - cleared);
    return { billNo: b.billNo, total: Number(b.total) || 0, createdAt: b.createdAt, cleared, left: round2((Number(b.total) || 0) - cleared) };
  });
  const sortedPayments = [...payments].sort((a, b) => new Date(a.at) - new Date(b.at));
  return { total, paid, due: round2(Math.max(total - paid, 0)), bills: rows, payments: sortedPayments };
}
