import {
  cashWithPeople,
  deliveryLabel,
  deliveryStep,
  isPaid,
  khata,
  onUdhaar,
  paymentState,
  toCollect,
  upiToCheck,
} from './tracking.mjs';

const raju = { id: 'r1', name: 'Raju' };
const bill = (billNo, extra = {}) => ({ billNo, total: 100, createdAt: '2026-10-17T10:00:00Z', delivery: null, ...extra });
const at = '2026-10-17T11:00:00Z';

test('delivery steps: the latest one marked wins', () => {
  expect(deliveryStep(bill(1))).toBe('none');
  expect(deliveryLabel(bill(1, { delivery: raju }))).toBe('With Raju');
  expect(deliveryStep(bill(1, { delivery: raju, deliveryEvents: { packed: at } }))).toBe('packed');
  expect(deliveryStep(bill(1, { delivery: raju, deliveryEvents: { packed: at, delivered: at } }))).toBe('delivered');
  expect(deliveryLabel(bill(1, { delivery: raju, deliveryEvents: { onTheWay: at } }))).toBe('On the way');
});

test('cash stays with the delivery boy until the father gets it', () => {
  const withRaju = bill(1, { paymentStatus: { method: 'cash', amount: 100, by: 'delivery', person: raju, at } });
  expect(paymentState(withRaju)).toMatchObject({ key: 'cashWith', label: 'Cash with Raju' });
  expect(isPaid(withRaju)).toBe(false);
  const handed = { ...withRaju, paymentStatus: { ...withRaju.paymentStatus, handedOverAt: at } };
  expect(paymentState(handed).key).toBe('paidCash');
  expect(isPaid(handed)).toBe(true);
});

test('UPI reported by the boy waits for the father to check it', () => {
  const reported = bill(1, { paymentStatus: { method: 'upi', amount: 100, by: 'delivery', person: raju, at } });
  expect(upiToCheck(reported)).toBe(true);
  const checked = { ...reported, paymentStatus: { ...reported.paymentStatus, upiConfirmedAt: at } };
  expect(paymentState(checked).label).toBe('Paid · UPI');
});

test('to collect: delivered with nothing recorded, or UPI later; udhaar is on the khata', () => {
  expect(toCollect(bill(1, { delivery: raju, deliveryEvents: { delivered: at } }))).toBe(true);
  expect(toCollect(bill(1, { delivery: raju }))).toBe(false); // not delivered yet
  expect(toCollect(bill(1, { paymentStatus: { method: 'later', amount: 100, at } }))).toBe(true);
  const credit = bill(1, { paymentStatus: { method: 'udhaar', amount: 100, at } });
  expect(toCollect(credit)).toBe(false);
  expect(onUdhaar(credit)).toBe(true);
});

test('cash with each delivery person adds up', () => {
  const cash = (billNo, amount, person) => bill(billNo, { paymentStatus: { method: 'cash', amount, by: 'delivery', person, at } });
  const shyam = { id: 's1', name: 'Shyam' };
  const list = [cash(1, 505, raju), cash(2, 735.5, raju), cash(3, 90, shyam), bill(4)];
  expect(cashWithPeople(list)).toEqual([
    { person: raju, amount: 1240.5, billNos: [1, 2] },
    { person: shyam, amount: 90, billNos: [3] },
  ]);
});

test('khata: any amount clears the oldest bills first', () => {
  const bills = [
    { billNo: 7, total: 900, createdAt: '2026-10-10T10:00:00Z' },
    { billNo: 3, total: 1200, createdAt: '2026-10-02T10:00:00Z' },
    { billNo: 9, total: 350, createdAt: '2026-10-15T10:00:00Z' },
  ];
  const k = khata(bills, [{ id: 1, amount: 2000, method: 'cash', at }]);
  expect(k).toMatchObject({ total: 2450, paid: 2000, due: 450 });
  expect(k.bills.map((b) => [b.billNo, b.cleared, b.left])).toEqual([
    [3, 1200, 0],
    [7, 800, 100],
    [9, 0, 350],
  ]);
  expect(khata(bills, []).due).toBe(2450);
  expect(khata(bills, [{ id: 2, amount: 3000, method: 'upi', at }]).due).toBe(0);
});
