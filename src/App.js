import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { getPin } from './api';
import Billing from './Billing';
import Bills from './Bills';
import { DEFAULT_FILTERS } from './billsFilter';
import { draftFromBill, hasUnsavedWork, loadDraft, saveDraft } from './bill';
import PinScreen from './PinScreen';

// "#/" is the bill on screen, "#/bills" the list. Hash links keep the phone's
// back button working on any static host.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

export default function App() {
  const hash = useHash();
  const [unlocked, setUnlocked] = useState(() => getPin() !== '');
  const [draft, setDraft] = useState(loadDraft);
  const [bills, setBills] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [toast, setToast] = useState(null);

  useEffect(() => saveDraft(draft), [draft]);

  useEffect(() => {
    const lock = () => setUnlocked(false);
    window.addEventListener('pin-required', lock);
    return () => window.removeEventListener('pin-required', lock);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  const notify = useCallback((message) => setToast({ message, at: Date.now() }), []);

  const onSaved = (bill) =>
    setBills((list) => list && [bill, ...list.filter((b) => b.billNo !== bill.billNo)]);
  const onDeleted = (billNo) => setBills((list) => list && list.filter((b) => b.billNo !== billNo));

  const openBill = (bill) => {
    if (
      hasUnsavedWork(draft) &&
      draft.billNo !== bill.billNo &&
      !window.confirm(`The bill on screen is not saved. Open bill #${bill.billNo} anyway?`)
    ) {
      return;
    }
    setDraft(draftFromBill(bill));
    window.location.hash = '#/';
  };

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const onList = hash === '#/bills';
  return (
    <div className="app">
      <nav className="tabs">
        <a href="#/" className={onList ? 'tab' : 'tab active'}>
          Bill
        </a>
        <a href="#/bills" className={onList ? 'tab active' : 'tab'}>
          All Bills
        </a>
      </nav>

      {onList ? (
        <Bills bills={bills} setBills={setBills} filters={filters} setFilters={setFilters} onOpen={openBill} />
      ) : (
        <Billing draft={draft} setDraft={setDraft} notify={notify} onSaved={onSaved} onDeleted={onDeleted} />
      )}

      {toast && (
        <div className="toast" role="status" key={toast.at}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
