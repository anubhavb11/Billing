import QRCode from 'qrcode';
import { SHOP } from './shop';

// upi://pay link: any UPI app opens it (or scans its QR) with the amount filled in.
export const upiLink = (bill) =>
  `upi://pay?pa=${SHOP.upi}&pn=${encodeURIComponent(SHOP.name)}&am=${Number(bill.total).toFixed(2)}` +
  `&cu=INR&tn=${encodeURIComponent(bill.billNo ? `Bill ${bill.billNo}` : SHOP.name)}`;

// Drawn as plain SVG in the same render, so the shared bill picture includes it.
export default function UpiQr({ bill, size = 104 }) {
  const { modules } = QRCode.create(upiLink(bill), { errorCorrectionLevel: 'M' });
  const n = modules.size;
  let d = '';
  for (let r = 0; r < n; r += 1) {
    for (let c = 0; c < n; c += 1) if (modules.get(r, c)) d += `M${c} ${r}h1v1h-1z`;
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox={`-2 -2 ${n + 4} ${n + 4}`}
      shapeRendering="crispEdges"
      role="img"
      aria-label="UPI QR code"
    >
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
