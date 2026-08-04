'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';

import type { AboutPageQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

gsap.registerPlugin(ScrollTrigger);

type AboutPage = NonNullable<AboutPageQueryResult>;
type AboutStoryProps = Pick<
  AboutPage,
  'storyEyebrow' | 'storyHeadline' | 'storyBody' | 'storyImage' | 'storyStats'
>;

export default function AboutStory({
  storyEyebrow,
  storyHeadline,
  storyBody,
  storyImage,
  storyStats,
}: AboutStoryProps) {
  const container = useRef<HTMLElement>(null);

  const imageUrl = storyImage?.asset
    ? urlForImage(storyImage).width(1200).quality(80).url()
    : undefined;

  // Same convention as AboutSection: one textarea, blank line separates paragraphs.
  const paragraphs = storyBody
    ? storyBody.split(/\n{2,}/).filter((paragraph) => paragraph.trim().length > 0)
    : [];

  const stats = storyStats ?? [];

  useGSAP(
    () => {
      if (!container.current) return;

      // Resolve targets rather than passing selector strings: the image block is absent
      // until the client uploads a photo, and GSAP warns on a selector that matches
      // nothing (the TrustSection lesson).
      const find = (sel: string) => container.current!.querySelectorAll<HTMLElement>(sel);
      const image = find('[data-story-image]');
      const text = find('[data-story-text]');
      const statEls = find('[data-story-stat]');

      if (image.length) gsap.set(image, { x: -40, opacity: 0 });
      if (text.length) gsap.set(text, { x: 40, opacity: 0 });
      if (statEls.length) gsap.set(statEls, { y: 20, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });

      if (image.length) {
        tl.to(image, { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' });
      }
      if (text.length) {
        tl.to(
          text,
          { x: 0, opacity: 1, duration: 0.9, ease: 'power3.out' },
          image.length ? '-=0.8' : 0,
        );
      }
      if (statEls.length) {
        tl.to(
          statEls,
          { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
          '-=0.4',
        );
      }
    },
    { scope: container, dependencies: [storyStats, imageUrl] },
  );

  return (
    <section ref={container} className="section-padding bg-bg-mid">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Without an image the two-column grid would leave half the row empty, so the text
            goes full-width and the stats become a row underneath it. */}
        <div
          className={`grid grid-cols-1 items-center gap-12 ${imageUrl ? 'lg:grid-cols-2 lg:gap-16' : ''}`}
        >
          {imageUrl && (
            <div data-story-image>
              <div className="relative aspect-4/5 overflow-hidden rounded-2xl ring-1 ring-accent/20">
                <Image
                  src={imageUrl}
                  alt={storyImage?.alt || stegaClean(storyHeadline) || 'Complex'}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>

              {stats.length > 0 && (
                <div className="mt-8 flex flex-wrap gap-8 border-t border-graphite pt-8">
                  {stats.map((stat) => (
                    <div key={stat._key} data-story-stat>
                      <p className="font-heading text-3xl font-bold text-accent">{stat.value}</p>
                      <p className="mt-1 font-body text-xs uppercase tracking-wider text-silver">
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div data-story-text>
            {storyEyebrow && (
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-accent">
                {storyEyebrow}
              </p>
            )}
            {storyHeadline && (
              <h2 className="mb-6 font-heading text-4xl font-bold leading-tight text-white">
                {storyHeadline}
              </h2>
            )}
            {paragraphs.length > 0 && (
              <div className="space-y-4">
                {paragraphs.map((paragraph, index) => (
                  <p key={index} className="font-body text-base leading-relaxed text-silver">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            {!imageUrl && stats.length > 0 && (
              <div className="mt-8 flex flex-wrap gap-12 border-t border-graphite pt-8">
                {stats.map((stat) => (
                  <div key={stat._key} data-story-stat>
                    <p className="font-heading text-3xl font-bold text-accent">{stat.value}</p>
                    <p className="mt-1 font-body text-xs uppercase tracking-wider text-silver">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
