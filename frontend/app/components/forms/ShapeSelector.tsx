'use client';

import Image from 'next/image';
import { RadioGroup } from '@ark-ui/react/radio-group';
import { stegaClean } from 'next-sanity';

import type { TarasFormConfigQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

export type TarasShapeOption = NonNullable<TarasFormConfigQueryResult>['shapes'][number];

interface ShapeSelectorProps {
  shapes: TarasShapeOption[];
  value?: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}

export function ShapeSelector({ shapes, value, onChange, onBlur, error }: ShapeSelectorProps) {
  return (
    <div>
      <RadioGroup.Root
        value={value ?? null}
        onValueChange={(details) => details.value && onChange(details.value)}
        onBlur={onBlur}
      >
        <div className="grid grid-cols-2 gap-3">
          {shapes.map((shape) => {
            const shapeNumber = stegaClean(shape.shapeNumber);
            const imageUrl = shape.image?.asset
              ? urlForImage(shape.image).width(400).fit('max').url()
              : undefined;

            return (
              <RadioGroup.Item
                key={shape._key}
                value={shapeNumber}
                className="relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-graphite bg-bg-surface p-3 transition-all duration-200 hover:border-accent/50 data-[state=checked]:border-accent data-[state=checked]:bg-accent/5"
              >
                {imageUrl ? (
                  <div className="relative h-28 w-full">
                    <Image
                      src={imageUrl}
                      alt={shape.image?.alt || shape.label}
                      fill
                      sizes="(max-width: 768px) 45vw, 220px"
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-28 w-full items-center justify-center font-display text-4xl text-silver/40">
                    {shapeNumber}
                  </div>
                )}
                <RadioGroup.ItemText className="text-center font-body text-xs text-silver">
                  {shape.label}
                </RadioGroup.ItemText>
                <RadioGroup.ItemControl className="sr-only" />
                <RadioGroup.ItemHiddenInput />
              </RadioGroup.Item>
            );
          })}
        </div>
      </RadioGroup.Root>
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}
