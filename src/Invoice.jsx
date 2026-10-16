import { useEffect, useRef, useState } from 'react';
import { billTotal, rowHasContent } from './bill';
import { formatAmount, formatDate, formatDateTime, formatMoney } from './format';
import { SHOP } from './shop';

const imageName = (draft) => `bill-${draft.billNo ?? 'new'}.png`;

// The "View" screen: the bill as the customer sees it, plus a screenshot to share.
export default function Invoice({ draft }) {
  const sheet = useRef(null);
  const [image, setImage] = useState(null); // { url, file }
  const [working, setWorking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => () => image && URL.revokeObjectURL(image.url), [image]);

  const rows = draft.items.filter(rowHasContent);
  const customer = [draft.customerName, draft.customerPhone, draft.customerAddress].filter((v) => v.trim());

  const takeScreenshot = async () => {
    setWorking(true);
    setError('');
    try {
      const { default: html2canvas } = await import('html2canvas');
      const canvas = await html2canvas(sheet.current, { scale: 2, backgroundColor: '#ffffff' });
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
      const file = new File([blob], imageName(draft), { type: 'image/png' });
      setImage({ url: URL.createObjectURL(blob), file });
    } catch {
      setError('Could not make the screenshot. Try again.');
    } finally {
      setWorking(false);
    }
  };

  const canShare = image && navigator.canShare?.({ files: [image.file] });
  const share = () => navigator.share({ files: [image.file], title: SHOP.name }).catch(() => {});

  return (
    <section className="invoice-page">
      <div className="invoice" ref={sheet}>
        <h2 className="store-name">{SHOP.name}</h2>
        <p>{SHOP.address}</p>
        <p>{SHOP.contact}</p>
        <p className="invoice-meta">
          {draft.billNo ? `Bill #${draft.billNo} · ${formatDateTime(draft.createdAt)}` : formatDate(new Date())}
        </p>
        {customer.length > 0 && <p className="invoice-customer">{customer.join(' · ')}</p>}
        <table className="invoice-table">
          <thead>
            <tr>
              <th className="nowrap">Sno</th>
              <th>Name of the item</th>
              <th className="nowrap">Description</th>
              <th className="nowrap">Qty</th>
              <th className="nowrap">Rate</th>
              <th className="nowrap num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id}>
                <td className="nowrap">{i + 1}</td>
                <td>{row.name}</td>
                <td>{row.description}</td>
                <td className="nowrap">{row.qty}</td>
                <td className="nowrap">{row.rate}</td>
                <td className="nowrap num">{row.amount === '' ? '' : formatAmount(row.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="invoice-total">
          Total <strong>{formatMoney(billTotal(draft.items))}</strong>
        </p>
      </div>

      <div className="actions">
        <button type="button" className="btn btn-light" onClick={takeScreenshot} disabled={working}>
          {working ? 'Taking…' : 'Take screenshot'}
        </button>
        {canShare && (
          <button type="button" className="btn btn-save" onClick={share}>
            Share
          </button>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {image && (
        <>
          <p className="muted">Press and hold the picture to save or share it.</p>
          <img className="invoice-image" src={image.url} alt="Bill screenshot" />
        </>
      )}
    </section>
  );
}
