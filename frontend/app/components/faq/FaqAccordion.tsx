'use client';

import { useRef } from 'react';
import { Accordion } from '@ark-ui/react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Plus } from 'lucide-react';

import type { FaqPageQueryResult } from '@/sanity.types';

gsap.registerPlugin(ScrollTrigger);

type FaqAccordionProps = { categories: NonNullable<FaqPageQueryResult>['categories'] };

export default function FaqAccordion({ categories }: FaqAccordionProps) {
  const container = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-faq-category]', { y: 30, opacity: 0 });

      gsap.to('[data-faq-category]', {
        y: 0,
        opacity: 1,
        duration: 0.6,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: container.current,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [categories] },
  );

  if (!categories || categories.length === 0) return null;

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-3xl px-6 md:px-12">
        {categories.map((category) => {
          const items = category.items ?? [];
          if (items.length === 0) return null;

          return (
            <div key={category._key} data-faq-category className="mb-12 last:mb-0">
              <h2 className="mb-6 border-b border-graphite pb-3 font-heading text-xl font-semibold text-white">
                {category.title}
              </h2>
              <Accordion.Root collapsible multiple={false}>
                {items.map((item) => (
                  <Accordion.Item
                    key={item._key}
                    value={item._key}
                    className="border-b border-graphite py-4"
                  >
                    <Accordion.ItemTrigger className="group flex w-full cursor-pointer items-center justify-between text-left font-medium text-white outline-none transition-colors duration-200 hover:text-accent">
                      {item.question}
                      <Accordion.ItemIndicator className="ml-4 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45">
                        <Plus size={20} aria-hidden="true" />
                      </Accordion.ItemIndicator>
                    </Accordion.ItemTrigger>
                    <Accordion.ItemContent className="overflow-hidden">
                      <p className="pb-1 pt-3 font-body text-sm leading-relaxed text-silver">
                        {item.answer}
                      </p>
                    </Accordion.ItemContent>
                  </Accordion.Item>
                ))}
              </Accordion.Root>
            </div>
          );
        })}
      </div>
    </section>
  );
}
