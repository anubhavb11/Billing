import { useEffect, useMemo, useState } from 'react';
import { draftAsBill } from './bill';
import InvoiceSheet from './InvoiceSheet';
import { resolveBill } from './shopSettings';
import { billLink, renderBillImage } from './share';

// The "View" screen: the bill as the customer sees it, with Send (opens the two
// send choices), Save picture and the bill link.
export default function Invoice({ draft, settings, onSend, busy }) {
  const bill = useMemo(() => resolveBill(draftAsBill(draft), settings), [draft, settings]);
  const [picture, setPicture] = useState(null); // { file, url }
  const [copied, setCopied] = useState(false);
  const link = draft.dirty ? null : billLink(bill);

  useEffect(() => {
    let url;
    let cancelled = false;
    setPicture(null);
    const timer = setTimeout(() => {
      renderBillImage(bill)
        .then((file) => {
          if (cancelled) return;
          url = URL.createObjectURL(file);
          setPicture({ file, url });
        })
        .catch(() => {});
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [bill]);

  return (
    <section className="invoice-page">
      <InvoiceSheet bill={bill} />

      <button type="button" className="btn btn-send btn-wide" onClick={onSend} disabled={busy}>
        {busy ? 'Saving…' : 'Send to customer'}
      </button>
      {picture && (
        <div className="actions">
          <a className="btn btn-light" href={picture.url} download={picture.file.name}>
            Save picture
          </a>
        </div>
      )}
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
