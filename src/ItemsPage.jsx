import { useEffect, useState } from 'react';
import { mergeItems, norm, renameItem, separateSpelling, toggleHideItem } from './catalog';
import { formatAmount, formatWhen } from './format';

const SORTS = {
  bills: (a, b) => b.bills - a.bills || new Date(b.lastAt) - new Date(a.lastAt),
  recent: (a, b) => new Date(b.lastAt) - new Date(a.lastAt),
  name: (a, b) => a.name.localeCompare(b.name, 'en-IN', { sensitivity: 'base' }),
};

// Everything he has billed, worked out from the bills. Tick misspellings of the
// same item and Merge them; open an item to rename, hide or separate a spelling.
// Bills themselves are never changed.
export default function ItemsPage({ data, onRefresh, onRulesChange, notify }) {
  const { catalog, rules } = data;
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('bills');
  const [showHidden, setShowHidden] = useState(false);
  const [selected, setSelected] = useState([]);
  const [open, setOpen] = useState(null);
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
  const hiddenCount = catalog.items.filter((i) => i.hidden).length;
  const list = catalog.items
    .filter((i) => showHidden || !i.hidden)
    .filter((i) => !nq || [i.name, ...i.spellings].some((s) => norm(s).includes(nq)))
    .sort(SORTS[sort]);
  const picked = catalog.items.filter((i) => selected.includes(i.key));
  const toggle = (key) => setSelected((s) => (s.includes(key) ? s.filter((k) => k !== key) : [...s, key]));

  const merge = async () => {
    const { target, rules: next } = mergeItems(rules, picked);
    const names = picked.map((i) => `"${i.name}"`).join(', ');
    if (!window.confirm(`Merge ${names} into "${target.name}"? They will all be suggested as "${target.name}".`)) return;
    if (await apply(next, `Merged into ${target.name}`)) setSelected([]);
  };

  const rename = (item) => {
    const name = window.prompt('New name for this item', item.name);
    if (name && name.trim() && name.trim() !== item.name) apply(renameItem(rules, item.key, name), 'Renamed');
  };

  return (
    <section className="data-page">
      <p className="data-help">
        Every item from the bills. Tick spellings of the same item and tap Merge. Bills stay as they were typed.
      </p>
      <input
        type="search"
        className="bills-search"
        placeholder="Search items"
        aria-label="Search items"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="bills-bar">
        <select aria-label="Sort items" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="bills">Most sold</option>
          <option value="recent">Recently sold</option>
          <option value="name">Name A–Z</option>
        </select>
        {hiddenCount > 0 && (
          <button type="button" className="btn btn-secondary btn-small" onClick={() => setShowHidden((v) => !v)}>
            {showHidden ? 'Hide hidden' : `Show hidden (${hiddenCount})`}
          </button>
        )}
      </div>
      <p className="bills-summary">
        {list.length} {list.length === 1 ? 'item' : 'items'}
      </p>

      <ul className="data-list">
        {list.map((item) => {
          const others = item.spellings.filter((s) => s !== item.name);
          const merged = item.spellings.filter((s) => norm(s) !== item.key);
          return (
            <li key={item.key} className={item.hidden ? 'data-row is-hidden' : 'data-row'}>
              <label className="data-check">
                <input
                  type="checkbox"
                  checked={selected.includes(item.key)}
                  onChange={() => toggle(item.key)}
                  aria-label={`Select ${item.name}`}
                />
              </label>
              <div className="data-body">
                <button
                  type="button"
                  className="data-main"
                  onClick={() => setOpen(open === item.key ? null : item.key)}
                  aria-expanded={open === item.key}
                >
                  <strong>{item.name}</strong>
                  <span className="data-sub">
                    {[
                      item.details,
                      item.rate !== null && `₹${formatAmount(item.rate)}`,
                      `${item.bills} ${item.bills === 1 ? 'bill' : 'bills'}`,
                      item.lastAt && formatWhen(item.lastAt),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                  {others.length > 0 && <span className="data-sub">Also typed as: {others.join(', ')}</span>}
                  {item.hidden && <span className="data-sub">Hidden from suggestions</span>}
                </button>
                {open === item.key && (
                  <div className="data-detail">
                    <div className="data-actions">
                      <button type="button" className="btn btn-secondary btn-small" onClick={() => rename(item)} disabled={busy}>
                        Rename
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary btn-small"
                        onClick={() =>
                          apply(toggleHideItem(rules, item.key), item.hidden ? 'Suggested again' : 'Hidden from suggestions')
                        }
                        disabled={busy}
                      >
                        {item.hidden ? 'Show in suggestions' : 'Hide from suggestions'}
                      </button>
                    </div>
                    {merged.length > 0 && (
                      <ul className="data-spellings">
                        {merged.map((spelling) => (
                          <li key={spelling}>
                            <span>{spelling}</span>
                            <button
                              type="button"
                              className="link"
                              onClick={() => apply(separateSpelling(rules, norm(spelling)), `"${spelling}" is separate again`)}
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
      {catalog.items.length === 0 && <p className="muted">Items appear here once bills are saved.</p>}

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
