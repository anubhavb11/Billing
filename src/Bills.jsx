import { useEffect, useMemo, useState } from 'react';
import { listBills } from './api';
import { RANGES, SORTS, filterBills, itemCount } from './billsFilter';
import { formatDateTime, formatMoney } from './format';

export default function Bills({ bills, setBills, filters, setFilters, onOpen }) {
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

  const shown = useMemo(() => (bills ? filterBills(bills, filters) : []), [bills, filters]);
  const sum = shown.reduce((s, b) => s + b.total, 0);
  const set = (changes) => setFilters((f) => ({ ...f, ...changes }));

  return (
    <section className="bills">
      <input
        type="search"
        className="bills-search"
        placeholder="Search name, phone, item, bill no."
        aria-label="Search bills"
        value={filters.q}
        onChange={(e) => set({ q: e.target.value })}
      />

      <div className="chips" role="group" aria-label="Date">
        {RANGES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            className={filters.range === value ? 'chip active' : 'chip'}
            aria-pressed={filters.range === value}
            onClick={() => set({ range: value })}
          >
            {label}
          </button>
        ))}
      </div>

      {filters.range === 'custom' && (
        <div className="date-range">
          <input type="date" aria-label="From date" value={filters.from} onChange={(e) => set({ from: e.target.value })} />
          <span>to</span>
          <input type="date" aria-label="To date" value={filters.to} onChange={(e) => set({ to: e.target.value })} />
        </div>
      )}

      <div className="bills-bar">
        <select aria-label="Sort bills" value={filters.sort} onChange={(e) => set({ sort: e.target.value })}>
          {SORTS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {bills && (
          <span className="bills-summary">
            {shown.length} {shown.length === 1 ? 'bill' : 'bills'} · <strong>{formatMoney(sum)}</strong>
          </span>
        )}
      </div>

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
        {shown.map((bill) => (
          <li key={bill.billNo}>
            <button type="button" className="bill-card" onClick={() => onOpen(bill)}>
              <span className="bill-card-top">
                <span className="bill-card-name">
                  <span className="bill-no">#{bill.billNo}</span> {bill.customerName || 'No name'}
                </span>
                <strong>{formatMoney(bill.total)}</strong>
              </span>
              <span className="bill-card-sub">
                {formatDateTime(bill.createdAt)} · {itemCount(bill)} {itemCount(bill) === 1 ? 'item' : 'items'}
                {bill.customerPhone && ` · ${bill.customerPhone}`}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
