'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';
import { stegaClean } from 'next-sanity';

import type { WycenaPageQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

type WycenaPage = NonNullable<WycenaPageQueryResult>;
type FormCard = NonNullable<WycenaPage['forms']>[number];

/**
 * One quotation form as a full-width stripe. Deliberately image-free and uniform:
 * the page used to be a bento grid of photo tiles, which the client said „wygląda
 * jak realizacje" and distracted from the forms themselves (feedback round 4).
 *
 * The whole row is a single <Link>, so there is no stretched-::after overlay and
 * no second anchor to the same destination.
 *
 * `min-h-36` plus a two-line clamp on the description keep every stripe the same
 * height whatever the copy does — the client asked for „równe paski", and without
 * both the row with the longest description sat ~23px taller than the rest.
 */
function FormStripe({ card }: { card: FormCard }) {
  return (
    <Link
      data-wycena-stripe
      href={`/wycena/${stegaClean(card.formSlug)}`}
      className="group flex min-h-36 items-center justify-between gap-6 rounded-xl border border-graphite p-6 transition-colors duration-300 hover:border-accent/60 hover:bg-bg-surface md:p-7"
    >
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="font-heading text-xl leading-tight font-bold text-white md:text-2xl">
            {card.title}
          </h2>
          {card.badge && (
            <span className="rounded-full bg-accent px-3 py-1 font-heading text-xs font-semibold text-black">
              {card.badge}
            </span>
          )}
        </div>
        {card.description && (
          <p className="mt-2 line-clamp-2 max-w-2xl font-body text-sm leading-relaxed text-silver">
            {card.description}
          </p>
        )}
      </div>
      <span
        aria-hidden="true"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-graphite text-silver transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-black"
      >
        <ArrowRight size={20} />
      </span>
    </Link>
  );
}

export default function WycenaFormList({ page }: { page: WycenaPage }) {
  const container = useRef<HTMLDivElement>(null);
  const forms = page.forms ?? [];

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-wycena-hero-left]', { x: -30, opacity: 0 });
      gsap.set('[data-wycena-hero-right]', { x: 30, opacity: 0 });
      gsap.set('[data-wycena-stripe]', { y: 30, opacity: 0 });

      gsap.to('[data-wycena-hero-left], [data-wycena-hero-right]', {
        x: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.to('[data-wycena-stripe]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.08,
        scrollTrigger: {
          trigger: '[data-wycena-list]',
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [forms.length] },
  );

  return (
    <div ref={container} className="min-h-screen bg-bg-deep">
      <header className="border-b border-graphite bg-bg-mid pt-28 pb-16 md:pb-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-end gap-8 px-6 md:grid-cols-2 md:gap-12 md:px-12">
          <div data-wycena-hero-left>
            {page.eyebrow && (
              <p className="mb-3 text-xs font-semibold tracking-widest text-accent uppercase">
                {page.eyebrow}
              </p>
            )}
            <h1 className="font-heading text-5xl leading-none font-bold text-white md:text-7xl">
              {page.headline || 'Wycena'}
            </h1>
          </div>
          {page.subheadline && (
            <div data-wycena-hero-right className="border-t border-accent/30 pt-6">
              <p className="font-body text-base leading-relaxed text-silver">{page.subheadline}</p>
            </div>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 pb-24 md:px-12">
        <div data-wycena-list className="mt-12 flex flex-col gap-4">
          {forms.map((card) => (
            <FormStripe key={card._key} card={card} />
          ))}
        </div>
      </div>
    </div>
  );
}
