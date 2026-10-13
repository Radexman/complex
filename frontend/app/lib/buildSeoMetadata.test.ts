import { beforeAll, describe, expect, it } from 'vitest';

/**
 * `@/sanity/lib/utils` (used to resolve OG images) transitively imports
 * `@/sanity/lib/api`, which throws at module load without the Sanity env vars —
 * so set them, then dynamic-import (same as resolveOpenGraphImage.test.ts).
 */
beforeAll(() => {
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ??= 'test';
  process.env.NEXT_PUBLIC_SANITY_DATASET ??= 'production';
});

async function load() {
  return (await import('./buildSeoMetadata')).buildSeoMetadata;
}

const image = (ref: string, alt?: string) => ({
  _type: 'image' as const,
  alt,
  asset: { _type: 'reference' as const, _ref: ref },
});

const fallback = { title: 'Realizacje', description: 'Domyślny opis.' };

describe('buildSeoMetadata', () => {
  it('uses the fallback when the page has no seo object', async () => {
    const buildSeoMetadata = await load();
    expect(buildSeoMetadata(null, fallback)).toEqual({
      title: 'Realizacje',
      description: 'Domyślny opis.',
    });
  });

  it('lets filled seo fields win over the fallback', async () => {
    const buildSeoMetadata = await load();
    const metadata = buildSeoMetadata(
      { title: 'Nasze realizacje', description: 'Opis z CMS.' },
      fallback,
    );
    expect(metadata.title).toBe('Nasze realizacje');
    expect(metadata.description).toBe('Opis z CMS.');
  });

  it('treats blank or whitespace-only seo fields as empty', async () => {
    const buildSeoMetadata = await load();
    const metadata = buildSeoMetadata({ title: '   ', description: '' }, fallback);
    expect(metadata.title).toBe('Realizacje');
    expect(metadata.description).toBe('Domyślny opis.');
  });

  it('trims stray whitespace from a CMS-sourced fallback title', async () => {
    const buildSeoMetadata = await load();
    expect(buildSeoMetadata(null, { title: 'FAQ ' }).title).toBe('FAQ');
  });

  it('omits the description entirely when neither source has one', async () => {
    const buildSeoMetadata = await load();
    const metadata = buildSeoMetadata(undefined, { title: 'FAQ', description: null });
    expect(metadata).not.toHaveProperty('description');
  });

  it('omits openGraph when there is no image, so the layout default applies', async () => {
    const buildSeoMetadata = await load();
    // An image with alt but no uploaded asset counts as no image.
    const metadata = buildSeoMetadata({ ogImage: { _type: 'image', alt: 'Bez pliku' } }, fallback);
    expect(metadata).not.toHaveProperty('openGraph');
  });

  it('prefers the seo image over the fallback image', async () => {
    const buildSeoMetadata = await load();
    const metadata = buildSeoMetadata(
      { ogImage: image('image-seo123-1200x627-jpg', 'Zadaszenie') },
      { ...fallback, ogImage: image('image-hero456-1920x1080-jpg') },
    );
    const images = metadata.openGraph?.images as Array<{ url: string; alt: string }>;
    expect(images).toHaveLength(1);
    expect(images[0].url).toContain('seo123');
    expect(images[0].alt).toBe('Zadaszenie');
  });

  it('falls back to the page image when the seo image is empty', async () => {
    const buildSeoMetadata = await load();
    const metadata = buildSeoMetadata(null, {
      ...fallback,
      ogImage: image('image-hero456-1920x1080-jpg'),
    });
    const images = metadata.openGraph?.images as Array<{ url: string }>;
    expect(images[0].url).toContain('hero456');
  });
});
