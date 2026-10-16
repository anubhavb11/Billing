import { useEffect, useMemo, useState } from 'react';
import { draftAsBill } from './bill';
import InvoiceSheet from './InvoiceSheet';
import { billLink, canShareFiles, renderBillImage, waNumber } from './share';

// The "View" screen: the bill as the customer sees it, with Send to customer.
// The picture is made as soon as the screen opens so Send shares it at once.
export default function Invoice({ draft, onSend, onWhatsApp, sending }) {
  const bill = useMemo(() => draftAsBill(draft), [draft]);
  const [file, setFile] = useState(null);
  const [fileUrl, setFileUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const link = draft.dirty ? null : billLink(bill);

  useEffect(() => {
    let cancelled = false;
    setFile(null);
    const timer = setTimeout(() => {
      renderBillImage(bill)
        .then((f) => !cancelled && setFile(f))
        .catch(() => {});
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [bill]);

  useEffect(() => {
    if (!file) {
      setFileUrl(null);
      return undefined;
    }
    const url = URL.createObjectURL(file);
    setFileUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // A saved, unchanged bill can be shared straight away with the ready picture.
  const ready = file && draft.billNo && !draft.dirty ? file : null;
  const shareable = !file || canShareFiles(file);

  return (
    <section className="invoice-page">
      <InvoiceSheet bill={bill} />

      {shareable ? (
        <button type="button" className="btn btn-send btn-wide" onClick={() => onSend(ready)} disabled={sending}>
          {sending ? 'Sending…' : 'Send to customer'}
        </button>
      ) : (
        <p className="muted">This browser can't share pictures. Save the picture and send it from WhatsApp.</p>
      )}
      <div className="actions">
        {waNumber(draft.customerPhone) && (
          <button type="button" className="btn btn-whatsapp" onClick={onWhatsApp} disabled={sending}>
            WhatsApp {draft.customerPhone}
          </button>
        )}
        {file && fileUrl && (
          <a className="btn btn-light" href={fileUrl} download={file.name}>
            Save picture
          </a>
        )}
      </div>
      {link && (
        <div className="bill-link">
          <span>Bill link:</span>
          <code>{link}</code>
          <button
            type="button"
            className="link"
            onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {})}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}
    </section>
  );
}
