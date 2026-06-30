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
  Euro,
  FileText,
  Home,
  MapPin,
  Phone,
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
type OfferTechSpecsProps = Pick<
  Service,
  'techSpecsHeadline' | 'techSpecsDescription' | 'techSpecs'
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
  home: Home,
  euro: Euro,
  file: FileText,
  phone: Phone,
};

export default function OfferTechSpecs({
  techSpecsHeadline,
  techSpecsDescription,
  techSpecs,
}: OfferTechSpecsProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-techspecs-header]', { y: 30, opacity: 0 });
      gsap.set('[data-techspecs-card]', { y: 30, opacity: 0 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });

      tl.to('[data-techspecs-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      }).to(
        '[data-techspecs-card]',
        { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1 },
        '-=0.3',
      );
    },
    { scope: container, dependencies: [techSpecs] },
  );

  if (!techSpecs || techSpecs.length === 0) return null;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="max-w-2xl">
          <p
            data-techspecs-header
            className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
          >
            Specyfikacja
          </p>
          {techSpecsHeadline && (
            <h2 data-techspecs-header className="font-heading text-4xl font-bold text-white">
              {techSpecsHeadline}
            </h2>
          )}
          {techSpecsDescription && (
            <p
              data-techspecs-header
              className="mt-3 max-w-2xl font-body text-base leading-relaxed text-silver"
            >
              {techSpecsDescription}
            </p>
          )}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {techSpecs.map((spec) => {
            const Icon = ICON_MAP[stegaClean(spec.icon)] ?? FileText;
            return (
              <div
                key={spec._key}
                data-techspecs-card
                className="glass rounded-xl rounded-t-xl border border-graphite border-t-2 border-t-accent/30 p-6 transition-colors duration-300 hover:border-accent/30"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                    <Icon className="text-accent" size={20} aria-hidden="true" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white">{spec.title}</h3>
                </div>
                <p className="font-body text-sm leading-relaxed text-silver">{spec.content}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
