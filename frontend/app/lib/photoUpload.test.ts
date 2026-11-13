import { describe, expect, it } from 'vitest';

import {
  canSendAsIs,
  COMPRESSION_STEPS,
  fitsPhotoBudget,
  fitWithin,
  PHOTO_BUDGET_BYTES,
  PHOTO_TARGET_BYTES,
  toJpegName,
} from './photoUpload';

describe('fitWithin', () => {
  it('scales a landscape photo so the long edge matches the limit', () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 });
  });

  it('scales a portrait photo by its height', () => {
    expect(fitWithin(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 });
  });

  it('never scales a small photo up', () => {
    expect(fitWithin(1200, 900, 2000)).toEqual({ width: 1200, height: 900 });
  });

  it('keeps at least one pixel on a very thin image', () => {
    expect(fitWithin(10000, 1, 2000)).toEqual({ width: 2000, height: 1 });
  });
});

describe('canSendAsIs', () => {
  it('keeps a small photo with small dimensions', () => {
    expect(canSendAsIs({ size: 300_000 }, 1600, 1200)).toBe(true);
  });

  it('re-encodes a photo over the target size', () => {
    expect(canSendAsIs({ size: PHOTO_TARGET_BYTES + 1 }, 1600, 1200)).toBe(false);
  });

  it('re-encodes a small file with oversized dimensions', () => {
    expect(canSendAsIs({ size: 500_000 }, COMPRESSION_STEPS[0].maxEdge + 1, 1000)).toBe(false);
  });
});

describe('fitsPhotoBudget', () => {
  it('accepts three typical compressed photos', () => {
    expect(fitsPhotoBudget([{ size: 800_000 }, { size: 900_000 }, { size: 1_000_000 }])).toBe(true);
  });

  it('rejects photos that together exceed the budget', () => {
    expect(fitsPhotoBudget([{ size: PHOTO_BUDGET_BYTES }, { size: 1 }])).toBe(false);
  });

  it('accepts no photos at all', () => {
    expect(fitsPhotoBudget([])).toBe(true);
  });
});

describe('budget vs. platform limits', () => {
  it('leaves room under the 4 MB Server Action limit for fields and multipart overhead', () => {
    expect(PHOTO_BUDGET_BYTES).toBeLessThan(4 * 1024 * 1024 - 200_000);
  });

  it('lets three photos at the target size fit the budget', () => {
    expect(3 * PHOTO_TARGET_BYTES).toBeLessThanOrEqual(PHOTO_BUDGET_BYTES);
  });
});

describe('toJpegName', () => {
  it('swaps the extension', () => {
    expect(toJpegName('taras.png')).toBe('taras.jpg');
  });

  it('keeps dots inside the name', () => {
    expect(toJpegName('zdj.taras.2026.webp')).toBe('zdj.taras.2026.jpg');
  });

  it('adds an extension when there is none', () => {
    expect(toJpegName('IMG_1234')).toBe('IMG_1234.jpg');
  });

  it('falls back to a name when only an extension is left', () => {
    expect(toJpegName('.jpeg')).toBe('zdjecie.jpg');
  });
});
