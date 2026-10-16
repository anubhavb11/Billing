import { useEffect, useMemo, useState } from 'react';
import { draftAsBill, missingRates } from './bill';
import { formatMoney } from './format';
import { ChatIcon, PictureIcon } from './Icons';
import { resolveBill } from './shopSettings';
import {
  billLink,
  canShareFiles,
  pictureCaption,
  renderBillImage,
  shareFile,
  waLink,
  waNumber,
} from './share';

// View & Send: the exact bill picture, then the two ways to send it:
// 1. WhatsApp to the bill's number (green): the bill as a text message with its link.
// 2. Send picture: the share menu opens, he picks the customer in WhatsApp.
// The picture is made as soon as this opens, so "Send picture" shares it at once.
export default function SendPage({ draft, settings, onSent, onNewBill, notify }) {
  const bill = useMemo(() => resolveBill(draftAsBill(draft), settings), [draft, settings]);
  const [picture, setPicture] = useState(null); // { file, url }
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const link = billLink(bill);
  const number = waNumber(bill.customerPhone);
  const missing = missingRates(bill.items);

  useEffect(() => {
    let url;
    let cancelled = false;
    setPicture(null);
    setFailed(false);
    renderBillImage(bill)
      .then((file) => {
        if (cancelled) return;
        url = URL.createObjectURL(file);
        setPicture({ file, url });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
    // Only a new bill or changed contents need a new picture (not a status change).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bill.billNo, bill.updatedAt, bill.payment, bill.delivery]);

  const done = () => {
    setSent(true);
    onSent(bill);
  };

  const sendToNumber = () => {
    const url = waLink(bill);
    const win = window.open(url, '_blank');
    if (win) win.opener = null;
    else window.location.href = url;
    done();
  };

  const sendPicture = async () => {
    if (!canShareFiles(picture.file)) {
      // This phone/browser can't share pictures: save it, then send it from WhatsApp.
      const a = document.createElement('a');
      a.href = picture.url;
      a.download = picture.file.name;
      a.click();
      notify('Picture saved. Send it from WhatsApp.');
      return;
    }
    const result = await shareFile(picture.file, pictureCaption(bill));
    if (result === 'shared') done();
    else if (result === 'blocked') notify('Tap Send picture again.');
  };

  if (sent) {
    return (
      <section className="send-page send-done">
        <div className="send-done-mark" aria-hidden="true">
          ✓
        </div>
        <h2>Bill #{bill.billNo} sent</h2>
        <p className="muted">
          {formatMoney(bill.total)}
          {bill.customerName && ` · ${bill.customerName}`}
        </p>
        <button type="button" className="btn btn-primary btn-wide" onClick={onNewBill}>
          Make a new bill
        </button>
        <a href="#/" className="btn btn-secondary btn-wide">
          Back to bill #{bill.billNo}
        </a>
      </section>
    );
  }

  return (
    <section className="send-page">
      <div className="send-preview">
        {picture ? (
          <img src={picture.url} alt={`Bill #${bill.billNo}`} />
        ) : (
          <p className="send-preparing">{failed ? 'Could not make the bill picture.' : 'Preparing the bill picture…'}</p>
        )}
      </div>

      {missing > 0 && (
        <p className="send-warning">
          {missing} {missing === 1 ? 'item has' : 'items have'} no qty or rate yet. <a href="#/">Fill in</a>
        </p>
      )}

      <div className="send-options">
        {number ? (
          <button type="button" className="send-option option-whatsapp" onClick={sendToNumber}>
            <ChatIcon size={28} />
            <span>
              <strong>WhatsApp {bill.customerPhone}</strong>
              <small>Bill as text, with its link{bill.payment ? ' and UPI' : ''}</small>
            </span>
          </button>
        ) : (
          <a href="#/" className="send-option option-hint">
            <ChatIcon size={28} />
            <span>
              <strong>Add the customer&rsquo;s number</strong>
              <small>to send the bill straight to their WhatsApp</small>
            </span>
          </a>
        )}

        <button type="button" className="send-option option-picture" onClick={sendPicture} disabled={!picture}>
          <PictureIcon size={28} />
          <span>
            <strong>Send picture</strong>
            <small>{picture ? 'WhatsApp opens, pick the customer' : 'Getting the picture ready…'}</small>
          </span>
        </button>
      </div>

      <p className="send-links">
        {picture && (
          <a href={picture.url} download={picture.file.name}>
            Save picture
          </a>
        )}
        {link && (
          <button
            type="button"
            className="link"
            onClick={() => navigator.clipboard?.writeText(link).then(() => setCopied(true), () => {})}
          >
            {copied ? 'Link copied' : 'Copy bill link'}
          </button>
        )}
      </p>
    </section>
  );
}
