import { describe, expect, it } from 'vitest';

import { MAX_ATTACHMENTS_BYTES, photosToAttachments } from './attachments';

/** A File of an exact byte size, without allocating a real image. */
function fileOfSize(name: string, bytes: number): File {
  return new File([new Uint8Array(bytes)], name, { type: 'image/jpeg' });
}

describe('photosToAttachments', () => {
  it('returns nothing for a submission with no photos', async () => {
    const result = await photosToAttachments([]);
    expect(result).toEqual({ attachments: [], skipped: false, filenames: [] });
  });

  it('converts photos to buffer attachments', async () => {
    const photo = new File(['abc'], 'ogrod.jpg', { type: 'image/jpeg' });
    const { attachments, skipped, filenames } = await photosToAttachments([photo]);

    expect(skipped).toBe(false);
    expect(filenames).toEqual(['ogrod.jpg']);
    expect(attachments).toHaveLength(1);
    expect(attachments[0].filename).toBe('ogrod.jpg');
    expect(attachments[0].content?.toString()).toBe('abc');
  });

  it('drops the photos when they exceed the size cap, keeping their names', async () => {
    const huge = fileOfSize('duze.jpg', MAX_ATTACHMENTS_BYTES + 1);
    const { attachments, skipped, filenames } = await photosToAttachments([huge]);

    expect(skipped).toBe(true);
    expect(attachments).toEqual([]);
    expect(filenames).toEqual(['duze.jpg']);
  });

  it('caps on the combined size, not per file', async () => {
    const half = Math.ceil(MAX_ATTACHMENTS_BYTES / 2) + 1;
    const { skipped } = await photosToAttachments([
      fileOfSize('a.jpg', half),
      fileOfSize('b.jpg', half),
    ]);

    expect(skipped).toBe(true);
  });
});
