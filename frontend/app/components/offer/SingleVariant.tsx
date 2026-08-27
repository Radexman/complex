import Image from 'next/image';

import { urlForImage } from '@/sanity/lib/utils';

import { VariantSpecs } from './VariantSpecs';
import type { Variant } from './brandTypes';

/** Single-variant panels skip the grid/expand interaction entirely (spec §4.5). */
export function SingleVariant({ variant }: { variant: Variant }) {
  const specs = variant.specs?.filter(Boolean) ?? [];
  const imageUrl = variant.image?.asset
    ? urlForImage(variant.image).width(400).height(280).fit('crop').quality(80).url()
    : undefined;

  return (
    <div className={imageUrl ? 'grid items-start gap-8 md:grid-cols-2' : ''}>
      <div>
        {variant.manufacturer && (
          <p className="font-body text-sm text-silver">{variant.manufacturer}</p>
        )}
        <VariantSpecs specs={specs} />
        {variant.description && (
          <p className="mt-4 font-body text-sm leading-relaxed text-silver">
            {variant.description}
          </p>
        )}
      </div>
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={variant.image?.alt || variant.name}
          width={400}
          height={280}
          className="w-full rounded-lg object-cover"
        />
      )}
    </div>
  );
}
