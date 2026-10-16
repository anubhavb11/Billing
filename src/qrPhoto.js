// Reads a photo of a payment QR (shop sticker, standee or a screenshot). If the QR
// code can be read, its exact text is kept and redrawn cleanly on bills; otherwise a
// small copy of the photo is kept instead.

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not open that picture. Try another photo.'));
    };
    img.src = url;
  });
}

function drawScaled(img, maxSide) {
  const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas;
}

// -> { payload } when the QR was read, or { image } (JPEG data URL) when it wasn't.
export async function readQrPhoto(file) {
  const img = await loadImage(file);
  const { default: jsQR } = await import('jsqr');
  for (const size of [1000, 1600, 600]) {
    const canvas = drawScaled(img, size);
    const { data, width, height } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(data, width, height, { inversionAttempts: 'attemptBoth' });
    if (code?.data) return { payload: code.data };
  }
  return { image: drawScaled(img, 600).toDataURL('image/jpeg', 0.85) };
}
