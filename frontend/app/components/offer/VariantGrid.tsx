'use client';

import Image from 'next/image';
import { Fragment, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';

import { urlForImage } from '@/sanity/lib/utils';

import { VariantDetail } from './VariantDetail';
import type { Variant } from './brandTypes';

/** Flat responsive grid of variant thumbnails with an inline, row-anchored detail region. */
export function VariantGrid({
  variants,
  panelExpanded,
  groupLabel,
}: {
  variants: Variant[];
  panelExpanded: boolean;
  groupLabel: string;
}) {
  const groupId = useId();
  const gridRef = useRef<HTMLDivElement>(null);
  const detailRef = useRef<HTMLDivElement>(null);
  const triggerRefs = useRef<Map<number, HTMLButtonElement>>(new Map());
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [insertAfter, setInsertAfter] = useState<number | null>(null);
  const [prevPanelExpanded, setPrevPanelExpanded] = useState(panelExpanded);

  // Closing the outer accordion panel resets any open variant detail. Adjusted
  // during render (not an effect) per React's guidance for resetting state on
  // a prop change — avoids the extra render an effect-based reset would cost.
  if (panelExpanded !== prevPanelExpanded) {
    setPrevPanelExpanded(panelExpanded);
    if (!panelExpanded) {
      setOpenIndex(null);
      setInsertAfter(null);
    }
  }

  const reposition = (index: number) => {
    const grid = gridRef.current;
    const columns = grid
      ? getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
      : 0;
    const cols = columns > 0 ? columns : 1;
    const rowEnd = Math.min(Math.floor(index / cols) * cols + cols - 1, variants.length - 1);
    setInsertAfter(rowEnd);
  };

  const close = () => {
    setOpenIndex(null);
    setInsertAfter(null);
  };

  const handleToggle = (index: number) => {
    if (openIndex === index) {
      close();
      return;
    }
    reposition(index);
    setOpenIndex(index);
  };

  const handleClose = () => {
    const trigger = openIndex !== null ? triggerRefs.current.get(openIndex) : undefined;
    close();
    trigger?.focus();
  };

  // Layout-only: recompute which row the open detail belongs under when the
  // viewport resizes and the grid's column count changes.
  useEffect(() => {
    if (openIndex === null) return undefined;

    const onResize = () => reposition(openIndex);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIndex]);

  useEffect(() => {
    if (insertAfter !== null) {
      detailRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [insertAfter]);

  if (variants.length === 0) return null;

  const activeVariant = openIndex !== null ? variants[openIndex] : null;
  const detailId = `${groupId}-detail`;
  const titleId = `${groupId}-detail-title`;

  // Scoped to this widget via bubbling (not a window listener) so Escape only
  // closes the detail when focus is actually inside the grid.
  const handleGridKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && openIndex !== null) {
      event.stopPropagation();
      handleClose();
    }
  };

  return (
    <div
      ref={gridRef}
      role="group"
      aria-label={`Warianty: ${groupLabel}`}
      onKeyDown={handleGridKeyDown}
      className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] justify-start gap-4"
    >
      {variants.map((variant, index) => {
        const isOpen = openIndex === index;
        const imageUrl = variant.image?.asset
          ? urlForImage(variant.image).width(400).height(300).fit('crop').quality(80).url()
          : undefined;

        return (
          <Fragment key={variant._key}>
            <button
              ref={(el) => {
                if (el) triggerRefs.current.set(index, el);
                else triggerRefs.current.delete(index);
              }}
              type="button"
              aria-expanded={isOpen}
              aria-controls={isOpen ? detailId : undefined}
              onClick={() => handleToggle(index)}
              className={`group flex cursor-pointer flex-col overflow-hidden rounded-lg border bg-bg-surface/80 text-left backdrop-blur-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg-mid ${
                isOpen
                  ? 'border-accent ring-2 ring-accent'
                  : 'border-white/15 hover:-translate-y-0.5 hover:border-accent/40'
              }`}
            >
              <div className="aspect-4/3 w-full overflow-hidden bg-bg-surface">
                {imageUrl && (
                  <Image
                    src={imageUrl}
                    alt={variant.image?.alt || variant.name}
                    width={400}
                    height={300}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <span className="line-clamp-2 min-h-10 px-2 py-2 font-body text-sm leading-5 text-white">
                {variant.name}
              </span>
            </button>
            {insertAfter === index && activeVariant && (
              <div
                key={`${variant._key}-detail`}
                ref={detailRef}
                id={detailId}
                role="region"
                aria-labelledby={titleId}
                className="col-span-full"
              >
                <VariantDetail variant={activeVariant} titleId={titleId} onClose={handleClose} />
              </div>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
