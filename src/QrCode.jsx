import QRCode from 'qrcode';

// Drawn as plain SVG in the same render, so the shared bill picture includes it.
export default function QrCode({ text, size = 104 }) {
  const { modules } = QRCode.create(text, { errorCorrectionLevel: 'M' });
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
      aria-label="Payment QR code"
    >
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      <path d={d} fill="#000" />
    </svg>
  );
}
