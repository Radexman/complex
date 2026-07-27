import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Regression test for the whole-site crash where a `siteSettings.ogImage` with
 * alt text but no uploaded asset made `generateMetadata` throw. `resolveOpenGraphImage`
 * must treat an assetless image as "no image", not hand it to `urlForImage`.
 *
 * `@/sanity/lib/utils` transitively imports `@/sanity/lib/api`, which throws at
 * module load if the Sanity env vars are missing — so set them, then dynamic-import.
 */
beforeAll(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test';
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production';
});

async function load() {
  return import('@/sanity/lib/utils');
}

describe('resolveOpenGraphImage', () => {
  it('returns undefined for a null image', async () => {
    const { resolveOpenGraphImage } = await load();
    expect(resolveOpenGraphImage(null)).toBeUndefined();
    expect(resolveOpenGraphImage(undefined)).toBeUndefined();
  });

  it('returns undefined (does not throw) for an image with alt but no asset', async () => {
    const { resolveOpenGraphImage } = await load();
    const halfFilled = { _type: 'image', alt: 'Alt without an upload' };
    expect(() => resolveOpenGraphImage(halfFilled)).not.toThrow();
    expect(resolveOpenGraphImage(halfFilled)).toBeUndefined();
  });

  it('resolves an image that has an asset reference', async () => {
    const { resolveOpenGraphImage } = await load();
    const withAsset = {
      _type: 'image',
      alt: 'Real image',
      asset: { _type: 'reference', _ref: 'image-abc123-1200x627-png' },
    };
    const result = resolveOpenGraphImage(withAsset);
    expect(result?.url).toContain('abc123-1200x627.png');
    expect(result?.alt).toBe('Real image');
    expect(result?.width).toBe(1200);
  });
});
