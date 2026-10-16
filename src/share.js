// Sending a bill to the customer: the bill picture through the phone's share
// menu, or the bill as a WhatsApp text message.
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import InvoiceSheet from './InvoiceSheet';
import { formatAmount, formatDate, formatMoney } from './format';
import { SHOP } from './shop';

// The picture library is big, so load it in the background after the app opens:
// by the time he taps Send it is ready and the phone still treats the share as
// part of his tap.
export const preloadImageTools = () => import('html2canvas');

export async function renderBillImage(bill) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:380px;background:#fff';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    flushSync(() => root.render(<InvoiceSheet bill={bill} />));
    const { default: html2canvas } = await import('html2canvas');
    const canvas = await html2canvas(host.firstChild, { scale: 2, backgroundColor: '#ffffff' });
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
    return new File([blob], `Bill-${bill.billNo ?? 'new'}.png`, { type: 'image/png' });
  } finally {
    root.unmount();
    host.remove();
  }
}

// The customer's private link to this bill (works without the shop PIN).
export const billLink = (bill) => (bill.shareToken ? `${window.location.origin}/b/${bill.shareToken}` : null);

export const shareCaption = (bill) => {
  const link = billLink(bill);
  return `${SHOP.name} · Bill #${bill.billNo} · Total ${formatMoney(bill.total)}${link ? `\nView bill: ${link}` : ''}`;
};

export const canShareFiles = (file) => Boolean(navigator.canShare?.({ files: [file] }));

// 'shared' | 'cancelled' (he closed the menu) | 'blocked' (phone wants a fresh tap)
// | 'unsupported' (this browser can't share pictures).
export async function shareFile(file, text) {
  if (!canShareFiles(file)) return 'unsupported';
  try {
    await navigator.share({ files: [file], text });
    return 'shared';
  } catch (err) {
    return err.name === 'AbortError' ? 'cancelled' : 'blocked';
  }
}

// WhatsApp number for wa.me: 10-digit Indian numbers get the 91 prefix.
export function waNumber(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  if (digits.length >= 11 && digits.length <= 13) return digits;
  return null;
}

const num = (v) => (v === '' || v == null ? '' : formatAmount(v));

export function billText(bill) {
  const lines = [`*${SHOP.name}*`, `Bill #${bill.billNo} · ${formatDate(bill.createdAt)}`];
  if (bill.customerName) lines.push(bill.customerName);
  lines.push('');
  bill.items.forEach((item, i) => {
    const name = item.description ? `${item.name} (${item.description})` : item.name;
    const priced = num(item.qty) !== '' && num(item.rate) !== '';
    lines.push(
      priced
        ? `${i + 1}. ${name} – ${num(item.qty)} × ₹${num(item.rate)} = ₹${num(item.amount)}`
        : `${i + 1}. ${name}`
    );
  });
  lines.push('', `*Total: ${formatMoney(bill.total)}*`);
  const link = billLink(bill);
  if (link) lines.push(`View bill: ${link}`);
  lines.push('Thank you!');
  return lines.join('\n');
}

export const waLink = (phone, bill) =>
  `https://wa.me/${waNumber(phone)}?text=${encodeURIComponent(billText(bill))}`;
