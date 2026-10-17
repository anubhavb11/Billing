import { useState } from 'react';
import QrCode from './QrCode';
import { readQrPhoto } from './qrPhoto';
import { UPI_ID, newId, paymentKind, qrText } from './shopSettings';

const preview = (payment) =>
  payment.type === 'image' ? (
    <img className="settings-qr-photo" src={payment.image} alt="" />
  ) : (
    <QrCode text={qrText(payment, { total: 0, billNo: null })} size={56} />
  );

// Payment QRs (picked at the end of each bill) and delivery people.
export default function Settings({ settings, onChange, notify }) {
  const [upi, setUpi] = useState({ label: '', upiId: '' });
  const [qrLabel, setQrLabel] = useState('');
  const [reading, setReading] = useState(false);
  const [person, setPerson] = useState({ name: '', phone: '', pin: '' });
  const [error, setError] = useState('');

  const save = async (next, message) => {
    setError('');
    try {
      await onChange(next);
      notify(message);
      return true;
    } catch (err) {
      if (err.status !== 401) setError(`Not saved. ${err.message}`);
      return false;
    }
  };

  const addPayment = (payment, message) =>
    save(
      {
        ...settings,
        payments: [...settings.payments, payment],
        defaultPaymentId: settings.defaultPaymentId ?? payment.id,
      },
      message
    );

  const addUpi = async (e) => {
    e.preventDefault();
    const upiId = upi.upiId.trim();
    if (!UPI_ID.test(upiId)) {
      setError('That UPI ID doesn’t look right. It should look like name@okicici.');
      return;
    }
    const payment = { id: newId(), type: 'upi', label: upi.label.trim() || upiId, upiId, payeeName: '' };
    if (await addPayment(payment, 'UPI ID added')) setUpi({ label: '', upiId: '' });
  };

  const addQrPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setReading(true);
    setError('');
    try {
      const result = await readQrPhoto(file);
      const label = qrLabel.trim() || 'Shop QR';
      const payment = result.payload
        ? { id: newId(), type: 'qr', label, payload: result.payload }
        : { id: newId(), type: 'image', label, image: result.image };
      const message = result.payload ? 'QR added' : 'Couldn’t read the QR, so the photo is used as it is';
      if (await addPayment(payment, message)) setQrLabel('');
    } catch (err) {
      setError(err.message);
    } finally {
      setReading(false);
    }
  };

  const removePayment = (payment) => {
    if (!window.confirm(`Remove "${payment.label}"? Bills already made with it keep showing it.`)) return;
    const payments = settings.payments.filter((p) => p.id !== payment.id);
    const defaultPaymentId =
      settings.defaultPaymentId === payment.id ? payments[0]?.id ?? null : settings.defaultPaymentId;
    save({ ...settings, payments, defaultPaymentId }, 'Removed');
  };

  const addPerson = async (e) => {
    e.preventDefault();
    const name = person.name.trim();
    if (!name) {
      setError('Write the delivery person’s name.');
      return;
    }
    const pin = person.pin.trim();
    if (pin && !/^\d{4,6}$/.test(pin)) {
      setError('The PIN must be 4 to 6 digits.');
      return;
    }
    const added = { id: newId(), name, phone: person.phone.trim(), ...(pin && { pin }) };
    const next = { ...settings, delivery: [...settings.delivery, added] };
    if (await save(next, `${name} added`)) setPerson({ name: '', phone: '', pin: '' });
  };

  // The PIN he types on the delivery page, with his mobile number. Stored only as a hash.
  const setPin = (p) => {
    const pin = window.prompt(`New delivery-app PIN for ${p.name} (4 to 6 digits):`, '');
    if (pin === null) return;
    if (!/^\d{4,6}$/.test(pin.trim())) {
      setError('The PIN must be 4 to 6 digits.');
      return;
    }
    const delivery = settings.delivery.map((d) => (d.id === p.id ? { ...d, pin: pin.trim() } : d));
    save({ ...settings, delivery }, `${p.name}'s PIN is set`);
  };

  const removePerson = (p) => {
    if (!window.confirm(`Remove ${p.name}?`)) return;
    save({ ...settings, delivery: settings.delivery.filter((d) => d.id !== p.id) }, 'Removed');
  };

  return (
    <section className="settings">
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      <h3>Payment QR on bills</h3>
      <p className="muted">Pick one at the end of each bill. The customer scans it to pay.</p>
      <ul className="settings-list">
        {settings.payments.map((p) => (
          <li key={p.id} className="settings-item">
            <div className="settings-qr">{preview(p)}</div>
            <div className="settings-text">
              <strong>{p.label}</strong>
              <span className="muted">{paymentKind(p)}</span>
              {p.id === settings.defaultPaymentId && <span className="chip-status chip-sent">Default</span>}
            </div>
            <div className="settings-actions">
              {p.id !== settings.defaultPaymentId && (
                <button
                  type="button"
                  className="link"
                  onClick={() => save({ ...settings, defaultPaymentId: p.id }, `${p.label} is now the default`)}
                >
                  Make default
                </button>
              )}
              <button type="button" className="link-danger" onClick={() => removePayment(p)}>
                Remove
              </button>
            </div>
          </li>
        ))}
        {settings.payments.length === 0 && <li className="muted">No payment QR yet.</li>}
      </ul>

      <form className="settings-form" onSubmit={addUpi}>
        <strong>Add a UPI ID</strong>
        <span className="muted">The QR is made for you, with each bill&rsquo;s amount filled in.</span>
        <input
          placeholder="Name on bill, e.g. Shop GPay"
          value={upi.label}
          onChange={(e) => setUpi({ ...upi, label: e.target.value })}
        />
        <input
          placeholder="UPI ID, e.g. bansalstore@okicici"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          value={upi.upiId}
          onChange={(e) => setUpi({ ...upi, upiId: e.target.value })}
        />
        <button type="submit" className="btn btn-primary">
          Add UPI ID
        </button>
      </form>

      <div className="settings-form">
        <strong>Or add a QR photo</strong>
        <span className="muted">
          For business QRs that don&rsquo;t show a UPI ID. Take a clear, straight photo of the QR (or pick a screenshot).
        </span>
        <input
          placeholder="Name on bill, e.g. PhonePe QR"
          value={qrLabel}
          onChange={(e) => setQrLabel(e.target.value)}
        />
        <label className={reading ? 'btn btn-secondary disabled' : 'btn btn-secondary'}>
          {reading ? 'Reading QR…' : 'Take or choose photo'}
          <input type="file" accept="image/*" hidden disabled={reading} onChange={addQrPhoto} />
        </label>
      </div>

      <h3>Delivery people</h3>
      <p className="muted">
        Pick one at the end of a bill; their name and number show on it. With a PIN, they open{' '}
        <strong>{window.location.host}/d</strong> on their phone and log in with their mobile number and PIN to see
        their orders.
      </p>
      <ul className="settings-list">
        {settings.delivery.map((p) => (
          <li key={p.id} className="settings-item">
            <div className="settings-text">
              <strong>{p.name}</strong>
              <span className="muted">{p.phone || 'No number'}</span>
              <span className={p.hasPin ? 'chip-status chip-sent' : 'muted'}>{p.hasPin ? 'App PIN set' : 'No app PIN'}</span>
            </div>
            <div className="settings-actions">
              <button type="button" className="link" onClick={() => setPin(p)}>
                {p.hasPin ? 'Change PIN' : 'Set PIN'}
              </button>
              <button type="button" className="link-danger" onClick={() => removePerson(p)}>
                Remove
              </button>
            </div>
          </li>
        ))}
        {settings.delivery.length === 0 && <li className="muted">No delivery people yet.</li>}
      </ul>
      <form className="settings-form" onSubmit={addPerson}>
        <strong>Add delivery person</strong>
        <input placeholder="Name" value={person.name} onChange={(e) => setPerson({ ...person, name: e.target.value })} />
        <input
          type="tel"
          inputMode="tel"
          placeholder="Mobile number"
          value={person.phone}
          onChange={(e) => setPerson({ ...person, phone: e.target.value })}
        />
        <input
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="PIN for the delivery app (4–6 digits)"
          value={person.pin}
          onChange={(e) => setPerson({ ...person, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
        />
        <button type="submit" className="btn btn-primary">
          Add delivery person
        </button>
      </form>
    </section>
  );
}
