// Sending a bill to the customer, two ways (both on the View & Send screen):
// - WhatsApp to the bill's number: the bill as a text message with its link (waLink)
// - Send picture: the bill picture through the share menu; he picks the chat (shareFile)
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { rowHasContent } from './bill';
import { formatAmount, formatDate, formatMoney } from './format';
import InvoiceSheet from './InvoiceSheet';
import { SHOP } from './shop';
import { paymentUpiId } from './shopSettings';

// The picture library is loaded in the background after the app opens, so it is
// ready by the time he taps Send.
export const preloadImageTools = () => import('html-to-image');

const isSafari = () => isIPhone() || /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

// The bill picture. The browser draws it itself (html-to-image), so it looks exactly
// like the bill on screen (same spacing, fonts and Hindi letters), on a light frame
// with a margin, at 3x so it stays sharp after WhatsApp compresses it.
export async function renderBillImage(bill) {
  const host = document.createElement('div');
  host.style.cssText = 'position:fixed;left:-10000px;top:0;width:420px';
  document.body.appendChild(host);
  const root = createRoot(host);
  try {
    // Render outside whatever React is doing right now (this is often called from
    // an effect), so the sheet is on the page before it is drawn.
    await new Promise((resolve) => {
      setTimeout(() => {
        flushSync(() =>
          root.render(
            <div className="shot-frame">
              <InvoiceSheet bill={bill} />
            </div>
          )
        );
        resolve();
      }, 0);
    });
    const { toCanvas } = await import('html-to-image');
    const options = { pixelRatio: 3, backgroundColor: '#f4efe9', skipFonts: true };
    // Safari only paints pictures inside the bill (a QR photo) on the second pass.
    if (isSafari()) await toCanvas(host.firstChild, options);
    const canvas = await toCanvas(host.firstChild, options);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.92));
    return new File([blob], `Bansal Store Bill ${bill.billNo ?? ''}.jpg`.replace(' .jpg', '.jpg'), {
      type: 'image/jpeg',
    });
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

const money = (v) => (v === '' || v == null ? '' : formatAmount(v));

// The bill as a WhatsApp message (*text* shows in bold there).
export function billText(bill) {
  const lines = [`*${SHOP.name}*`, `Bill #${bill.billNo} · ${formatDate(bill.createdAt ?? new Date())}`];
  if (bill.customerName) lines.push(bill.customerName);
  lines.push('');
  bill.items.filter(rowHasContent).forEach((item, i) => {
    lines.push(`${i + 1}. ${item.description ? `${item.name} (${item.description})` : item.name}`);
    if (money(item.qty) !== '' && money(item.rate) !== '') {
      lines.push(`    ${item.qty} × ₹${money(item.rate)} = *₹${money(item.amount)}*`);
    }
  });
  lines.push('', `*Total: ${formatMoney(bill.total)}*`);
  if (bill.delivery) {
    lines.push(`Delivery: ${bill.delivery.name}${bill.delivery.phone ? ` · ${bill.delivery.phone}` : ''}`);
  }
  const upiId = bill.payment && paymentUpiId(bill.payment);
  if (upiId) lines.push(`Pay by UPI: ${upiId}`);
  const link = billLink(bill);
  if (link) lines.push('', `View bill: ${link}`);
  lines.push('', `Thank you! ${SHOP.name} · Ph. ${SHOP.phone}`);
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
