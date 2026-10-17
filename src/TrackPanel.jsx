import { formatMoney, formatWhen } from './format';
import { PAY_LABELS, PAY_METHODS, STEPS, STEP_LABELS, deliveryStep, paymentState } from './tracking.mjs';

const time = (iso) => new Date(iso).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });

// Where this bill's delivery and money are: one tap each. The delivery boy's page marks
// the same things; cash he collects waits here until "Got it", UPI until "received".
export default function TrackPanel({ bill, onTrack }) {
  const events = bill.deliveryEvents || {};
  const p = bill.paymentStatus;
  const pay = paymentState(bill);
  const step = deliveryStep(bill);

  const setPayment = (method) => {
    if (p?.method === method) {
      if (p.by === 'delivery' && !window.confirm(`${p.person?.name || 'The delivery boy'} marked this. Clear it?`)) return;
      onTrack({ payment: null });
    } else {
      onTrack({ payment: { method } });
    }
  };

  let note = '';
  if (p?.by === 'delivery') note = `${p.person?.name} marked ${PAY_LABELS[p.method]} ${formatMoney(p.amount)} · ${formatWhen(p.at)}`;
  else if (pay.key === 'due') note = 'Delivered. Payment not marked yet.';
  else if (step === 'assigned') note = `${bill.delivery.name} can see this order on his phone.`;

  return (
    <section className="track" aria-label="Delivery and payment">
      <div className="track-row">
        <span className="track-label">Delivery</span>
        <div className="track-chips">
          {STEPS.map((s) => {
            const done = Boolean(events[s]);
            return (
              <button
                key={s}
                type="button"
                className={done ? 'track-chip on' : 'track-chip'}
                aria-pressed={done}
                onClick={() => onTrack(done ? { step: s, undo: true } : { step: s })}
              >
                {STEP_LABELS[s]}
                {done && <small>{time(events[s])}</small>}
              </button>
            );
          })}
        </div>
      </div>
      <div className="track-row">
        <span className="track-label">Payment</span>
        <div className="track-chips">
          {PAY_METHODS.map((m) => (
            <button
              key={m}
              type="button"
              className={p?.method === m ? 'track-chip on' : 'track-chip'}
              aria-pressed={p?.method === m}
              onClick={() => setPayment(m)}
            >
              {PAY_LABELS[m]}
            </button>
          ))}
        </div>
      </div>
      {(pay.label || note) && (
        <p className="track-note">
          {pay.label && <span className={`pay-chip pay-${pay.tone}`}>{pay.label}</span>}
          {note && <span>{note}</span>}
        </p>
      )}
      {pay.key === 'cashWith' && (
        <button type="button" className="btn btn-secondary btn-money btn-wide" onClick={() => onTrack({ handover: true })}>
          Got {formatMoney(p.amount)} from {p.person?.name}
        </button>
      )}
      {pay.key === 'upiCheck' && (
        <button type="button" className="btn btn-secondary btn-money btn-wide" onClick={() => onTrack({ confirmUpi: true })}>
          UPI {formatMoney(p.amount)} received
        </button>
      )}
    </section>
  );
}
