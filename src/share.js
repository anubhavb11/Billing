// Sending a bill to the customer, two ways:
// - to their WhatsApp number: the bill as text with its link (waLink)
// - as a picture through the phone's share menu, where he picks the chat (shareFile)
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import InvoiceSheet from './InvoiceSheet';
import { formatAmount, formatDate, formatMoney } from './format';
import { paymentUpiId } from './shopSettings';
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
    // Render outside whatever React is doing right now (this is often called from
    // an effect), so the sheet is on the page before it is photographed.
    await new Promise((resolve) => {
      setTimeout(() => {
        flushSync(() => root.render(<InvoiceSheet bill={bill} />));
        resolve();
      }, 0);
    });
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

// Caption sent with the picture: the bill link.
export const pictureCaption = (bill) => {
  const link = billLink(bill);
  return link ? `${SHOP.name} · Bill #${bill.billNo}\n${link}` : '';
};

// On iPhone, WhatsApp drops the picture when text comes with it, so there the
// picture goes alone; Android keeps the link as the picture's caption.
export const isIPhone = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

export const canShareFiles = (file) => Boolean(navigator.canShare?.({ files: [file] }));

// 'shared' | 'cancelled' (he closed the menu) | 'blocked' (phone wants a fresh tap)
// | 'unsupported' (this browser can't share pictures).
export async function shareFile(file, text = '') {
  if (!canShareFiles(file)) return 'unsupported';
  const data = { files: [file] };
  if (text && !isIPhone()) data.text = text;
  try {
    await navigator.share(data);
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
  if (bill.delivery) {
    lines.push(`Delivery: ${bill.delivery.name}${bill.delivery.phone ? ` · ${bill.delivery.phone}` : ''}`);
  }
  const upiId = bill.payment && paymentUpiId(bill.payment);
  if (upiId) lines.push(`Pay by UPI: ${upiId}`);
  const link = billLink(bill);
  if (link) lines.push(`View bill: ${link}`);
  lines.push('Thank you!');
  return lines.join('\n');
}

export const waLink = (bill) =>
  `https://wa.me/${waNumber(bill.customerPhone)}?text=${encodeURIComponent(billText(bill))}`;

// "Download PDF": the bill picture on a page sized to fit it.
export async function downloadPdf(file, name) {
  const [{ jsPDF }, dataUrl] = await Promise.all([
    import('jspdf'),
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    }),
  ]);
  // (img.decode() can hang in some browsers, so wait for onload instead.)
  const img = await new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Could not read the bill picture.'));
    image.src = dataUrl;
  });
  // As a JPEG the PDF stays around 200 KB instead of a few MB.
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0);
  const width = 120; // mm
  const height = (width * img.naturalHeight) / img.naturalWidth;
  const doc = new jsPDF({ unit: 'mm', format: [width + 16, height + 16], orientation: 'portrait' });
  doc.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 8, 8, width, height);
  doc.save(name);
}
