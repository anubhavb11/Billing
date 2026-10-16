import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { createBill, getPin, markSent, updateBill } from './api';
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
  rowHasContent,
  saveDraft,
} from './bill';
import Invoice from './Invoice';
import PinScreen from './PinScreen';
import { preloadImageTools, renderBillImage, shareCaption, shareFile, waLink } from './share';

// "#/" is the bill on screen, "#/view" its invoice, "#/bills" the list (Master
// View). Hash links keep the phone's back button working on any static host.
function useHash() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return hash;
}

const confirmRates = (items) => {
  const n = missingRates(items);
  return n === 0 || window.confirm(`${n} ${n === 1 ? 'item has' : 'items have'} no qty or rate yet. Send anyway?`);
};

export default function App() {
  const hash = useHash();
  const [unlocked, setUnlocked] = useState(() => getPin() !== '');
  const [draft, setDraft] = useState(loadDraft);
  const [bills, setBills] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [toast, setToast] = useState(null);
  const [sending, setSending] = useState(null); // 'current' or a bill number
  const draftRef = useRef(draft);
  draftRef.current = draft;

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
    const timer = setTimeout(() => preloadImageTools().catch(() => {}), 1500);
    return () => clearTimeout(timer);
  }, [unlocked]);

  const notify = useCallback((message) => setToast({ message, at: Date.now() }), []);

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

  // Opens the phone's share menu with the bill picture (WhatsApp etc.). If the
  // phone wants a fresh tap, the View screen opens with the picture ready.
  const deliver = async (bill, file) => {
    const picture = file ?? (await renderBillImage(bill));
    const result = await shareFile(picture, shareCaption(bill));
    if (result === 'shared') {
      try {
        applyBill(await markSent(bill.billNo));
        notify(`Sent · Bill #${bill.billNo}`);
      } catch {
        notify('Shared, but could not mark it as sent.');
      }
    } else if (result !== 'cancelled') {
      window.location.hash = '#/view';
      if (result === 'blocked') notify('Picture ready. Tap Send to customer.');
    }
  };

  const failed = (err) => err.status !== 401 && notify(`Not sent. ${err.message}`);

  const sendCurrent = async (readyFile = null) => {
    const current = draftRef.current;
    if (!current.items.some(rowHasContent)) {
      notify('Add at least one item before sending.');
      return;
    }
    if (!confirmRates(current.items)) return;
    setSending('current');
    try {
      const unsaved = current.dirty || !current.billNo;
      const bill = unsaved ? await saveCurrent() : draftAsBill(current);
      await deliver(bill, unsaved ? null : readyFile);
    } catch (err) {
      failed(err);
    } finally {
      setSending(null);
    }
  };

  const whatsAppCurrent = async () => {
    const current = draftRef.current;
    if (!confirmRates(current.items)) return;
    setSending('current');
    try {
      const bill = current.dirty || !current.billNo ? await saveCurrent() : draftAsBill(current);
      try {
        applyBill(await markSent(bill.billNo));
      } catch {
        // Still open WhatsApp; the bill just stays a draft.
      }
      window.location.href = waLink(current.customerPhone, bill);
    } catch (err) {
      failed(err);
    } finally {
      setSending(null);
    }
  };

  const okToSwitch = (bill) =>
    !hasUnsavedWork(draft) ||
    draft.billNo === bill.billNo ||
    window.confirm(`The bill on screen is not saved. Open bill #${bill.billNo} anyway?`);

  const editBill = (bill) => {
    if (!okToSwitch(bill)) return;
    setDraft(draftFromBill(bill));
    window.location.hash = '#/';
  };

  const sendFromList = async (bill) => {
    if (!okToSwitch(bill) || !confirmRates(bill.items)) return;
    setDraft(draftFromBill(bill));
    setSending(bill.billNo);
    try {
      await deliver(bill, null);
    } catch (err) {
      failed(err);
    } finally {
      setSending(null);
    }
  };

  if (!unlocked) return <PinScreen onUnlock={() => setUnlocked(true)} />;

  const page = hash === '#/bills' ? 'bills' : hash === '#/view' ? 'view' : 'bill';
  return (
    <div className="app">
      {page !== 'bill' && (
        <nav className="back-bar">
          <a href="#/" className="btn btn-back">
            ← Bill
          </a>
          <span className="back-title">{page === 'view' ? 'View' : 'Master View'}</span>
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
          sending={sending}
        />
      )}
      {page === 'view' && (
        <Invoice draft={draft} onSend={sendCurrent} onWhatsApp={whatsAppCurrent} sending={sending !== null} />
      )}
      {page === 'bill' && (
        <Billing
          draft={draft}
          setDraft={setDraft}
          notify={notify}
          onSave={saveCurrent}
          onSend={() => sendCurrent()}
          sending={sending !== null}
          onDeleted={onDeleted}
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
