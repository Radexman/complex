'use client';

import { useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

import type { BeforeAfterQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import BeforeAfterSlider from '@/app/components/ui/BeforeAfterSlider';

gsap.registerPlugin(ScrollTrigger);

export default function BeforeAfterSection({ data }: { data: NonNullable<BeforeAfterQueryResult> }) {
  const container = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const items = (data.items ?? []).filter((item) => item.beforeImage?.asset && item.afterImage?.asset);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-before-after-reveal]', { y: 40, opacity: 0 });
      gsap.to('[data-before-after-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        stagger: 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [items.length] },
  );

  if (items.length === 0) return null;

  const active = items[Math.min(activeIndex, items.length - 1)];
  const beforeSrc = urlForImage(active.beforeImage)?.width(1600).fit('max').url();
  const afterSrc = urlForImage(active.afterImage)?.width(1600).fit('max').url();

  if (!beforeSrc || !afterSrc) return null;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-10 max-w-2xl" data-before-after-reveal>
          {data.eyebrow && (
            <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
              {data.eyebrow}
            </p>
          )}
          <h2 className="font-heading text-3xl font-bold text-white md:text-4xl">{data.headline}</h2>
          {data.subheadline && (
            <p className="mt-4 font-body text-base leading-relaxed text-silver">
              {data.subheadline}
            </p>
          )}
        </div>

        <div data-before-after-reveal>
          <BeforeAfterSlider
            // Remounts on change so the divider resets to the middle for each project.
            key={active._key}
            beforeSrc={beforeSrc}
            beforeAlt={active.beforeImage?.alt ?? `${active.title} — przed realizacją`}
            afterSrc={afterSrc}
            afterAlt={active.afterImage?.alt ?? `${active.title} — po realizacji`}
          />

          <div className="mt-4 flex flex-wrap items-baseline gap-x-3">
            <h3 className="font-heading text-lg font-semibold text-white">{active.title}</h3>
            {active.location && <span className="font-body text-sm text-silver">{active.location}</span>}
          </div>
        </div>

        {/* Project picker — only earns its place once there is more than one. */}
        {items.length > 1 && (
          <div className="mt-6 flex flex-wrap gap-2" data-before-after-reveal>
            {items.map((item, index) => (
              <button
                key={item._key}
                type="button"
                onClick={() => setActiveIndex(index)}
                aria-current={index === activeIndex ? 'true' : undefined}
                className={`rounded-full border px-4 py-2 font-body text-sm transition-colors ${
                  index === activeIndex
                    ? 'border-accent bg-accent/10 text-white'
                    : 'border-graphite text-silver hover:border-accent/50 hover:text-white'
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
