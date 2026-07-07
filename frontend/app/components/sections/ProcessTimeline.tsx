'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { stegaClean } from 'next-sanity';
import {
  Calculator,
  FileCheck,
  FileSignature,
  Hammer,
  Mail,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

import type { ProcessTimelineQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

const ICON_MAP: Record<string, LucideIcon> = {
  'mail': Mail,
  'calculator': Calculator,
  'file-check': FileCheck,
  'file-signature': FileSignature,
  'hammer': Hammer,
  'shield-check': ShieldCheck,
};

type ProcessTimelineData = NonNullable<ProcessTimelineQueryResult>;

export default function ProcessTimeline({ data }: { data: ProcessTimelineData }) {
  const container = useRef<HTMLElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progressLine = useRef<HTMLDivElement>(null);

  const { eyebrow, headline, subheadline, steps } = data;

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-timeline-header]', { y: 30, opacity: 0 });
      gsap.to('[data-timeline-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: { trigger: container.current, start: 'top 85%' },
      });

      const rows = container.current.querySelectorAll<HTMLElement>('[data-step-row]');
      rows.forEach((row) => {
        gsap.set(row, { x: -20, opacity: 0 });
        gsap.to(row, {
          x: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'power3.out',
          scrollTrigger: { trigger: row, start: 'top 85%' },
        });
      });

      if (progressLine.current && timeline.current) {
        gsap.fromTo(
          progressLine.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: timeline.current,
              start: 'top 60%',
              end: 'bottom 60%',
              scrub: true,
            },
          },
        );
      }

      const nodes = container.current.querySelectorAll<HTMLElement>('[data-step-node]');
      nodes.forEach((node) => {
        const icon = node.querySelector<HTMLElement>('[data-node-icon]');
        ScrollTrigger.create({
          trigger: node,
          start: 'top 60%',
          onEnter: () => {
            node.classList.add('border-accent', 'bg-accent/10');
            node.classList.remove('border-graphite');
            icon?.classList.add('text-accent');
            icon?.classList.remove('text-silver');
          },
          onLeaveBack: () => {
            node.classList.remove('border-accent', 'bg-accent/10');
            node.classList.add('border-graphite');
            icon?.classList.remove('text-accent');
            icon?.classList.add('text-silver');
          },
        });
      });
    },
    { scope: container, dependencies: [steps] },
  );

  useEffect(() => {
    const el = timeline.current;
    const trackEl = track.current;
    if (!el || !trackEl) return;

    const position = () => {
      const nodes = el.querySelectorAll<HTMLElement>('[data-step-node]');
      if (nodes.length === 0) return;
      const containerTop = el.getBoundingClientRect().top;
      const first = nodes[0].getBoundingClientRect();
      const last = nodes[nodes.length - 1].getBoundingClientRect();
      const top = first.top + first.height / 2 - containerTop;
      const height = last.top + last.height / 2 - containerTop - top;
      trackEl.style.top = `${top}px`;
      trackEl.style.height = `${Math.max(0, height)}px`;
    };

    position();
    const observer = new ResizeObserver(position);
    observer.observe(el);
    return () => observer.disconnect();
  }, [steps]);

  return (
    <section ref={container} className="section-padding bg-bg-mid">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        <div className="text-center">
          {eyebrow && (
            <p
              data-timeline-header
              className="mb-3 text-xs font-semibold uppercase tracking-widest text-accent"
            >
              {eyebrow}
            </p>
          )}
          {headline && (
            <h2
              data-timeline-header
              className="text-center font-heading text-4xl font-bold text-white md:text-5xl"
            >
              {headline}
            </h2>
          )}
          {subheadline && (
            <p
              data-timeline-header
              className="mx-auto mt-4 max-w-xl text-center font-body text-base text-silver"
            >
              {subheadline}
            </p>
          )}
        </div>

        {steps && steps.length > 0 && (
          <div ref={timeline} className="relative mx-auto mt-16 max-w-3xl">
            {/* Vertical connecting line — centered on the nodes; top/height set in
                JS so it spans exactly from the first to the last node center. */}
            <div
              ref={track}
              aria-hidden="true"
              className="absolute left-5 w-px -translate-x-1/2 bg-graphite sm:left-6"
            >
              <div
                ref={progressLine}
                className="absolute left-0 top-0 h-full w-full origin-top bg-accent"
                style={{ transform: 'scaleY(0)' }}
              />
            </div>
            <div className="flex flex-col gap-6 sm:gap-8">
              {steps.map((step) => {
                const Icon = ICON_MAP[stegaClean(step.icon ?? '')] ?? Mail;
                return (
                  <div key={step._key} data-step-row className="relative flex items-start gap-6">
                    <div className="relative z-10 shrink-0">
                      <div
                        data-step-node
                        className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-graphite bg-bg-surface transition-colors duration-300 sm:h-12 sm:w-12"
                      >
                        <Icon
                          data-node-icon
                          className="h-4 w-4 text-silver transition-colors duration-300 sm:h-4.5 sm:w-4.5"
                          aria-hidden="true"
                        />
                      </div>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="mb-1.5 flex items-center gap-3">
                        {step.number && (
                          <span className="font-heading text-sm font-bold text-accent">
                            {step.number}
                          </span>
                        )}
                        {step.title && (
                          <h3 className="font-heading text-lg font-semibold text-white">
                            {step.title}
                          </h3>
                        )}
                      </div>
                      {step.description && (
                        <p className="max-w-lg font-body text-sm leading-relaxed text-silver">
                          {step.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
