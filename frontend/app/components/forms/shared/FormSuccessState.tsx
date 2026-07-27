'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import { CheckCircle } from 'lucide-react';

import type { ProcessTimelineQueryResult } from '@/sanity.types';
import { PROCESS_STEP_ICON_MAP } from '@/app/lib/processStepIcons';

export type ProcessStepData = NonNullable<ProcessTimelineQueryResult>['steps'][number];

type FormType = 'taras' | 'zadaszenie' | 'zaluzje' | 'schody' | 'kontakt';

const HEADLINES: Record<FormType, string> = {
  taras: 'Zapytanie o taras wysłane!',
  zadaszenie: 'Zapytanie o zadaszenie wysłane!',
  zaluzje: 'Zapytanie o żaluzje wysłane!',
  schody: 'Zapytanie o schody wysłane!',
  kontakt: 'Wiadomość wysłana!',
};

interface FormSuccessStateProps {
  formType: FormType;
  /** The email the customer entered — echoed so they know where to expect a reply. */
  submittedEmail: string;
  /** The full `processTimeline` steps; the recap shows the next three (steps 2–4). */
  steps: ProcessStepData[];
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
}

export default function FormSuccessState({
  formType,
  submittedEmail,
  steps,
  primaryCtaLabel = 'Wróć na stronę główną',
  primaryCtaHref = '/',
}: FormSuccessStateProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo(
        '[data-success-header]',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7 },
      );
      tl.fromTo(
        '[data-success-divider]',
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 0.6, transformOrigin: 'left' },
        '-=0.2',
      );
      tl.fromTo(
        '[data-success-step]',
        { x: -20, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.2',
      );
      tl.fromTo(
        '[data-success-cta]',
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
        '-=0.2',
      );
    },
    { scope: container },
  );

  // The customer has just completed step 1 (Zapytanie), so the recap shows the
  // three steps that follow — Wycena wstępna → Wycena końcowa → Umowa — with the
  // immediate next step highlighted.
  const nextSteps = steps.slice(1, 4);
  const isContact = formType === 'kontakt';

  return (
    <div ref={container} className="mx-auto max-w-2xl px-6 py-16 text-center">
      {/* 1. Confirmation header */}
      <div data-success-header>
        <CheckCircle size={56} className="mx-auto mb-6 text-accent" aria-hidden="true" />
        <h2 className="font-heading text-3xl font-bold text-white">{HEADLINES[formType]}</h2>
        <p className="mx-auto mt-3 max-w-lg font-body text-base leading-relaxed text-silver">
          {isContact ? (
            <>
              Dziękujemy za wiadomość! Odpiszemy na adres{' '}
              <span className="font-medium text-accent">{submittedEmail}</span> najszybciej jak to
              możliwe.
            </>
          ) : (
            <>
              Dziękujemy! Twoje zapytanie zostało przyjęte. Skontaktujemy się z Tobą na adres{' '}
              <span className="font-medium text-accent">{submittedEmail}</span> lub telefonicznie w
              ciągu 24 godzin roboczych.
            </>
          )}
        </p>
      </div>

      {/* 2. + 3. Divider + "Co dalej?" process recap */}
      {nextSteps.length > 0 && (
        <>
          <div data-success-divider className="my-10 border-t border-graphite" />

          <div>
            <p className="mb-6 text-left font-body text-sm font-semibold text-white">
              Co dalej? Oto co możesz oczekiwać:
            </p>

            <div className="flex flex-col gap-4 text-left">
              {nextSteps.map((step, index) => {
                const Icon = PROCESS_STEP_ICON_MAP[stegaClean(step.icon ?? '')] ?? CheckCircle;
                const highlighted = index === 0;
                return (
                  <div key={step._key} data-success-step className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${
                        highlighted
                          ? 'border-accent bg-accent/20'
                          : 'border-graphite bg-bg-surface'
                      }`}
                    >
                      <Icon
                        size={16}
                        className={highlighted ? 'text-accent' : 'text-silver'}
                        aria-hidden="true"
                      />
                    </div>
                    <div>
                      <p className="font-heading text-sm font-semibold text-white">
                        {step.number} — {step.title}
                      </p>
                      {step.description && (
                        <p className="mt-0.5 font-body text-xs leading-relaxed text-silver">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-xs italic text-silver/60">
              Oferta zostanie przesłana na adres e-mail podany w formularzu do 7 dni roboczych.
              Usługi montażowe wykonujemy na terenie województw śląskiego i opolskiego.
            </p>
          </div>
        </>
      )}

      {/* 4. CTA buttons */}
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Link
          data-success-cta
          href={primaryCtaHref}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
        >
          {primaryCtaLabel}
        </Link>
        <Link
          data-success-cta
          href="/realizacje"
          className="rounded-lg border border-graphite px-6 py-3 text-sm text-silver transition-colors hover:border-accent/50 hover:text-white"
        >
          Zobacz nasze realizacje
        </Link>
      </div>
    </div>
  );
}
