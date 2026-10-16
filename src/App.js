import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { createBill, getPin, getSettings, markSent, putSettings, updateBill } from './api';
import Billing from './Billing';
import Bills from './Bills';
import { DEFAULT_FILTERS } from './billsFilter';
import {
  billPayload,
  draftFromBill,
  hasUnsavedWork,
  loadDraft,
  newDraft,
  rowHasContent,
  saveDraft,
} from './bill';
import { BackIcon, SettingsIcon } from './Icons';
import Logo from './Logo';
import PinScreen from './PinScreen';
import SendPage from './SendPage';
import Settings from './Settings';
import { cacheSettings, cachedSettings, defaultPayment, paymentSnapshot } from './shopSettings';
import { preloadImageTools } from './share';

// "#/" is the bill on screen, "#/send" its picture and Send on WhatsApp, "#/bills"
// All bills, "#/settings" payment QRs and delivery people. Hash links keep the
// phone's back button working on any static host.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const PAGES = { '#/bills': 'bills', '#/send': 'send', '#/view': 'send', '#/settings': 'settings' };
const TITLES = { bills: 'All bills', send: 'View & Send', settings: 'Settings' };
const AUTOSAVE_DELAY = 1000;

const isBlank = (draft) => !draft.billNo && !draft.dirty && !draft.items.some(rowHasContent);
// A bill is saved once it has at least one item; until then it only lives on the phone.
const needsSave = (draft) => draft.dirty && draft.items.some(rowHasContent);

