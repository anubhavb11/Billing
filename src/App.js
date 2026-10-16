import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { createBill, getPin, getSettings, markSent, putSettings, updateBill } from './api';
import Billing from './Billing';
import Bills from './Bills';
import { DEFAULT_FILTERS } from './billsFilter';
import {
  billPayload,
  draftAsBill,
  draftFromBill,
  hasUnsavedWork,
  loadDraft,
  missingRates,
  newDraft,
  rowHasContent,
  saveDraft,
} from './bill';
import Invoice from './Invoice';
import Logo from './Logo';
import PinScreen from './PinScreen';
import SendSheet from './SendSheet';
import Settings from './Settings';
import { cacheSettings, cachedSettings, defaultPayment, paymentSnapshot, resolveBill } from './shopSettings';
import { preloadImageTools } from './share';

// "#/" is the bill on screen, "#/view" its invoice, "#/bills" the list (Master
// View), "#/settings" payment QRs and delivery people. Hash links keep the phone's
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

const PAGES = { '#/bills': 'bills', '#/view': 'view', '#/settings': 'settings' };
const TITLES = { bills: 'Master View', view: 'View', settings: 'Settings' };

const confirmRates = (items) => {
  const n = missingRates(items);
  return n === 0 || window.confirm(`${n} ${n === 1 ? 'item has' : 'items have'} no qty or rate yet. Send anyway?`);
};

const isBlank = (draft) => !draft.billNo && !draft.dirty && !draft.items.some(rowHasContent);

export default function App() {
  const hash = useHash();
  const [unlocked, setUnlocked] = useState(() => getPin() !== '');
  const [draft, setDraft] = useState(loadDraft);
  const [bills, setBills] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [settings, setSettings] = useState(cachedSettings);
  const [toast, setToast] = useState(null);
  const [saving, setSaving] = useState(false);
  const [sendTarget, setSendTarget] = useState(null); // bill shown in the Send sheet
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const sendBill = useMemo(() => sendTarget && resolveBill(sendTarget, settings), [sendTarget, settings]);

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

  useEffect(() => {
    if (!unlocked) return undefined;
    getSettings()
      .then((fresh) => {
        setSettings(fresh);
        cacheSettings(fresh);
      })
      .catch(() => {}); // offline: the cached settings are used
    const timer = setTimeout(() => preloadImageTools().catch(() => {}), 1500);
    return () => clearTimeout(timer);
  }, [unlocked]);

  // A fresh, untouched bill gets the default payment QR.
  useEffect(() => {
    const fallback = paymentSnapshot(defaultPayment(settings));
    setDraft((d) => (isBlank(d) && !d.payment && fallback ? { ...d, payment: fallback } : d));
  }, [settings]);

  const notify = useCallback((message) => setToast({ message, at: Date.now() }), []);

  const startNewBill = () => setDraft({ ...newDraft(), payment: paymentSnapshot(defaultPayment(settings)) });

  const saveSettings = async (next) => {
    const saved = await putSettings(next);
    setSettings(saved);
    cacheSettings(saved);
    return saved;
  };

  const upsertCached = (bill) =>
    setBills((list) => list && [bill, ...list.filter((b) => b.billNo !== bill.billNo)]);
  const onDeleted = (billNo) => setBills((list) => list && list.filter((b) => b.billNo !== billNo));

  // New status from the server, without touching what is being typed.
  const applyBill = (bill) => {
    upsertCached(bill);
    setDraft((d) =>
      d.billNo === bill.billNo
        ? { ...d, status: bill.status, sentAt: bill.sentAt, updatedAt: bill.updatedAt, shareToken: bill.shareToken }
        : d
    );
  };

  const saveCurrent = async () => {
    const current = draftRef.current;
    const rev = current.rev;
    const payload = billPayload(current);
    const bill = current.billNo ? await updateBill(current.billNo, payload) : await createBill(payload);
    setDraft((d) =>
      d.billNo !== current.billNo
        ? d // another bill was opened while saving
        : {
            ...d,
            billNo: bill.billNo,
            createdAt: bill.createdAt,
            updatedAt: bill.updatedAt,
            status: bill.status,
            sentAt: bill.sentAt,
            shareToken: bill.shareToken,
            dirty: d.rev !== rev, // anything typed while saving stays unsaved
          }
    );
    upsertCached(bill);
    return bill;
  };

  const onSent = async (bill) => {
    try {
      applyBill(await markSent(bill.billNo));
      notify(`Sent · Bill #${bill.billNo}`);
    } catch {
      notify('Sent, but could not mark it as sent.');
    }
  };

  // Send from the bill screen or View: save first if needed, then show the choices.
  const sendCurrent = async () => {
    const current = draftRef.current;
    if (!current.items.some(rowHasContent)) {
      notify('Add at least one item before sending.');
      return;
    }
    if (!confirmRates(current.items)) return;
    setSaving(true);
    try {
      const bill = current.dirty || !current.billNo ? await saveCurrent() : draftAsBill(current);
      setSendTarget(bill);
    } catch (err) {
      if (err.status !== 401) notify(`Not saved. ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const sendFromList = (bill) => {
    if (confirmRates(bill.items)) setSendTarget(bill);
  };

  const editBill = (bill) => {
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

  const page = PAGES[hash] ?? 'bill';
  return (
    <div className="app">
      {page !== 'bill' && (
        <nav className="back-bar">
          <a href="#/" className="btn btn-back">
            ← Bill
          </a>
          <Logo size={26} />
          <span className="back-title">{TITLES[page]}</span>
          {page === 'bills' && (
            <a href="#/settings" className="back-link">
              Settings
            </a>
          )}
        </nav>
      )}

      {page === 'bills' && (
        <Bills
          bills={bills}
          setBills={setBills}
          filters={filters}
          setFilters={setFilters}
          onEdit={editBill}
          onSend={sendFromList}
        />
      )}
      {page === 'view' && (
        <Invoice draft={draft} settings={settings} onSend={sendCurrent} busy={saving} />
      )}
      {page === 'settings' && <Settings settings={settings} onChange={saveSettings} notify={notify} />}
      {page === 'bill' && (
        <Billing
          draft={draft}
          setDraft={setDraft}
          settings={settings}
          notify={notify}
          onSave={saveCurrent}
          onSend={sendCurrent}
          onNew={startNewBill}
          sending={saving}
          onDeleted={onDeleted}
        />
      )}

      {sendBill && (
        <SendSheet
          bill={sendBill}
          onClose={() => setSendTarget(null)}
          onSent={onSent}
          notify={notify}
        />
      )}

      {toast && (
        <div className="toast" role="status" key={toast.at}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
