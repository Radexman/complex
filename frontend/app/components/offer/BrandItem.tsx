import { Accordion } from '@ark-ui/react';
import { ChevronDown } from 'lucide-react';

import { SingleVariant } from './SingleVariant';
import { VariantGrid } from './VariantGrid';
import type { Brand } from './brandTypes';

export function BrandItem({ brand }: { brand: Brand }) {
  const variants = brand.variants ?? [];
  const descriptionParagraphs = brand.fullDescription
    ? brand.fullDescription.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0)
    : [];

  return (
    <Accordion.Item value={brand._key} data-brands-item className="overflow-hidden rounded-xl">
      <Accordion.ItemTrigger className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-graphite bg-bg-surface px-6 py-5 outline-none transition-all duration-200 hover:border-accent/40 data-[state=open]:border-accent/60">
        <span className="text-left">
          <span className="block font-heading text-lg font-semibold text-white">{brand.name}</span>
          {brand.shortDescription && (
            <span className="mt-0.5 block font-body text-sm text-silver">
              {brand.shortDescription}
            </span>
          )}
        </span>
        <ChevronDown
          className="shrink-0 text-silver transition-all duration-200 group-hover:text-accent group-data-[state=open]:rotate-180"
          size={20}
          aria-hidden="true"
        />
      </Accordion.ItemTrigger>
      <Accordion.ItemContent className="overflow-hidden">
        <Accordion.ItemContext>
          {({ expanded }) => (
            <div className="px-6 pb-6 pt-2">
              {descriptionParagraphs.length > 0 && (
                <div className="max-w-[65ch] space-y-3 font-body text-sm leading-relaxed text-silver">
                  {descriptionParagraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              )}
              {variants.length === 1 && (
                <div className={descriptionParagraphs.length > 0 ? 'mt-4' : ''}>
                  <SingleVariant variant={variants[0]} />
                </div>
              )}
              {variants.length > 1 && (
                <div className={descriptionParagraphs.length > 0 ? 'mt-6' : ''}>
                  <VariantGrid
                    variants={variants}
                    panelExpanded={expanded}
                    groupLabel={brand.name}
                  />
                </div>
              )}
            </div>
          )}
        </Accordion.ItemContext>
      </Accordion.ItemContent>
    </Accordion.Item>
  );
}
