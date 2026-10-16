import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { deleteBill } from './api';
import { billTotal, cleanNumber, emptyRow, rowHasContent, withAmount, withSpareRows } from './bill';
import { formatAmount, formatDate, formatMoney, formatWhen } from './format';
import { ClearIcon, ListIcon, SendIcon } from './Icons';
import Logo from './Logo';
import { deliverySnapshot, paymentSnapshot } from './shopSettings';
import StatusChips from './StatusChips';

// Keeps a picked option visible even after it was removed from Settings.
const withCurrent = (options, current) =>
  current && !options.some((o) => o.id === current.id) ? [...options, { ...current, removed: true }] : options;

// Enter / "Next" on the phone keyboard jumps to the next box instead of submitting
// (or adding a new line in Item / Description).
function focusNext(e) {
  if (e.key !== 'Enter' || e.nativeEvent.isComposing) return;
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') return;
  e.preventDefault();
  const fields = Array.from(e.currentTarget.querySelectorAll('input, textarea'));
  const next = fields[fields.indexOf(e.target) + 1];
  if (next) next.focus();
  else e.target.blur();
}

const fitHeight = (el) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight + 2}px`; // + top and bottom border
};

// Long item names wrap onto more lines (the box grows downward) instead of
// scrolling sideways out of view.
function WrapText(props) {
  const ref = useRef(null);
  useLayoutEffect(() => fitHeight(ref.current), [props.value]);
  useEffect(() => {
    const refit = () => ref.current && fitHeight(ref.current);
    window.addEventListener('resize', refit);
    return () => window.removeEventListener('resize', refit);
  }, []);
  return <textarea ref={ref} rows={1} {...props} />;
}

const SAVE_TEXT = {
  saving: 'Saving…',
  offline: 'Not saved yet · no internet',
  error: 'Not saved · will try again',
};

// The bill on screen. It saves itself as he types (see App), so the only actions
// are Clear (start the next bill) and View & Send.
export default function Billing({ draft, setDraft, settings, saveState, notify, onClear, onSend, onDeleted }) {
  const [busy, setBusy] = useState(false);

  const edit = (change) => setDraft((d) => ({ ...change(d), dirty: true, rev: d.rev + 1 }));

  const setField = (field) => (e) => {
    const value = e.target.value;
    edit((d) => ({ ...d, [field]: value }));
  };

  const setCell = (index, field) => (e) => {
    const raw = e.target.value;
    const value =
      field === 'qty'
        ? cleanNumber(raw)
        : field === 'rate'
          ? cleanNumber(raw, true)
          : raw.replace(/\s*\n\s*/g, ' '); // pasted line breaks become spaces
    edit((d) => ({
      ...d,
      items: withSpareRows(d.items.map((row, i) => (i === index ? withAmount({ ...row, [field]: value }) : row))),
    }));
  };

  const addRow = () => edit((d) => ({ ...d, items: [...d.items, emptyRow()] }));

  const deleteRow = (index) => {
    if (rowHasContent(draft.items[index]) && !window.confirm(`Remove row ${index + 1}?`)) return;
    edit((d) => {
      const items = d.items.filter((_, i) => i !== index);
      return { ...d, items: items.length ? items : [emptyRow()] };
    });
  };

  const run = (action) => async () => {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    const billNo = draft.billNo;
    if (!window.confirm(`Delete bill #${billNo}? It will be removed from All bills.`)) return;
    try {
      await deleteBill(billNo);
      onDeleted(billNo);
      notify(`Bill #${billNo} deleted`);
    } catch (err) {
      if (err.status !== 401) notify(`Not deleted. ${err.message}`);
    }
  };

  const total = billTotal(draft.items);
  const saveText = draft.dirty ? SAVE_TEXT[saveState] : null;
  let status;
  if (!draft.billNo) status = draft.items.some(rowHasContent) ? 'Saving…' : `Today, ${formatDate(new Date())}`;
  else status = saveText ?? `Saved · made ${formatWhen(draft.createdAt)}`;

  return (
    <form className="bill" onSubmit={(e) => e.preventDefault()} onKeyDown={focusNext} autoComplete="off">
      {/* Stays at the top while scrolling, so the bill number is always in view. */}
      <header className="topbar">
        <Logo size={34} />
        <div className="topbar-title">
          <strong>{draft.billNo ? `Bill #${draft.billNo}` : 'New bill'}</strong>
          <span className={saveText && saveState !== 'saving' ? 'topbar-status warn' : 'topbar-status'}>
            {status}
          </span>
        </div>
        <a href="#/bills" className="btn btn-secondary btn-small">
          <ListIcon size={20} />
          All bills
        </a>
      </header>

      {draft.billNo && (
        <div className="bill-status">
          <StatusChips bill={draft} />
          {draft.sentAt && <span className="muted">sent {formatWhen(draft.sentAt)}</span>}
        </div>
      )}

      <div className="customer">
        <input
          className="customer-name"
          placeholder="Customer name"
          aria-label="Customer name"
          value={draft.customerName}
          onChange={setField('customerName')}
          enterKeyHint="next"
        />
        <input
          className="customer-phone"
          type="tel"
          inputMode="tel"
          placeholder="Phone"
          aria-label="Customer phone"
          value={draft.customerPhone}
          onChange={setField('customerPhone')}
          enterKeyHint="next"
        />
        <input
          className="customer-address"
          placeholder="Address"
          aria-label="Customer address"
          value={draft.customerAddress}
          onChange={setField('customerAddress')}
          enterKeyHint="next"
        />
      </div>

      <table className="items">
        <colgroup>
          <col className="col-sno" />
          <col />
          <col className="col-desc" />
          <col className="col-qty" />
          <col className="col-rate" />
          <col className="col-amount" />
          <col className="col-delete" />
        </colgroup>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Desc.</th>
            <th>Qty</th>
            <th>Rate</th>
            <th className="num">Amount</th>
            <th>
              <span className="sr-only">Remove</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {draft.items.map((row, i) => (
            <tr key={row.id}>
              <td className="sno">{i + 1}</td>
              <td>
                <WrapText
                  aria-label={`Row ${i + 1} item`}
                  value={row.name}
                  onChange={setCell(i, 'name')}
                  enterKeyHint="next"
                />
              </td>
              <td>
                <WrapText
                  aria-label={`Row ${i + 1} description`}
                  value={row.description}
                  onChange={setCell(i, 'description')}
                  enterKeyHint="next"
                />
              </td>
              <td>
                <input
                  aria-label={`Row ${i + 1} quantity`}
                  inputMode="decimal"
                  value={row.qty}
                  onChange={setCell(i, 'qty')}
                  enterKeyHint="next"
                />
              </td>
              <td>
                <input
                  aria-label={`Row ${i + 1} rate`}
                  inputMode="decimal"
                  value={row.rate}
                  onChange={setCell(i, 'rate')}
                  enterKeyHint="next"
                />
              </td>
              <td className="num amount">{row.amount === '' ? '' : formatAmount(row.amount)}</td>
              <td>
                <button
                  type="button"
                  className="row-delete"
                  aria-label={`Remove row ${i + 1}`}
                  onClick={() => deleteRow(i)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button type="button" className="add-item" onClick={addRow}>
        + Add item
      </button>

      <div className="bill-total">
        <span>Total</span>
        <strong>{formatMoney(total)}</strong>
      </div>

      {(settings.payments.length > 0 || settings.delivery.length > 0 || draft.payment || draft.delivery) && (
        <div className="bill-extras">
          {(settings.payments.length > 0 || draft.payment) && (
            <label>
              <span>Payment QR</span>
              <select
                value={draft.payment?.id ?? ''}
                onChange={(e) => {
                  const picked = settings.payments.find((p) => p.id === e.target.value);
                  edit((d) => ({ ...d, payment: paymentSnapshot(picked) }));
                }}
              >
                <option value="">No QR</option>
                {withCurrent(settings.payments, draft.payment).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                    {p.removed ? ' (removed)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
          {(settings.delivery.length > 0 || draft.delivery) && (
            <label>
              <span>Delivery</span>
              <select
                value={draft.delivery?.id ?? ''}
                onChange={(e) => {
                  const picked = settings.delivery.find((p) => p.id === e.target.value);
                  edit((d) => ({ ...d, delivery: deliverySnapshot(picked) ?? null }));
                }}
              >
                <option value="">No delivery</option>
                {withCurrent(settings.delivery, draft.delivery).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                    {p.removed ? ' (removed)' : ''}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      )}

      <div className="bill-actions">
        <button type="button" className="btn btn-secondary" onClick={run(onClear)} disabled={busy}>
          <ClearIcon />
          Clear
        </button>
        <button type="button" className="btn btn-primary" onClick={run(onSend)} disabled={busy}>
          <SendIcon />
          View &amp; Send
        </button>
      </div>
      <p className="bill-hint">
        Clear starts a new bill. This one stays saved in All bills.
        {draft.billNo && (
          <>
            {' '}
            <button type="button" className="link-danger" onClick={remove}>
              Delete this bill
            </button>
          </>
        )}
      </p>
    </form>
  );
}
