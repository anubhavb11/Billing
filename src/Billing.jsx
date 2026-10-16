import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { deleteBill } from './api';
import {
  billTotal,
  cleanNumber,
  emptyRow,
  hasUnsavedWork,
  rowHasContent,
  withAmount,
} from './bill';
import { formatAmount, formatDate, formatMoney, formatWhen } from './format';
import { deliverySnapshot, paymentSnapshot } from './shopSettings';
import Logo from './Logo';
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

export default function Billing({ draft, setDraft, settings, notify, onSave, onSend, onNew, sending, onDeleted }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

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
      items: d.items.map((row, i) => (i === index ? withAmount({ ...row, [field]: value }) : row)),
    }));
  };

  const addRow = () => edit((d) => ({ ...d, items: [...d.items, emptyRow()] }));

  const deleteRow = (index) => {
    if (rowHasContent(draft.items[index]) && !window.confirm(`Delete row ${index + 1}?`)) return;
    edit((d) => {
      const items = d.items.filter((_, i) => i !== index);
      return { ...d, items: items.length ? items : [emptyRow()] };
    });
  };

  const clear = () => {
    if (hasUnsavedWork(draft) && !window.confirm('Clear this bill? It is not saved yet.')) return;
    onNew();
    setError('');
  };

  const save = async () => {
    if (!draft.items.some(rowHasContent)) {
      setError('Add at least one item before saving.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const bill = await onSave();
      notify(`Saved · Bill #${bill.billNo}`);
    } catch (err) {
      if (err.status !== 401) setError(`Not saved. ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const billNo = draft.billNo;
    if (!window.confirm(`Delete bill #${billNo}? It will be removed from Master View.`)) return;
    try {
      await deleteBill(billNo);
      onDeleted(billNo);
      onNew();
      setError('');
      notify(`Bill #${billNo} deleted`);
    } catch (err) {
      if (err.status !== 401) setError(`Not deleted. ${err.message}`);
    }
  };

  const saved = Boolean(draft.billNo) && !draft.dirty;
  const total = billTotal(draft.items);

  return (
    <form className="bill" onSubmit={(e) => e.preventDefault()} onKeyDown={focusNext} autoComplete="off">
      {/* Stays at the top while scrolling, so the bill number is always in view. */}
      <header className="topbar">
        <Logo size={30} />
        <span className="topbar-name">Bansal Store</span>
        <span className="topbar-bill">
          {draft.billNo ? (
            <>
              Bill <strong>#{draft.billNo}</strong>
            </>
          ) : (
            <strong>New bill</strong>
          )}
        </span>
      </header>

      {draft.billNo ? (
        <div className={draft.status === 'sent' ? 'bill-meta editing sent' : 'bill-meta editing'}>
          <div>
            <strong>Editing Bill #{draft.billNo}</strong> <StatusChips bill={draft} />
            <div className="bill-meta-sub">
              Made {formatWhen(draft.createdAt)}
              {draft.sentAt && ` · sent ${formatWhen(draft.sentAt)}`}
            </div>
          </div>
          <button type="button" className="link-danger" onClick={remove}>
            Delete
          </button>
        </div>
      ) : (
        <div className="bill-meta">
          <span>
            {formatDate(new Date())} · gets its number when saved
          </span>
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
              <span className="sr-only">Delete</span>
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
                  aria-label={`Delete row ${i + 1}`}
                  onClick={() => deleteRow(i)}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={7} className="total">
              Total <strong>{formatMoney(total)}</strong>
            </td>
          </tr>
        </tfoot>
      </table>

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

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {/* Same buttons, order and colours as the earlier version he is used to. */}
      <div className="actions">
        <button type="button" className="btn btn-add" aria-label="Add row" onClick={addRow}>
          +
        </button>
        <button type="button" className="btn btn-save" onClick={save} disabled={saving || saved || sending}>
          {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
        </button>
        <button type="button" className="btn btn-clear" onClick={clear}>
          Clear
        </button>
      </div>
      <div className="actions">
        <a href="#/view" className="btn btn-view">
          View
        </a>
        <button type="button" className="btn btn-send" onClick={onSend} disabled={sending || saving}>
          {sending ? 'Saving…' : 'Send'}
        </button>
        <a href="#/bills" className="btn btn-master">
          Master View
        </a>
      </div>
      <p className="settings-link">
        <a href="#/settings">Settings · payment QR, delivery</a>
      </p>
    </form>
  );
}
