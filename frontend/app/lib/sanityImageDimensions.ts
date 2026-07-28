import { stegaClean } from 'next-sanity';

export type ImageDimensions = { width: number; height: number };

/**
 * Sanity encodes an image asset's intrinsic pixel size into its reference id:
 * `image-<hash>-<width>x<height>-<format>`.
 *
 * `next/image` needs a `width`/`height` pair whose *ratio* matches the real asset. A hardcoded
 * guess makes Next warn that one dimension was modified but not the other — it compares the
 * rendered box against the ratio implied by the attributes, so a 5:1 guess on a ~2:1 logo trips
 * it. CMS-uploaded images have no fixed ratio to hardcode, so read it off the reference.
 */
export function getImageDimensions(
  image?: { asset?: { _ref?: string } | null } | null,
): ImageDimensions | undefined {
  const ref = stegaClean(image?.asset?._ref ?? '');
  const match = /-(\d+)x(\d+)-[a-z]+$/.exec(ref);
  if (!match) return undefined;

  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!width || !height) return undefined;

  return { width, height };
}
