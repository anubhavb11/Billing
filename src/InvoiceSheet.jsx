import { rowHasContent } from './bill';
import { formatAmount, formatDate, formatMoney } from './format';
import Logo from './Logo';
import QrCode from './QrCode';
import { paymentUpiId, qrText } from './shopSettings';
import { SHOP } from './shop';

const blank = (v) => v === '' || v == null;
const money = (v) => (blank(v) ? '' : formatAmount(v));

const time = (value) =>
  new Date(value).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

// The bill as the customer sees it: on the View screen, in the shared picture and
// on the customer's bill link, so all three always look the same. `bill.payment`
// must already have its QR photo filled in (see resolveBill). On the customer's
// page, `linkPhones` makes the phone numbers tap-to-call.
export default function InvoiceSheet({ bill, linkPhones = false }) {
  const items = bill.items.filter(rowHasContent);
  const when = bill.createdAt ?? new Date();
  const hasCustomer = [bill.customerName, bill.customerPhone, bill.customerAddress].some((v) => v && v.trim());
  const phone = (number) =>
    linkPhones && number ? <a href={`tel:${number.replace(/[^\d+]/g, '')}`}>{number}</a> : number;

  const payment = bill.total > 0 ? bill.payment : null;
  const qr = payment && qrText(payment, bill);
  const upiId = payment && paymentUpiId(payment);

  return (
    <div className="invoice">
      <header className="inv-head">
        <Logo size={46} className="inv-logo" />
        <div className="inv-shop-block">
          <h2 className="inv-shop">{SHOP.name}</h2>
          <p>{SHOP.address}</p>
          <p>Ph. {phone(SHOP.phone)}</p>
        </div>
        <div className="inv-billno">
          <span className="inv-label">Bill</span>
          {bill.billNo && <strong>#{bill.billNo}</strong>}
          <span>{formatDate(when)}</span>
          {bill.createdAt && <span>{time(bill.createdAt)}</span>}
        </div>
      </header>

      {hasCustomer && (
        <section className="inv-to">
          <span className="inv-label">Bill to</span>
          {bill.customerName && <strong>{bill.customerName}</strong>}
          {bill.customerPhone && <span>{phone(bill.customerPhone)}</span>}
          {bill.customerAddress && <span>{bill.customerAddress}</span>}
        </section>
      )}

      <table className="inv-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th className="num">Qty</th>
            <th className="num">Rate</th>
            <th className="num">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, i) => (
            <tr key={row.id ?? i}>
              <td className="inv-sno">{i + 1}</td>
              <td>
                <span className="inv-item">{row.name}</span>
                {row.description && <span className="inv-desc">{row.description}</span>}
              </td>
              <td className="num">{blank(row.qty) ? '' : row.qty}</td>
              <td className="num">{money(row.rate)}</td>
              <td className="num">{money(row.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="inv-total">
        <span>
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
        <span>
          Total <strong>{formatMoney(bill.total)}</strong>
        </span>
      </div>

      {bill.delivery && (
        <section className="inv-delivery">
          <span className="inv-label">Delivery by</span>
          <span>
            <strong>{bill.delivery.name}</strong>
            {bill.delivery.phone && <> · {phone(bill.delivery.phone)}</>}
          </span>
        </section>
      )}

      {payment && (qr || payment.image) && (
        <div className="inv-pay">
          {qr ? <QrCode text={qr} /> : <img className="inv-qr-photo" src={payment.image} alt="Payment QR" />}
          <div>
            <strong>Scan to pay {formatMoney(bill.total)}</strong>
            <span>{[payment.label, upiId].filter(Boolean).join(' · ')}</span>
            {payment.type !== 'upi' && <span>Please enter {formatMoney(bill.total)} when paying</span>}
          </div>
        </div>
      )}

      <footer className="inv-thanks">धन्यवाद · Thank you, visit again!</footer>
    </div>
  );
}
