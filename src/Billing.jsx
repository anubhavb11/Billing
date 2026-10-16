import { useState } from 'react';
import { createBill, deleteBill, updateBill } from './api';
import {
  billPayload,
  billTotal,
  cleanNumber,
  emptyRow,
  hasUnsavedWork,
  newDraft,
  rowHasContent,
  withAmount,
} from './bill';
import { formatAmount, formatDate, formatDateTime, formatMoney } from './format';

// Enter / "Next" on the phone keyboard jumps to the next box instead of submitting.
function focusNext(e) {
  if (e.key !== 'Enter' || e.target.tagName !== 'INPUT') return;
  e.preventDefault();
  const fields = Array.from(e.currentTarget.querySelectorAll('input'));
  const next = fields[fields.indexOf(e.target) + 1];
  if (next) next.focus();
  else e.target.blur();
}

export default function Billing({ draft, setDraft, notify, onSaved, onDeleted }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const edit = (change) => setDraft((d) => ({ ...change(d), dirty: true, rev: d.rev + 1 }));

  const setField = (field) => (e) => {
    const value = e.target.value;
    edit((d) => ({ ...d, [field]: value }));
  };

  const setCell = (index, field) => (e) => {
    const raw = e.target.value;
    const value = field === 'qty' ? cleanNumber(raw) : field === 'rate' ? cleanNumber(raw, true) : raw;
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
    setDraft(newDraft());
    setError('');
  };

  const save = async () => {
    if (!draft.items.some(rowHasContent)) {
      setError('Add at least one item before saving.');
      return;
    }
    const rev = draft.rev;
    setSaving(true);
    setError('');
    try {
      const payload = billPayload(draft);
      const bill = draft.billNo ? await updateBill(draft.billNo, payload) : await createBill(payload);
      // Anything typed while saving stays marked as not saved.
      setDraft((d) => ({ ...d, billNo: bill.billNo, createdAt: bill.createdAt, dirty: d.rev !== rev }));
      onSaved(bill);
      notify(`Saved · Bill #${bill.billNo}`);
    } catch (err) {
      if (err.status !== 401) setError(`Not saved. ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    const billNo = draft.billNo;
    if (!window.confirm(`Delete bill #${billNo}? It will be removed from All Bills.`)) return;
    try {
      await deleteBill(billNo);
      onDeleted(billNo);
      setDraft(newDraft());
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
      <div className="bill-meta">
        <span>
          {draft.billNo ? (
            <>
              <strong>Bill #{draft.billNo}</strong> · {formatDateTime(draft.createdAt)}
            </>
          ) : (
            <>
              <strong>New bill</strong> · {formatDate(new Date())}
            </>
          )}
        </span>
        {draft.billNo && (
          <button type="button" className="link-danger" onClick={remove}>
            Delete bill
          </button>
        )}
      </div>

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
                <input
                  aria-label={`Row ${i + 1} item`}
                  value={row.name}
                  onChange={setCell(i, 'name')}
                  enterKeyHint="next"
                />
              </td>
              <td>
                <input
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
        <button type="button" className="btn btn-save" onClick={save} disabled={saving || saved}>
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
        <a href="#/bills" className="btn btn-master">
          Master View
        </a>
      </div>
    </form>
  );
}
