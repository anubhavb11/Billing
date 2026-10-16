import { useEffect, useState } from 'react';
import './App.css';
import InvoiceSheet from './InvoiceSheet';
import Logo from './Logo';
import { formatMoney } from './format';
import { downloadPdf, renderBillImage } from './share';
import { SHOP } from './shop';

const Icon = ({ d }) => (
  <svg className="action-icon" viewBox="0 0 24 24" aria-hidden="true">
    <path d={d} />
  </svg>
);
const PHONE =
  'M6.6 10.8a15.1 15.1 0 0 0 6.6 6.6l2.2-2.2a1 1 0 0 1 1-.25 11.4 11.4 0 0 0 3.6.57 1 1 0 0 1 1 1V20a1 1 0 0 1-1 1A17 17 0 0 1 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.45.57 3.57a1 1 0 0 1-.25 1z';
const PICTURE =
  'M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2zM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5z';
const PDF = 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm-1 7V3.5L18.5 9zM12 19l-4-4h2.5v-3h3v3H16z';

// What the customer sees when they open their bill link (/b/<token>). No PIN, and
// only three things to do: call the shop, save the picture, download a PDF.
export default function PublicBill({ token }) {
  const [bill, setBill] = useState(null);
  const [error, setError] = useState('');
  const [picture, setPicture] = useState(null); // { file, url }
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState('');

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
        setPicture({ file, url });
      })
      .catch(() => {});
    return () => url && URL.revokeObjectURL(url);
  }, [bill]);

  const pdf = async () => {
    setPdfBusy(true);
    setPdfError('');
    try {
      await downloadPdf(picture.file, `${SHOP.name} Bill ${bill.billNo}.pdf`);
    } catch {
      setPdfError('Could not make the PDF. Use Save picture instead.');
    } finally {
      setPdfBusy(false);
    }
  };

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
  if (!bill) return <main className="public-bill muted">Loading your bill…</main>;

  return (
    <main className="public-bill">
      <p className="public-hello">
        <Logo size={28} />
        <span>
          Your bill from <strong>{SHOP.name}</strong> · {formatMoney(bill.total)}
        </span>
      </p>
      <InvoiceSheet bill={bill} linkPhones />

      <div className="public-actions">
        <a className="action" href={`tel:${SHOP.phone}`}>
          <Icon d={PHONE} />
          <span>
            <strong>Call shop</strong>
            <small>{SHOP.phone}</small>
          </span>
        </a>
        <a
          className={picture ? 'action' : 'action disabled'}
          href={picture?.url}
          download={picture?.file.name}
          aria-disabled={!picture}
        >
          <Icon d={PICTURE} />
          <span>
            <strong>Save picture</strong>
            <small>{picture ? 'Keep the bill in your gallery' : 'Getting it ready…'}</small>
          </span>
        </a>
        <button type="button" className="action" onClick={pdf} disabled={!picture || pdfBusy}>
          <Icon d={PDF} />
          <span>
            <strong>Download PDF</strong>
            <small>{pdfBusy ? 'Making the PDF…' : pdfError || 'For printing or your records'}</small>
          </span>
        </button>
      </div>
    </main>
  );
}
