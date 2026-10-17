import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { deleteBill } from './api';
import { billTotal, cleanNumber, draftAsBill, emptyRow, rowHasContent, withAmount, withSpareRows } from './bill';
import { exactItem, suggestCustomers, suggestItems } from './catalog';
import { formatAmount, formatDate, formatMoney, formatWhen } from './format';
import { ListIcon, NewBillIcon, SendIcon, TrashIcon } from './Icons';
import Logo from './Logo';
import { deliverySnapshot, paymentSnapshot } from './shopSettings';
import StatusChips from './StatusChips';
import TrackPanel from './TrackPanel';

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
// are New bill (start the next one) and View & Send.
const money = (n) => (n === null || n === undefined ? '' : `₹${formatAmount(n)}`);
const chipText = (...parts) => parts.filter(Boolean).join(' · ');

// Keeps the box focused when a chip is tapped, so the tap lands on the chip.
const keepFocus = (e) => e.preventDefault();

export default function Billing({
  draft,
  setDraft,
  settings,
  catalog,
  saveState,
  notify,
  onNewBill,
  onSend,
  onDeleted,
  onTrack,
}) {
  const [busy, setBusy] = useState(false);
  // Which box he is typing in, for the suggestion chips under it.
  const [focus, setFocus] = useState(null); // { kind: 'customer', field } | { kind: 'item', index }
  const blurTimer = useRef(null);
  const focusOn = (next) => () => {
    clearTimeout(blurTimer.current);
    setFocus(next);
  };
  const blurLater = () => {
    clearTimeout(blurTimer.current);
    blurTimer.current = setTimeout(() => setFocus(null), 200);
  };
  useEffect(() => () => clearTimeout(blurTimer.current), []);

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

  const focusBox = (label) => requestAnimationFrame(() => document.querySelector(`[aria-label="${label}"]`)?.focus());

  // Tapping an item chip fills the item, its usual details and last rate.
  const pickItem = (index, item) => {
    edit((d) => ({
      ...d,
      items: withSpareRows(
        d.items.map((row, i) =>
          i === index
            ? withAmount({
                ...row,
                name: item.name,
                description: row.description || item.details || '',
                rate: row.rate !== '' || item.rate === null ? row.rate : String(item.rate),
              })
            : row
        )
      ),
    }));
    setFocus(null);
    focusBox(`Row ${index + 1} quantity`);
  };

  // An item typed in full that he has sold before gets its last rate.
  const fillKnownItem = (index) => {
    const row = draft.items[index];
    const known = row && row.rate === '' && exactItem(catalog.items, row.name);
    if (known && (known.rate !== null || known.details)) pickItemQuietly(index, known);
  };
  const pickItemQuietly = (index, item) =>
    edit((d) => ({
      ...d,
      items: d.items.map((row, i) =>
        i === index && row.rate === ''
          ? withAmount({
              ...row,
              description: row.description || item.details || '',
              rate: item.rate === null ? '' : String(item.rate),
            })
          : row
      ),
    }));

  // Tapping a customer chip fills address, phone and name.
  const pickCustomer = (c) => {
    edit((d) => ({
      ...d,
      customerAddress: c.address || d.customerAddress,
      customerPhone: c.phone || d.customerPhone,
      customerName: c.name || d.customerName,
    }));
    setFocus(null);
    const firstEmpty = draft.items.findIndex((row) => !rowHasContent(row));
    focusBox(`Row ${(firstEmpty < 0 ? draft.items.length - 1 : firstEmpty) + 1} item`);
  };

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
  const customerFieldText = { address: draft.customerAddress, phone: draft.customerPhone, name: draft.customerName };
  const customerChips =
    focus?.kind === 'customer' ? suggestCustomers(catalog.customers, customerFieldText[focus.field], focus.field) : [];
  const itemChips = focus?.kind === 'item' ? suggestItems(catalog.items, draft.items[focus.index]?.name) : [];
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
          className="customer-address"
          placeholder="Address"
          aria-label="Customer address"
          value={draft.customerAddress}
          onChange={setField('customerAddress')}
          onFocus={focusOn({ kind: 'customer', field: 'address' })}
          onBlur={blurLater}
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
          onFocus={focusOn({ kind: 'customer', field: 'phone' })}
          onBlur={blurLater}
          enterKeyHint="next"
        />
        <input
          className="customer-name"
          placeholder="Name"
          aria-label="Customer name"
          value={draft.customerName}
          onChange={setField('customerName')}
          onFocus={focusOn({ kind: 'customer', field: 'name' })}
          onBlur={blurLater}
          enterKeyHint="next"
        />
      </div>
      {customerChips.length > 0 && (
        <div className="suggest-chips" aria-label="Earlier customers">
          {customerChips.map((c) => (
            <button
              key={c.key}
              type="button"
              className="suggest-chip"
              onPointerDown={keepFocus}
              onMouseDown={keepFocus}
              onClick={() => pickCustomer(c)}
            >
              {chipText(c.address, c.name, c.phone)}
            </button>
          ))}
        </div>
      )}

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
            <th>Details</th>
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
            <Fragment key={row.id}>
            <tr>
              <td className="sno">{i + 1}</td>
              <td>
                <WrapText
                  aria-label={`Row ${i + 1} item`}
                  placeholder={i === 0 ? 'Sugar' : undefined}
                  value={row.name}
                  onChange={setCell(i, 'name')}
                  onFocus={focusOn({ kind: 'item', index: i })}
                  onBlur={() => {
                    fillKnownItem(i);
                    blurLater();
                  }}
                  enterKeyHint="next"
                />
              </td>
              <td>
                <WrapText
                  aria-label={`Row ${i + 1} details`}
                  placeholder={i === 0 ? '1 kg' : undefined}
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
                  <TrashIcon size={18} />
                </button>
              </td>
            </tr>
            {focus?.kind === 'item' && focus.index === i && itemChips.length > 0 && (
              <tr className="chip-row">
                <td />
                <td colSpan={6}>
                  <div className="suggest-chips" aria-label="Items sold before">
                    {itemChips.map((item) => (
                      <button
                        key={item.key}
                        type="button"
                        className="suggest-chip"
                        onPointerDown={keepFocus}
                        onMouseDown={keepFocus}
                        onClick={() => pickItem(i, item)}
                      >
                        {chipText(item.name, item.details, money(item.rate))}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            )}
            </Fragment>
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

      {draft.billNo && <TrackPanel bill={draftAsBill(draft)} onTrack={onTrack} />}

      <div className="bill-actions">
        <button type="button" className="btn btn-secondary btn-two-line" onClick={run(onNewBill)} disabled={busy}>
          <NewBillIcon />
          <span className="btn-label">
            New bill
            {(draft.billNo || draft.items.some(rowHasContent)) && (
              <small>{draft.status === 'sent' ? 'kept in All bills' : 'saves as draft'}</small>
            )}
          </span>
        </button>
        <button type="button" className="btn btn-primary" onClick={run(onSend)} disabled={busy}>
          <SendIcon />
          View &amp; Send
        </button>
      </div>
      <p className="bill-hint">
        {draft.billNo && (
          <button type="button" className="link-danger" onClick={remove}>
            Delete this bill
          </button>
        )}
      </p>
    </form>
  );
}
