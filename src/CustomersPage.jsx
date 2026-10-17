import { useEffect, useState } from 'react';
import { editCustomer, mergeCustomers, norm, separateCustomer, toggleHideCustomer } from './catalog';
import { formatMoney, formatWhen } from './format';

const SORTS = {
  bills: (a, b) => b.bills - a.bills || new Date(b.lastAt) - new Date(a.lastAt),
  recent: (a, b) => new Date(b.lastAt) - new Date(a.lastAt),
  spent: (a, b) => b.total - a.total,
};

const label = (c) => c.address || c.name || c.phone || 'No details';

// How a merged-in customer was known: "phone 98100…", "address A 135…", "name Sharma".
const describeKey = (key) => {
  const [kind, value] = [key.slice(0, 2), key.slice(2)];
  return kind === 'p:' ? `phone ${value}` : kind === 'a:' ? `address ${value}` : `name ${value}`;
};

// Customers from the bills, grouped by phone (or address, or name). Merge the same
// customer typed two ways; open one to fix their details or see their bills.
export default function CustomersPage({ data, onRefresh, onRulesChange, onShowBills, notify }) {
  const { catalog, rules } = data;
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('bills');
  const [showHidden, setShowHidden] = useState(false);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    onRefresh(); // fresh list each time the tab opens
  }, [onRefresh]);

  const apply = async (next, message) => {
    setBusy(true);
    try {
      await onRulesChange(next);
      notify(message);
      return true;
    } catch (err) {
      if (err.status !== 401) notify(`Not saved. ${err.message}`);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const nq = norm(q);
  const qDigits = q.replace(/\D/g, '');
  const hiddenCount = catalog.customers.filter((c) => c.hidden).length;
  const list = catalog.customers
    .filter((c) => showHidden || !c.hidden)
    .filter(
      (c) =>
        !nq ||
        [c.address, c.name].some((s) => norm(s).includes(nq)) ||
        (qDigits.length >= 3 && c.phone.replace(/\D/g, '').includes(qDigits))
    )
    .sort(SORTS[sort]);
  const picked = catalog.customers.filter((c) => selected.includes(c.key));
  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const openRow = (c) => {
    setOpen(open === c.key ? null : c.key);
    setForm({ address: c.address, phone: c.phone, name: c.name });
  };

  const merge = async () => {
    const { target, rules: next } = mergeCustomers(rules, picked);
    if (!window.confirm(`Merge these ${picked.length} into "${label(target)}"? Their bills will be counted together.`)) return;
    if (await apply(next, `Merged into ${label(target)}`)) setSelected([]);
  };

  const saveEdit = async (c) => {
    const fields = { address: form.address.trim(), phone: form.phone.trim(), name: form.name.trim() };
    if (await apply(editCustomer(rules, c.key, fields), 'Customer updated')) setOpen(null);
  };

  return (
    <section className="data-page">
      <p className="data-help">
        Customers from the bills, grouped by phone or address. Tick the same customer typed two ways and tap Merge.
      </p>
      <input
        type="search"
        className="bills-search"
        placeholder="Search address, phone or name"
        aria-label="Search customers"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="bills-bar">
        <select aria-label="Sort customers" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="bills">Most bills</option>
          <option value="recent">Recent</option>
          <option value="spent">Most spent</option>
        </select>
        {hiddenCount > 0 && (
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowHidden((v) => !v)}>
            {showHidden ? 'Hide hidden' : `Show hidden (${hiddenCount})`}
          </button>
        )}
      </div>
      <p className="bills-summary">
        {list.length} {list.length === 1 ? 'customer' : 'customers'}
      </p>

      <ul className="data-list">
        {list.map((c) => {
          const mergedKeys = c.keys.filter((k) => k !== c.key && rules.customerAliases[k]);
          return (
            <li key={c.key} className={c.hidden ? 'data-row is-hidden' : 'data-row'}>
              <label className="data-check">
                <input
                  type="checkbox"
                  checked={selected.includes(c.key)}
                  onChange={() => toggle(c.key)}
                  aria-label={`Select ${label(c)}`}
                />
              </label>
              <div className="data-body">
                <button type="button" className="data-main" onClick={() => openRow(c)} aria-expanded={open === c.key}>
                  <strong>{label(c)}</strong>
                  <span className="data-sub">{[c.phone, c.address && c.name].filter(Boolean).join(' · ')}</span>
                  <span className="data-sub">
                    {c.bills} {c.bills === 1 ? 'bill' : 'bills'} · {formatMoney(c.total)}
                    {c.lastAt && ` · last ${formatWhen(c.lastAt)}`}
                  </span>
                  {c.hidden && <span className="data-sub">Hidden from suggestions</span>}
                </button>
                {open === c.key && form && (
                  <div className="data-detail">
                    <div className="data-form">
                      <input
                        placeholder="Address"
                        aria-label="Address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        aria-label="Phone"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                      <input
                        placeholder="Name"
                        aria-label="Name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                      />
                    </div>
                    <div className="data-actions">
                      <button type="button" className="btn btn-primary btn-small" onClick={() => saveEdit(c)} disabled={busy}>
                        Save
                      </button>
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => onShowBills(c)}>
                        See bills
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() =>
                          apply(toggleHideCustomer(rules, c.key), c.hidden ? 'Suggested again' : 'Hidden from suggestions')
                        }
                        disabled={busy}
                      >
                        {c.hidden ? 'Show in suggestions' : 'Hide'}
                      </button>
                    </div>
                    {mergedKeys.length > 0 && (
                      <ul className="data-spellings">
                        {mergedKeys.map((k) => (
                          <li key={k}>
                            <span>Also: {describeKey(k)}</span>
                            <button
                              type="button"
                              className="link"
                              onClick={() => apply(separateCustomer(rules, k), 'Separated')}
                              disabled={busy}
                            >
                              Separate
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      {catalog.customers.length === 0 && <p className="muted">Customers appear here once bills are saved.</p>}

      {selected.length > 0 && (
        <div className="merge-bar">
          <span>{selected.length} selected</span>
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setSelected([])}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary btn-small" onClick={merge} disabled={selected.length < 2 || busy}>
            Merge
          </button>
        </div>
      )}
    </section>
  );
}
