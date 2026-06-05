/**
 * Client-side receipt image prep.
 *
 * Downscales the captured/selected photo to a sane size and re-encodes it as JPEG,
 * then returns raw base64 (no data: URL prefix). Keeps uploads small and caps the
 * vision-token cost of the extraction call (~2K input tokens per scan).
 */

const MAX_EDGE = 1280; // longest-edge cap in px
const JPEG_QUALITY = 0.82;

export interface PreparedImage {
  base64: string;
  mediaType: "image/jpeg";
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read that image file."));
    img.src = dataUrl;
  });
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read that image file."));
    reader.readAsDataURL(file);
  });
}

export async function prepareReceiptImage(file: File): Promise<PreparedImage> {
  const dataUrl = await readAsDataUrl(file);
  const img = await loadImage(dataUrl);

  const scale = Math.min(1, MAX_EDGE / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Could not process the image on this device.");
  ctx.drawImage(img, 0, 0, width, height);

  const jpegDataUrl = canvas.toDataURL("image/jpeg", JPEG_QUALITY);
  const base64 = jpegDataUrl.split(",", 2)[1] ?? "";
  if (!base64) throw new Error("Could not process the image on this device.");

  return { base64, mediaType: "image/jpeg" };
}
