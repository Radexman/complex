import type { Metadata } from 'next';

import type { Seo } from '@/sanity.types';
import { resolveOpenGraphImage } from '@/sanity/lib/utils';

type OgImageSource = Parameters<typeof resolveOpenGraphImage>[0];

/** The editor-managed `seo` object; any field may be missing or blank. */
export type SeoInput = Pick<Seo, 'title' | 'description' | 'ogImage'> | null | undefined;

/** What the page shows when the editor left a `seo` field empty. */
export interface SeoFallback {
  /** Page name only — the root layout's title template appends the site name. */
  title: string;
  description?: string | null;
  ogImage?: OgImageSource;
}

/**
 * Merges a page's CMS `seo` object over its built-in defaults. A filled field
 * wins; a missing or whitespace-only one falls back. `openGraph` is set only
 * when there is an image, because a page-level `openGraph` replaces the root
 * layout's whole object — and with it the site-wide default image.
 */
export function buildSeoMetadata(seo: SeoInput, fallback: SeoFallback): Metadata {
  const title = seo?.title?.trim() || fallback.title.trim();
  const description = seo?.description?.trim() || fallback.description?.trim() || undefined;
  const ogImage = resolveOpenGraphImage(seo?.ogImage) ?? resolveOpenGraphImage(fallback.ogImage);

  return {
    title,
    ...(description && { description }),
    ...(ogImage && { openGraph: { images: [ogImage] } }),
  };
}
