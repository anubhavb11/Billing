import { useEffect, useMemo, useState } from 'react';
import { handoverCash, listBills } from './api';
import { PAY_FILTERS, RANGES, SORTS, STATUSES, filterBills, isDraft, itemCount, itemPreview } from './billsFilter';
import { formatMoney, formatWhen } from './format';
import { EditIcon, SendIcon } from './Icons';
import StatusChips from './StatusChips';
import { cashWithPeople } from './tracking.mjs';

// Master View: every saved bill as a card with everything needed to pick it out
// on a phone, plus Edit (finish a draft) and Send (share it with the customer).
export default function Bills({ bills, setBills, filters, setFilters, onEdit, onSend, notify }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      setBills(await listBills());
    } catch (err) {
      if (err.status !== 401) setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Refresh once each time the page opens; cached bills show meanwhile.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Counts on the Drafts / Sent buttons follow the search and date filters.
  const matching = useMemo(() => (bills ? filterBills(bills, { ...filters, status: 'all' }) : []), [bills, filters]);
  const counts = {
    all: matching.length,
    draft: matching.filter(isDraft).length,
    sent: matching.filter((b) => !isDraft(b)).length,
  };
  const status = filters.status || 'all'; // filters saved before Drafts/Sent existed
  const shown = status === 'all' ? matching : matching.filter((b) => isDraft(b) === (status === 'draft'));
  const sum = shown.reduce((s, b) => s + b.total, 0);
  const set = (changes) => setFilters((f) => ({ ...f, ...changes }));
  // Money still to come in, counted within the search and dates (not the money filter itself).
  const payBase = useMemo(
    () => (bills ? filterBills(bills, { ...filters, status: 'all', pay: '' }) : []),
    [bills, filters]
  );
  const withBoys = bills ? cashWithPeople(bills) : [];

  const gotCash = async ({ person, amount }) => {
    if (!window.confirm(`Got ${formatMoney(amount)} cash from ${person.name}?`)) return;
    try {
      await handoverCash(person.id);
      notify(`${formatMoney(amount)} from ${person.name} is in the shop`);
      load();
    } catch (err) {
      if (err.status !== 401) notify(`Not saved. ${err.message}`);
    }
  };

  return (
    <section className="bills">
      {withBoys.map((entry) => (
        <div className="money-banner" key={entry.person.id}>
          <span>
            <strong>
              {entry.person.name} has {formatMoney(entry.amount)} cash
            </strong>
            <small>
              from {entry.billNos.length} {entry.billNos.length === 1 ? 'delivery' : 'deliveries'} · Bill{' '}
              {entry.billNos.map((n) => `#${n}`).join(', ')}
            </small>
          </span>
          <button type="button" className="btn btn-primary btn-small" onClick={() => gotCash(entry)}>
            Got it
          </button>
        </div>
      ))}
      {filters.customer && (
        <div className="bills-for">
          <span>
            Bills of <strong>{filters.customer.label}</strong>
          </span>
          <button type="button" className="link" onClick={() => set({ customer: null })}>
            Show all
          </button>
        </div>
      )}
      <input
        type="search"
        className="bills-search"
        placeholder="Search name, phone, item or #bill"
        aria-label="Search bills"
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
      />

      <div className="segmented" role="group" aria-label="Show">
        {STATUSES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={status === value ? 'segment active' : 'segment'}
            aria-pressed={status === value}
            onClick={() => set({ status: value })}
          >
            {label}
            {bills && <span className="segment-count">{counts[value]}</span>}
          </button>
        ))}
      </div>

      <div className="pay-filters" role="group" aria-label="Money to collect">
        {PAY_FILTERS.map(([key, label, test]) => {
          const count = payBase.filter(test).length;
          const on = filters.pay === key;
          return (
            <button
              key={key}
              type="button"
              className={on ? 'pay-filter on' : 'pay-filter'}
              aria-pressed={on}
              onClick={() => set({ pay: on ? '' : key })}
            >
              {label} <span className="segment-count">{count}</span>
            </button>
          );
        })}
      </div>

      <div className="bills-bar">
        <select aria-label="Date" value={filters.range} onChange={(e) => set({ range: e.target.value })}>
          {RANGES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <select aria-label="Sort bills" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {filters.range === 'custom' && (
        <div className="date-range">
          <input type="date" aria-label="From date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
          <span>to</span>
          <input type="date" aria-label="To date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />
        </div>
      )}

      {bills && (
        <p className="bills-summary">
          {shown.length} {shown.length === 1 ? 'bill' : 'bills'} · <strong>{formatMoney(sum)}</strong>
        </p>
      )}

      {error && (
        <p className="error" role="alert">
          Couldn't load bills. {error}{' '}
          <button type="button" className="link" onClick={load}>
            Try again
          </button>
        </p>
      )}
      {!bills && loading && <p className="muted">Loading bills…</p>}
      {bills && shown.length === 0 && (
        <p className="muted">{bills.length === 0 ? 'No saved bills yet.' : 'No bills match.'}</p>
      )}

      <ul className="bill-list">
        {shown.map((bill) => {
          const count = itemCount(bill);
          return (
            <li key={bill.billNo} className={isDraft(bill) ? 'bill-card draft' : 'bill-card'}>
              <button type="button" className="bill-card-main" onClick={() => onEdit(bill)}>
                <span className="bill-card-top">
                  <span className="bill-card-name">{bill.customerName || 'No name'}</span>
                  <strong className="bill-card-total">{formatMoney(bill.total)}</strong>
                </span>
                <span className="bill-card-sub">
                  Bill #{bill.billNo} · {formatWhen(bill.createdAt)}
                </span>
                {bill.customerPhone && <span className="bill-card-sub">{bill.customerPhone}</span>}
                <span className="bill-card-items">
                  {count} {count === 1 ? 'item' : 'items'}: {itemPreview(bill)}
                </span>
                <span className="bill-card-status">
                  <StatusChips bill={bill} withTracking />
                  {bill.sentAt && <span className="muted"> sent {formatWhen(bill.sentAt)}</span>}
                </span>
              </button>
              <div className="bill-card-actions">
                <button type="button" className="btn btn-secondary" onClick={() => onEdit(bill)}>
                  <EditIcon />
                  Edit
                </button>
                <button type="button" className="btn btn-secondary btn-accent" onClick={() => onSend(bill)}>
                  <SendIcon />
                  View &amp; Send
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
