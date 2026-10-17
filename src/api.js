// Talks to the Netlify Functions in netlify/functions/bills.mjs.

const PIN_KEY = 'shopPin';

export function getPin() {
  try {
    return localStorage.getItem(PIN_KEY) || '';
  } catch {
    return '';
  }
}

export function setPin(pin) {
  try {
    localStorage.setItem(PIN_KEY, pin);
  } catch {
    // Blocked storage: the PIN will be asked again next time.
  }
}

export function forgetPin() {
  try {
    localStorage.removeItem(PIN_KEY);
  } catch {
    // Nothing stored.
  }
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = 'GET', body, pin = getPin() } = {}) {
  const headers = { 'X-Shop-Pin': pin };
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch {
    throw new ApiError('No internet. Check the connection and try again.', 0);
  }

  if (res.status === 204) return null;
  let data = null;
  try {
    data = await res.json();
  } catch {
    // Non-JSON error page (e.g. the API isn't running).
  }
  if (res.status === 401 && path !== '/api/ping') {
    forgetPin();
    window.dispatchEvent(new Event('pin-required'));
  }
  if (!res.ok) throw new ApiError(data?.error || `Server error (${res.status}).`, res.status);
  return data;
}

export const checkPin = (pin) => request('/api/ping', { pin });
export const listBills = () => request('/api/bills').then((d) => d.bills);
export const createBill = (bill) => request('/api/bills', { method: 'POST', body: bill }).then((d) => d.bill);
export const updateBill = (billNo, bill) =>
  request(`/api/bills/${billNo}`, { method: 'PUT', body: bill }).then((d) => d.bill);
export const deleteBill = (billNo) => request(`/api/bills/${billNo}`, { method: 'DELETE' });
export const markSent = (billNo) => request(`/api/bills/${billNo}/sent`, { method: 'POST' }).then((d) => d.bill);
export const getSettings = () => request('/api/settings').then((d) => d.settings);
export const putSettings = (settings) =>
  request('/api/settings', { method: 'PUT', body: settings }).then((d) => d.settings);
// -> { catalog: { items, customers }, rules }
export const getCatalog = () => request('/api/catalog');
export const putCatalogRules = (rules) => request('/api/catalog/rules', { method: 'PUT', body: rules });
