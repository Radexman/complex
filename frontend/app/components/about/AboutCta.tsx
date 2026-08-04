'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Closing lead-gen CTA for /o-nas. Copy is hardcoded — it is a standard closing block with
 * nothing product-specific to edit. Mirrors the accent bars and eyebrow pill of OfferFormCta.
 */
export default function AboutCta() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-aboutcta-content]', { y: 40, opacity: 0 });
      gsap.set('[data-aboutcta-bar]', { scaleX: 0, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-aboutcta-bar]', {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        transformOrigin: 'center',
      }).to(
        '[data-aboutcta-content]',
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
        '-=0.5',
      );
    },
    { scope: container },
  );

  return (
    <section ref={container} className="bg-bg-deep py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div
          data-aboutcta-bar
          className="mb-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />

        <span
          data-aboutcta-content
          className="inline-flex items-center gap-2 rounded-full border border-graphite bg-bg-surface px-4 py-1.5 text-sm text-silver"
        >
          <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
          Zacznijmy współpracę
        </span>

        <h2
          data-aboutcta-content
          className="mt-6 font-heading text-4xl font-bold leading-tight text-white md:text-5xl"
        >
          Masz pytania lub chcesz poznać naszą ofertę?
        </h2>

        <p data-aboutcta-content className="mx-auto mt-4 max-w-xl font-body text-lg text-silver">
          Skontaktuj się z nami — odpowiadamy w ciągu 5 dni roboczych i umawiamy bezpłatną wizytę
          pomiarową.
        </p>

        <div data-aboutcta-content className="mt-10 flex flex-wrap justify-center gap-4">
          {/* The contact block lives on the home page — there is no /kontakt route. */}
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-3 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            Skontaktuj się
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link
            href="/wycena"
            className="inline-flex items-center gap-3 rounded-lg border border-graphite px-8 py-4 text-base font-semibold text-white transition-colors hover:border-accent/50 hover:text-accent"
          >
            Formularz wyceny
          </Link>
        </div>

        <div
          data-aboutcta-bar
          className="mt-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
