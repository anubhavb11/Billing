import { useEffect, useState } from 'react';
import './App.css';
import InvoiceSheet from './InvoiceSheet';
import { formatMoney } from './format';
import { renderBillImage } from './share';
import { SHOP } from './shop';
import { upiLink } from './UpiQr';

// What the customer sees when they open their bill link (/b/<token>). No PIN.
export default function PublicBill({ token }) {
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [picture, setPicture] = useState(null);

  useEffect(() => {
    fetch(`/api/public/bills/${token}`)
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Could not open this bill.');
        setBill(data.bill);
        document.title = `${SHOP.name} · Bill #${data.bill.billNo}`;
      })
      .catch((err) => setError(err.message));
  }, [token]);

  useEffect(() => {
    if (!bill) return undefined;
    let url;
    renderBillImage(bill)
      .then((file) => {
        url = URL.createObjectURL(file);
        setPicture({ url, name: file.name });
      })
      .catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [bill]);

  if (error) {
    return (
      <main className="public-bill">
        <p className="error">{error}</p>
        <p className="muted">
          Please ask {SHOP.name} ({SHOP.phone}) to send it again.
        </p>
      </main>
    );
  }
  if (!bill) return <main className="public-bill muted">Loading bill…</main>;

  return (
    <main className="public-bill">
      <InvoiceSheet bill={bill} />
      {SHOP.upi && bill.total > 0 && (
        <a className="btn btn-send btn-wide" href={upiLink(bill)}>
          Pay {formatMoney(bill.total)} by UPI
        </a>
      )}
      <div className="actions">
        {picture && (
          <a className="btn btn-light" href={picture.url} download={picture.name}>
            Save picture
          </a>
        )}
        <a className="btn btn-light" href={`tel:${SHOP.phone}`}>
          Call shop
        </a>
      </div>
    </main>
  );
}
