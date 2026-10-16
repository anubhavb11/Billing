import { changedSinceSent, missingRates } from './bill';

// Draft / Sent / Changed after sending, plus how many rows still need a qty or rate.
export default function StatusChips({ bill }) {
  const missing = missingRates(bill.items);
  let status = <span className="chip-status chip-draft">Draft</span>;
  if (bill.status === 'sent') {
    status = changedSinceSent(bill) ? (
      <span className="chip-status chip-changed">Changed after sending</span>
    ) : (
      <span className="chip-status chip-sent">Sent</span>
    );
  }
  return (
    <span className="status-chips">
      {status}
      {missing > 0 && (
        <span className="chip-status chip-missing">
          {missing} {missing === 1 ? 'rate' : 'rates'} missing
        </span>
      )}
    </span>
  );
}
