'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import {
  Award,
  CheckCircle,
  Clock,
  Droplets,
  MapPin,
  Ruler,
  ShieldCheck,
  Star,
  Sun,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

import type { ServiceBySlugQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

type Service = NonNullable<ServiceBySlugQueryResult>;
type OfferBenefitsProps = Pick<
  Service,
  'benefitsEyebrow' | 'benefitsHeadline' | 'benefitsDescription' | 'benefits'
>;

const ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  clock: Clock,
  award: Award,
  users: Users,
  star: Star,
  check: CheckCircle,
  tool: Wrench,
  map: MapPin,
  sun: Sun,
  droplets: Droplets,
  ruler: Ruler,
  zap: Zap,
};

export default function OfferBenefits({
  benefitsEyebrow,
  benefitsHeadline,
  benefitsDescription,
  benefits,
}: OfferBenefitsProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-benefits-header]', { y: 30, opacity: 0 });
      gsap.set('[data-benefits-card]', { y: 40, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-benefits-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      }).to(
        '[data-benefits-card]',
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.08 },
        '-=0.3',
      );
    },
    { scope: container, dependencies: [benefits] },
  );

  if (!benefits || benefits.length === 0) return null;

  return (
    <section ref={container} className="section-padding relative overflow-hidden bg-bg-mid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-150 w-150 rounded-full bg-[radial-gradient(circle,rgba(111,207,58,0.08),transparent_70%)] blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p
            data-benefits-header
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
          >
            {benefitsEyebrow || 'Zalety produktu'}
          </p>
          {benefitsHeadline && (
            <h2
              data-benefits-header
              className="font-heading text-4xl font-bold text-white md:text-5xl"
            >
              {benefitsHeadline}
            </h2>
          )}
          {benefitsDescription && (
            <p
              data-benefits-header
              className="mt-4 font-body text-base leading-relaxed text-silver"
            >
              {benefitsDescription}
            </p>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = ICON_MAP[stegaClean(benefit.icon)] ?? ShieldCheck;
            return (
              <div
                key={benefit._key}
                data-benefits-card
                className="rounded-xl border border-graphite bg-bg-surface p-6 transition-colors duration-300 hover:border-accent/40"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="text-accent" size={20} aria-hidden="true" />
                </div>
                <h3 className="mt-2 font-heading text-base font-semibold text-white">
                  {benefit.title}
                </h3>
                {benefit.description && (
                  <p className="mt-1 font-body text-sm leading-relaxed text-silver">
                    {benefit.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
