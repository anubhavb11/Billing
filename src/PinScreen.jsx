import { useState } from 'react';
import { checkPin, setPin } from './api';

export default function PinScreen({ onUnlock }) {
  const [pin, setPinValue] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!pin) return;
    setChecking(true);
    setError('');
    try {
      await checkPin(pin);
      setPin(pin);
      onUnlock();
    } catch (err) {
      setError(err.status === 401 ? 'Wrong PIN. Try again.' : err.message);
    } finally {
      setChecking(false);
    }
  };

  return (
    <form className="pin" onSubmit={submit}>
      <h1>Billing</h1>
      <label htmlFor="shop-pin">Enter shop PIN</label>
      <input
        id="shop-pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus
        value={pin}
        onChange={(e) => setPinValue(e.target.value)}
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-save" disabled={checking || !pin}>
        {checking ? 'Checking…' : 'Unlock'}
      </button>
      <p className="muted">Asked only once on this phone.</p>
    </form>
  );
}
