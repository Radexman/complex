import { describe, expect, it } from 'vitest';

import { getImageDimensions } from './sanityImageDimensions';

describe('getImageDimensions', () => {
  it('reads width and height off a Sanity asset reference', () => {
    expect(
      getImageDimensions({
        asset: { _ref: 'image-2d355e785d644b3bf1bf733aa4a609fccf707ae9-262x134-png' },
      }),
    ).toEqual({ width: 262, height: 134 });
  });

  it('handles other formats and non-square sizes', () => {
    expect(getImageDimensions({ asset: { _ref: 'image-abc123-1920x1080-jpg' } })).toEqual({
      width: 1920,
      height: 1080,
    });
    expect(getImageDimensions({ asset: { _ref: 'image-abc123-64x64-webp' } })).toEqual({
      width: 64,
      height: 64,
    });
  });

  it('ignores stega metadata embedded by Visual Editing', () => {
    const stega = '​​‌​';
    expect(getImageDimensions({ asset: { _ref: `image-abc123-262x134-png${stega}` } })).toEqual({
      width: 262,
      height: 134,
    });
  });

  it('returns undefined when there is no asset to read', () => {
    expect(getImageDimensions(undefined)).toBeUndefined();
    expect(getImageDimensions(null)).toBeUndefined();
    expect(getImageDimensions({})).toBeUndefined();
    expect(getImageDimensions({ asset: null })).toBeUndefined();
    expect(getImageDimensions({ asset: {} })).toBeUndefined();
  });

  it('returns undefined for a reference it cannot parse', () => {
    expect(getImageDimensions({ asset: { _ref: 'not-a-sanity-ref' } })).toBeUndefined();
    expect(getImageDimensions({ asset: { _ref: 'file-abc123-pdf' } })).toBeUndefined();
    expect(getImageDimensions({ asset: { _ref: 'image-abc123-0x0-png' } })).toBeUndefined();
  });
});
