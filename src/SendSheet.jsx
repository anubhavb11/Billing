import { useEffect, useState } from 'react';
import { formatMoney } from './format';
import { canShareFiles, isIPhone, pictureCaption, renderBillImage, shareFile, waLink, waNumber } from './share';

// The two ways to send a saved bill. The picture is made as soon as this opens,
// so "Send picture" can open the share menu the moment it is tapped.
export default function SendSheet({ bill, onClose, onSent, notify }) {
  const [picture, setPicture] = useState(null); // { file, url }
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let url;
    let cancelled = false;
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
  }, [bill]);

  const number = waNumber(bill.customerPhone);
  const canShare = picture && canShareFiles(picture.file);

  const sendToNumber = () => {
    const link = waLink(bill);
    const win = window.open(link, '_blank');
    if (win) win.opener = null;
    else window.location.href = link;
    onSent(bill);
    onClose();
  };

  const sendPicture = async () => {
    const result = await shareFile(picture.file, pictureCaption(bill));
    if (result === 'shared') {
      onSent(bill);
      onClose();
    } else if (result === 'blocked') {
      notify('Tap Send picture again.');
    }
  };

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-label={`Send bill #${bill.billNo}`}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="sheet-title">
          Send bill #{bill.billNo} · {formatMoney(bill.total)}
          {bill.customerName && <span className="muted"> to {bill.customerName}</span>}
        </h3>

        <button type="button" className="sheet-option option-number" onClick={sendToNumber} disabled={!number}>
          <strong>Send to {number ? bill.customerPhone : 'customer’s number'}</strong>
          <span>
            {number
              ? 'Opens their WhatsApp chat with the bill and its link'
              : 'Add the customer’s mobile number on the bill first'}
          </span>
        </button>

        <button
          type="button"
          className="sheet-option option-picture"
          onClick={sendPicture}
          disabled={!canShare}
        >
          <strong>Send picture</strong>
          <span>
            {!picture
              ? failed
                ? 'Could not make the picture. Close and try again.'
                : 'Preparing the bill picture…'
              : canShare
                ? `Pick the customer in WhatsApp${isIPhone() ? '' : ' · link goes with it'}`
                : 'This browser can’t share pictures. Save it below.'}
          </span>
        </button>

        {picture && !canShare && (
          <a className="btn btn-light" href={picture.url} download={picture.file.name}>
            Save picture
          </a>
        )}
        <button type="button" className="btn btn-light" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
