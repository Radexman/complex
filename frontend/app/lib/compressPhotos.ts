/**
 * Shrinks the photos picked in a quotation form before they are submitted, so a typical 2–6 MB
 * phone photo travels as a few hundred kilobytes. Browser-only: called from the forms' submit
 * handlers. The size rules live in `photoUpload.ts`.
 */
import {
  canSendAsIs,
  COMPRESSION_STEPS,
  fitsPhotoBudget,
  fitWithin,
  PHOTO_TARGET_BYTES,
  PHOTO_TOO_LARGE_ERROR,
  toJpegName,
} from '@/app/lib/photoUpload';

export type PreparedPhotos = { ok: true; files: File[] } | { ok: false; error: string };

async function encodeJpeg(
  bitmap: ImageBitmap,
  width: number,
  height: number,
  quality: number,
): Promise<Blob | null> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  // JPEG has no transparency: paint white first so transparent PNG areas don't turn black.
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, width, height);
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
}

async function compressPhoto(file: File): Promise<File> {
  let bitmap: ImageBitmap;
  try {
    // `from-image` applies the EXIF orientation, so upright phone photos stay upright.
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
  } catch {
    // Unreadable in this browser: send the original and let the budget check decide.
    return file;
  }

  try {
    if (canSendAsIs(file, bitmap.width, bitmap.height)) return file;

    let smallest: Blob | null = null;
    for (const step of COMPRESSION_STEPS) {
      const { width, height } = fitWithin(bitmap.width, bitmap.height, step.maxEdge);
      const blob = await encodeJpeg(bitmap, width, height, step.quality);
      if (!blob) break;
      if (!smallest || blob.size < smallest.size) smallest = blob;
      if (blob.size <= PHOTO_TARGET_BYTES) break;
    }

    if (!smallest || smallest.size >= file.size) return file;
    return new File([smallest], toJpegName(file.name), {
      type: 'image/jpeg',
      lastModified: file.lastModified,
    });
  } finally {
    bitmap.close();
  }
}

export async function preparePhotos(photos: File[]): Promise<PreparedPhotos> {
  if (photos.length === 0) return { ok: true, files: [] };
  const files = await Promise.all(photos.map(compressPhoto));
  return fitsPhotoBudget(files) ? { ok: true, files } : { ok: false, error: PHOTO_TOO_LARGE_ERROR };
}
