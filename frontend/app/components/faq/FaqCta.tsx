'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

/**
 * Closing CTA for /faq. Copy is hardcoded, same call as AboutCta — a standard closing block with
 * nothing product-specific to edit. "Napisz do nas" points at the home page's contact/showroom
 * section (`/#kontakt`), not a `/kontakt` route, which doesn't exist — same as AboutCta's CTA.
 */
export default function FaqCta() {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-faqcta-content]', { y: 40, opacity: 0 });
      gsap.set('[data-faqcta-bar]', { scaleX: 0, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-faqcta-bar]', {
        scaleX: 1,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        transformOrigin: 'center',
      }).to(
        '[data-faqcta-content]',
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.1 },
        '-=0.5',
      );
    },
    { scope: container },
  );

  return (
    <section ref={container} className="bg-bg-mid py-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <div
          data-faqcta-bar
          className="mb-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />

        <h2
          data-faqcta-content
          className="font-heading text-4xl font-bold leading-tight text-white md:text-5xl"
        >
          Nie znalazłeś odpowiedzi na swoje pytanie?
        </h2>

        <p data-faqcta-content className="mx-auto mt-4 max-w-xl font-body text-lg text-silver">
          Napisz do nas bezpośrednio — odpowiemy szybko i bez zbędnych formalności.
        </p>

        <div data-faqcta-content className="mt-10 flex flex-wrap justify-center gap-4">
          <Link
            href="/#kontakt"
            className="inline-flex items-center gap-3 rounded-lg bg-accent px-8 py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover"
          >
            Napisz do nas
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
          data-faqcta-bar
          className="mt-16 h-px w-full bg-linear-to-r from-transparent via-accent/50 to-transparent"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
