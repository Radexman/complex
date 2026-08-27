import Image from 'next/image';
import { X } from 'lucide-react';

import { urlForImage } from '@/sanity/lib/utils';

import { VariantSpecs } from './VariantSpecs';
import type { Variant } from './brandTypes';

export function VariantDetail({
  variant,
  titleId,
  onClose,
}: {
  variant: Variant;
  titleId: string;
  onClose: () => void;
}) {
  const specs = variant.specs?.filter(Boolean) ?? [];
  const imageUrl = variant.image?.asset
    ? urlForImage(variant.image).width(1000).fit('max').quality(85).url()
    : undefined;

  return (
    <div className="motion-safe:animate-[variant-detail-in_0.25s_ease-out] grid gap-6 rounded-xl border border-accent/50 bg-bg-deep p-5 md:grid-cols-2">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={variant.image?.alt || variant.name}
          width={1000}
          height={700}
          className="w-full rounded-lg object-cover"
        />
      )}
      <div className={imageUrl ? '' : 'md:col-span-2'}>
        <div className="flex items-start justify-between gap-4">
          <h4 id={titleId} className="font-heading text-xl font-semibold text-white">
            {variant.name}
          </h4>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zamknij szczegóły wariantu"
            className="shrink-0 rounded-full p-1.5 text-silver transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        {variant.manufacturer && (
          <p className="mt-1 font-body text-sm text-silver">{variant.manufacturer}</p>
        )}
        <VariantSpecs specs={specs} />
        {variant.description && (
          <p className="mt-4 font-body text-sm leading-relaxed text-silver">
            {variant.description}
          </p>
        )}
      </div>
    </div>
  );
}