export default function App() {
  const hash = useHash();
  const [unlocked, setUnlocked] = useState(() => getPin() !== '');
  const [draft, setDraft] = useState(loadDraft);
  const [bills, setBills] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [settings, setSettings] = useState(cachedSettings);
  const [toast, setToast] = useState(null);
  const [saveState, setSaveState] = useState('idle'); // idle | saving | offline | error
  const draftRef = useRef(draft);
  draftRef.current = draft;
  const saving = useRef(null); // the save in flight, so only one runs at a time

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

  const upsertCached = (bill) =>
    setBills((list) => list && [bill, ...list.filter((b) => b.billNo !== bill.billNo)]);

  // New status from the server, without touching what is being typed.
  const applyBill = (bill) => {
    upsertCached(bill);
    setDraft((d) =>
      d.billNo === bill.billNo
        ? { ...d, status: bill.status, sentAt: bill.sentAt, updatedAt: bill.updatedAt, shareToken: bill.shareToken }
        : d
    );
  };

  // Saves the bill on screen if it has changes. Saves run one after another, and a
  // new bill's number is noted straight away so the next save updates it instead
  // of making a second bill.
  const saveNow = useCallback(async () => {
    while (saving.current) await saving.current.catch(() => {});
    const current = draftRef.current;
    if (!needsSave(current)) return null;
    const { key, rev } = current;
    const payload = billPayload(current);
    const request = current.billNo ? updateBill(current.billNo, payload) : createBill(payload);
    saving.current = request;
    setSaveState('saving');
    try {
      const bill = await request;
      if (draftRef.current.key === key) draftRef.current = { ...draftRef.current, billNo: bill.billNo };
      setDraft((d) =>
        d.key !== key
          ? d // he moved to another bill meanwhile; this one is saved
          : {
              ...d,
              billNo: bill.billNo,
              createdAt: bill.createdAt,
              updatedAt: bill.updatedAt,
              status: bill.status,
              sentAt: bill.sentAt,
              shareToken: bill.shareToken,
              dirty: d.rev !== rev, // anything typed while saving is saved next
            }
      );
      upsertCached(bill);
      setSaveState('idle');
      return bill;
    } catch (err) {
      setSaveState(err.status === 0 ? 'offline' : 'error');
      throw err;
    } finally {
      saving.current = null;
    }
  }, []);

  // Auto-save: a second after he stops typing, and again when the internet is back.
  useEffect(() => {
    if (!unlocked || !needsSave(draft)) return undefined;
    const timer = setTimeout(() => saveNow().catch(() => {}), AUTOSAVE_DELAY);
    return () => clearTimeout(timer);
  }, [draft, unlocked, saveNow]);

  useEffect(() => {
    const retry = () => needsSave(draftRef.current) && saveNow().catch(() => {});
    window.addEventListener('online', retry);
    return () => window.removeEventListener('online', retry);
  }, [saveNow]);

  const startNewBill = () => {
    setDraft({ ...newDraft(), payment: paymentSnapshot(defaultPayment(settings)) });
    setSaveState('idle');
  };

  // Finish saving the bill on screen before leaving it. Returns false if he chose to stay.
  const settleCurrent = async (leaving) => {
    const current = draftRef.current;
    if (!current.items.some(rowHasContent) && hasUnsavedWork(current)) {
      // Only customer details typed: nothing to save yet.
      return window.confirm(`Clear what you typed? ${leaving}`);
    }
    try {
      await saveNow();
      return true;
    } catch (err) {
      if (err.status === 401) return false;
      return window.confirm(`This bill isn't saved yet (no internet). ${leaving} anyway?`);
    }
  };

  const clearBill = async () => {
    const billNo = draftRef.current.billNo;
    if (!(await settleCurrent('Start a new bill'))) return;
    startNewBill();
    if (billNo) notify(`Bill #${billNo} is saved in All bills`);
  };

  const viewAndSend = async () => {
    if (!draftRef.current.items.some(rowHasContent)) {
      notify('Add at least one item first.');
      return;
    }
    try {
      await saveNow();
      window.location.hash = '#/send';
    } catch (err) {
      if (err.status !== 401) notify(`Not saved. ${err.message}`);
    }
  };

  const openBill = async (bill, page) => {
    if (draftRef.current.billNo !== bill.billNo && !(await settleCurrent(`Open bill #${bill.billNo}`))) return;
    if (draftRef.current.billNo !== bill.billNo) setDraft(draftFromBill(bill));
    window.location.hash = page;
  };

  const onDeleted = (billNo) => {
    setBills((list) => list && list.filter((b) => b.billNo !== billNo));
    startNewBill();
  };

  const onSent = async (bill) => {
    try {
      applyBill(await markSent(bill.billNo));
    } catch {
      notify('Sent, but could not mark it as sent.');
    }
  };

  const saveSettings = async (next) => {
    const saved = await putSettings(next);
    setSettings(saved);
    cacheSettings(saved);
    return saved;
  };

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const page = PAGES[hash] ?? 'bill';
  return (
    <div className="app">
      {page !== 'bill' && (
        <nav className="back-bar">
          <a href={page === 'settings' ? '#/bills' : '#/'} className="btn btn-secondary btn-small">
            <BackIcon size={20} />
            {page === 'settings' ? 'All bills' : 'Bill'}
          </a>
          <Logo size={28} />
          <span className="back-title">{TITLES[page]}</span>
          {page === 'bills' && (
            <a href="#/settings" className="icon-button" aria-label="Settings">
              <SettingsIcon size={24} />
            </a>
          )}
        </nav>
      )}

      {page === 'bill' && (
        <Billing
          draft={draft}
          setDraft={setDraft}
          settings={settings}
          saveState={saveState}
          notify={notify}
          onClear={clearBill}
          onSend={viewAndSend}
          onDeleted={onDeleted}
        />
      )}
      {page === 'send' && (
        <SendPage
          draft={draft}
          settings={settings}
          onSent={onSent}
          onNewBill={() => {
            startNewBill();
            window.location.hash = '#/';
          }}
          notify={notify}
        />
      )}
      {page === 'bills' && (
        <Bills
          bills={bills}
          setBills={setBills}
          filters={filters}
          setFilters={setFilters}
          onEdit={(bill) => openBill(bill, '#/')}
          onSend={(bill) => openBill(bill, '#/send')}
        />
      )}
      {page === 'settings' && <Settings settings={settings} onChange={saveSettings} notify={notify} />}

      {toast && (
        <div className="toast" role="status" key={toast.at}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
