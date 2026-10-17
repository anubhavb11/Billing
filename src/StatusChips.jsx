import { changedSinceSent, missingRates } from './bill';
import { deliveryLabel, deliveryStep, paymentState } from './tracking.mjs';

// Draft / Sent / Changed after sending, plus how many rows still need a qty or rate.
// withTracking adds where the delivery and the money are (All bills cards).
export default function StatusChips({ bill, withTracking = false }) {
  const missing = missingRates(bill.items);
  const pay = paymentState(bill);
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
      {withTracking && deliveryStep(bill) !== 'none' && (
        <span className="chip-status chip-delivery">{deliveryLabel(bill)}</span>
      )}
      {withTracking && pay.label && <span className={`chip-status pay-chip pay-${pay.tone}`}>{pay.label}</span>}
    </span>
  );
}
