import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { formatAmount, formatMoney, formatWhen } from './format';
import Logo from './Logo';
import { SHOP } from './shop';
import { PAY_LABELS, deliveryStep, paymentState } from './tracking.mjs';

// The delivery boy's page (/d). He logs in once with his mobile number and the PIN the
// shop set for him in Settings, and sees only the orders assigned to him: the items to
// pick, Packed → On the way → Delivered, and how he was paid. While an order is on the
// way and this page is open, his location is shared with that customer's bill link.

const LOGIN_KEY = 'deliveryLogin';
const REFRESH_MS = 30_000; // only while the page is on screen and he has orders open
const LOCATION_EVERY_MS = 20_000;

function readLogin() {
  try {
    return JSON.parse(localStorage.getItem(LOGIN_KEY));
  } catch {
    return null;
  }
}

async function call(login, path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(path, {
      method,
      headers: {
        'X-Delivery-Phone': login.phone,
        'X-Delivery-Pin': login.pin,
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw Object.assign(new Error('No internet. इंटरनेट नहीं है।'), { status: 0 });
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (!res.ok) throw Object.assign(new Error(data?.error || `Server error (${res.status}).`), { status: res.status });
  return data;
}

const ticksKey = (billNo) => `deliveryTicks:${billNo}`;
function readTicks(billNo) {
  try {
    return JSON.parse(localStorage.getItem(ticksKey(billNo))) || [];
  } catch {
    return [];
  }
}

function useVisible() {
  const [visible, setVisible] = useState(document.visibilityState === 'visible');
  useEffect(() => {
    const on = () => setVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', on);
    return () => document.removeEventListener('visibilitychange', on);
  }, []);
  return visible;
}

// Shares his location every ~20 s while `active`, and keeps the screen awake meanwhile.
// A web page can't track with the screen off, so this only runs while the page is open.
function useShareLocation(login, active) {
  const [state, setState] = useState('off'); // off | on | denied | unsupported
  useEffect(() => {
    if (!active) {
      setState('off');
      return undefined;
    }
    if (!navigator.geolocation) {
      setState('unsupported');
      return undefined;
    }
    let last = 0;
    let wake = null;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setState('on');
        if (Date.now() - last < LOCATION_EVERY_MS) return;
        last = Date.now();
        const { latitude: lat, longitude: lng, accuracy } = pos.coords;
        call(login, '/api/delivery/location', { method: 'POST', body: { lat, lng, accuracy } }).catch(() => {});
      },
      (err) => setState(err.code === err.PERMISSION_DENIED ? 'denied' : 'on'),
      { enableHighAccuracy: true, maximumAge: 10_000, timeout: 30_000 }
    );
    navigator.wakeLock
      ?.request('screen')
      .then((w) => {
        wake = w;
      })
      .catch(() => {});
    return () => {
      navigator.geolocation.clearWatch(watch);
      wake?.release().catch(() => {});
    };
  }, [login, active]);
  return state;
}

function Login({ onLogin, error }) {
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  return (
    <form
      className="pin"
      onSubmit={(e) => {
        e.preventDefault();
        onLogin({ phone: phone.trim(), pin: pin.trim() });
      }}
    >
      <div className="pin-brand">
        <Logo size={64} />
        <h1>{SHOP.name}</h1>
        <span className="muted">Delivery · डिलीवरी</span>
      </div>
      <label htmlFor="delivery-phone">मोबाइल नंबर · Mobile number</label>
      <input
        id="delivery-phone"
        className="delivery-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />
      <label htmlFor="delivery-pin">PIN</label>
      <input
        id="delivery-pin"
        type="password"
        inputMode="numeric"
        autoComplete="off"
        value={pin}
        onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn-primary" disabled={!phone || pin.length < 4}>
        Log in · लॉग इन
      </button>
      <p className="muted">The shop gives you the PIN. Asked only once on this phone.</p>
    </form>
  );
}

const NEXT = {
  assigned: { step: 'packed', label: 'पैक हो गया · Packed' },
  packed: { step: 'onTheWay', label: 'निकल गया · On the way' },
  onTheWay: { step: 'delivered', label: 'पहुँच गया · Delivered' },
};

const PAY_CHOICES = [
  ['upi', 'UPI हो गया · UPI done'],
  ['later', 'UPI बाद में · UPI later'],
  ['udhaar', 'उधार · Udhaar'],
];

function Order({ order, onStep, busy }) {
  const step = deliveryStep(order);
  const [ticks, setTicks] = useState(() => readTicks(order.billNo));
  const [paying, setPaying] = useState(false);
  const [cash, setCash] = useState(order.total > 0 ? String(order.total) : '');
  const items = order.items.filter((it) => it.name || it.description);
  const pay = paymentState(order);

  const tick = (i) => {
    const next = ticks.includes(i) ? ticks.filter((t) => t !== i) : [...ticks, i];
    setTicks(next);
    try {
      localStorage.setItem(ticksKey(order.billNo), JSON.stringify(next));
    } catch {
      // Ticks are only a help; fine if they don't stick.
    }
  };

  const next = NEXT[step];
  return (
    <li className={step === 'delivered' ? 'order-card done' : 'order-card'}>
      <div className="order-head">
        <strong className="order-address">{order.customerAddress || order.customerName || `Bill #${order.billNo}`}</strong>
        <span className="muted">
          Bill #{order.billNo}
          {order.customerName && order.customerAddress ? ` · ${order.customerName}` : ''} · {formatWhen(order.createdAt)}
        </span>
      </div>
      {order.customerPhone && (
        <a className="btn btn-secondary btn-small order-call" href={`tel:${order.customerPhone}`}>
          Call · {order.customerPhone}
        </a>
      )}

      {step !== 'delivered' && (
        <>
          <p className="order-label">
            सामान निकालो · Items ({ticks.filter((t) => t < items.length).length}/{items.length})
          </p>
          <ul className="order-items">
            {items.map((it, i) => (
              <li key={i}>
                <button type="button" className={ticks.includes(i) ? 'order-item ticked' : 'order-item'} onClick={() => tick(i)} aria-pressed={ticks.includes(i)}>
                  <span className="order-box" aria-hidden="true">
                    {ticks.includes(i) ? '✓' : ''}
                  </span>
                  <span>
                    <strong>{it.name}</strong>
                    {it.description && <span className="muted"> · {it.description}</span>}
                    {it.qty !== null && it.qty !== '' && <span> × {formatAmount(it.qty)}</span>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="order-total">
        {order.total > 0 ? <>Total {formatMoney(order.total)}</> : <span className="muted">Rates not added yet</span>}
        {step !== 'assigned' && step !== 'none' && (
          <span className="chip-status chip-delivery">
            {step === 'packed' ? 'Packed' : step === 'onTheWay' ? 'On the way' : 'Delivered'}
          </span>
        )}
      </p>

      {step === 'delivered' && pay.label && (
        <p className="order-paid">
          {PAY_LABELS[order.paymentStatus?.method] ?? ''} {order.paymentStatus && formatMoney(order.paymentStatus.amount)}
          {pay.key === 'cashWith' && ' · दुकान पर दें · give to the shop'}
        </p>
      )}

      {next && !paying && (
        <button
          type="button"
          className="btn btn-primary btn-wide"
          disabled={busy}
          onClick={() => (next.step === 'delivered' ? setPaying(true) : onStep(order, next.step))}
        >
          {next.label}
        </button>
      )}

      {paying && (
        <div className="order-pay">
          <p className="order-label">पैसे कैसे मिले? · How was it paid?</p>
          <div className="order-cash">
            <input
              type="text"
              inputMode="decimal"
              aria-label="Cash amount"
              value={cash}
              onChange={(e) => setCash(e.target.value.replace(/[^0-9.]/g, ''))}
            />
            <button
              type="button"
              className="btn btn-primary"
              disabled={busy || !(Number(cash) >= 0) || cash === ''}
              onClick={() => onStep(order, 'delivered', { method: 'cash', amount: Number(cash) })}
            >
              Cash मिला
            </button>
          </div>
          {PAY_CHOICES.map(([method, label]) => (
            <button
              key={method}
              type="button"
              className="btn btn-secondary btn-wide"
              disabled={busy}
              onClick={() => onStep(order, 'delivered', { method, amount: order.total })}
            >
              {label}
            </button>
          ))}
          <button type="button" className="link" onClick={() => setPaying(false)}>
            Back
          </button>
        </div>
      )}
    </li>
  );
}

export default function DeliveryApp() {
  const [login, setLogin] = useState(readLogin);
  const [person, setPerson] = useState(null);
  const [orders, setOrders] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const visible = useVisible();

  useEffect(() => {
    document.title = `${SHOP.name} · Delivery`;
  }, []);

  const logout = useCallback((message = '') => {
    try {
      localStorage.removeItem(LOGIN_KEY);
    } catch {
      // Nothing stored.
    }
    setLogin(null);
    setOrders(null);
    setError(message);
  }, []);

  const load = useCallback(async () => {
    if (!login) return;
    try {
      const data = await call(login, '/api/delivery/orders');
      setPerson(data.person);
      setOrders(data.orders);
      setError('');
    } catch (err) {
      if (err.status === 401) logout('Wrong mobile number or PIN. गलत नंबर या PIN।');
      else setError(err.message);
    }
  }, [login, logout]);

  const active = (orders ?? []).filter((o) => deliveryStep(o) !== 'delivered');
  const onTheWay = active.some((o) => deliveryStep(o) === 'onTheWay');

  // Fresh orders when the page opens or comes back, then every 30 s while it is on screen.
  useEffect(() => {
    if (!login || !visible) return undefined;
    load();
    if (orders && active.length === 0) return undefined;
    const timer = setInterval(load, REFRESH_MS);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login, visible, load, active.length === 0]);

  const location = useShareLocation(login, Boolean(login) && visible && onTheWay);

  const onLogin = async (next) => {
    try {
      const data = await call(next, '/api/delivery/orders');
      localStorage.setItem(LOGIN_KEY, JSON.stringify(next));
      setLogin(next);
      setPerson(data.person);
      setOrders(data.orders);
      setError('');
    } catch (err) {
      setError(err.status === 401 ? 'Wrong mobile number or PIN. गलत नंबर या PIN।' : err.message);
    }
  };

  const onStep = async (order, step, payment) => {
    setBusy(true);
    try {
      const data = await call(login, `/api/delivery/orders/${order.billNo}/step`, {
        method: 'POST',
        body: { step, ...(payment && { payment }) },
      });
      setOrders((list) => list.map((o) => (o.billNo === order.billNo ? data.order : o)));
    } catch (err) {
      if (err.status === 401) logout('Please log in again.');
      else setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (!login) return <Login onLogin={onLogin} error={error} />;

  const done = (orders ?? []).filter((o) => deliveryStep(o) === 'delivered');
  return (
    <main className="delivery-app">
      <header className="delivery-top">
        <Logo size={30} />
        <span>
          <strong>{person ? person.name : 'Delivery'}</strong>
          <small>{SHOP.name}</small>
        </span>
        <button type="button" className="btn btn-secondary btn-small" onClick={load}>
          Refresh
        </button>
      </header>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {onTheWay && (
        <p className={location === 'on' ? 'location-note on' : 'location-note'}>
          {location === 'on' && 'Location shared with the customer while on the way. Keep this page open.'}
          {location === 'denied' && 'Location is off. Allow location for this site so the customer can see where you are.'}
          {location === 'unsupported' && 'This phone can’t share location from the browser.'}
          {location === 'off' && 'Starting location…'}
        </p>
      )}
      {!orders && <p className="muted">Loading orders…</p>}
      {orders && active.length === 0 && <p className="muted">No orders right now. कोई ऑर्डर नहीं।</p>}
      <ul className="order-list">
        {active.map((o) => (
          <Order key={o.billNo} order={o} onStep={onStep} busy={busy} />
        ))}
      </ul>
      {done.length > 0 && (
        <>
          <h2 className="order-done-title">Delivered today · {done.length}</h2>
          <ul className="order-list">
            {done.map((o) => (
              <Order key={o.billNo} order={o} onStep={onStep} busy={busy} />
            ))}
          </ul>
        </>
      )}
      <p className="delivery-foot">
        <button type="button" className="link" onClick={() => logout()}>
          Log out
        </button>
      </p>
    </main>
  );
}
