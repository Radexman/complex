/**
 * Size rules for the photos attached to the quotation forms.
 *
 * The forms submit through a Server Action, which goes through a Vercel Function: its request body
 * is capped at 4.5 MB (not configurable), and `serverActions.bodySizeLimit` in `next.config.ts` is
 * set just below that. Phone photos are often 2–6 MB each, so they are shrunk in the browser first
 * (see `compressPhotos.ts`) and the total is checked against a budget that leaves room for the
 * other form fields and the multipart overhead.
 */

/** All photos together, after compression. */
export const PHOTO_BUDGET_BYTES = 3_500_000;

/** A photo at or under this size is sent as-is when its dimensions are already small enough. */
export const PHOTO_TARGET_BYTES = 1_100_000;

/** The largest file the dropzone accepts before compression. */
export const MAX_PICKED_FILE_BYTES = 20 * 1024 * 1024;

/**
 * Compression attempts, tried in order until a photo fits `PHOTO_TARGET_BYTES`. A quote needs a
 * clear view of the site, not print quality, so even the last step stays perfectly readable.
 */
export const COMPRESSION_STEPS = [
  { maxEdge: 2000, quality: 0.8 },
  { maxEdge: 1600, quality: 0.72 },
  { maxEdge: 1280, quality: 0.62 },
] as const;

/** Scales `width`×`height` down so the longer edge is at most `maxEdge`; never scales up. */
export function fitWithin(
  width: number,
  height: number,
  maxEdge: number,
): { width: number; height: number } {
  const longest = Math.max(width, height);
  if (longest <= maxEdge || longest <= 0) return { width, height };
  const scale = maxEdge / longest;
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

/** True when a picked photo can be sent without re-encoding. */
export function canSendAsIs(file: { size: number }, width: number, height: number): boolean {
  return file.size <= PHOTO_TARGET_BYTES && Math.max(width, height) <= COMPRESSION_STEPS[0].maxEdge;
}

/** True when the photos together fit the request budget. */
export function fitsPhotoBudget(files: ReadonlyArray<{ size: number }>): boolean {
  return files.reduce((sum, file) => sum + file.size, 0) <= PHOTO_BUDGET_BYTES;
}

/** „zdjecie.png” → „zdjecie.jpg”, since compressed photos are always re-encoded as JPEG. */
export function toJpegName(name: string): string {
  const base = name.replace(/\.[^./\\]+$/, '');
  return `${base || 'zdjecie'}.jpg`;
}

export const PHOTO_TOO_LARGE_ERROR =
  'Zdjęcia są zbyt duże, aby je wysłać. Usuń jedno ze zdjęć albo wyślij je przez WhatsApp na numer 661 242 507.';
