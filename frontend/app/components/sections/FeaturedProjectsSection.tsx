'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Tabs } from '@ark-ui/react/tabs';
import { stegaClean } from 'next-sanity';
import { ArrowUpRight } from 'lucide-react';

import type {
  FeaturedProjectsQueryResult,
  FeaturedProjectsSectionQueryResult,
} from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import ProjectLightbox from '@/app/components/ui/ProjectLightbox';

gsap.registerPlugin(ScrollTrigger);

type Project = FeaturedProjectsQueryResult[number];
type ProjectCategory = Project['category'];

const ALL = 'all';

/** Polish labels keyed by category value. Order here drives the tab order. */
const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'zadaszenia-aluminiowe': 'Zadaszenia aluminiowe',
  'zaluzje-tarasowe': 'Żaluzje tarasowe',
  'tarasy-kompozytowe': 'Tarasy kompozytowe',
  'tarasy-gresowe': 'Tarasy z płyt gresowych',
  'tarasy-drewniane': 'Tarasy drewniane',
  'elewacje-kompozytowe': 'Elewacje kompozytowe',
  'schody-modulowe': 'Schody modułowe',
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

function categoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}

function ProjectCard({ project, onOpen }: { project: Project; onOpen: () => void }) {
  const imageUrl = project.coverImage?.asset
    ? urlForImage(project.coverImage).width(800).height(600).fit('crop').quality(80).url()
    : undefined;

  return (
    <button
      type="button"
      data-project-card
      onClick={onOpen}
      className="group relative aspect-4/3 cursor-pointer overflow-hidden rounded-xl bg-bg-surface text-left"
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={project.coverImage?.alt || project.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
          className="object-cover brightness-90 transition duration-300 group-hover:scale-[1.02] group-hover:brightness-100"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/75 via-black/25 to-transparent transition-opacity duration-300 group-hover:opacity-80" />
      <div className="absolute inset-x-3 bottom-3">
        <p className="font-heading text-lg font-bold leading-tight text-white">{project.title}</p>
        <p className="mt-1 font-body text-sm text-silver">{project.city}</p>
      </div>
    </button>
  );
}

export default function FeaturedProjectsSection({
  data,
  projects,
}: {
  data: NonNullable<FeaturedProjectsSectionQueryResult>;
  projects: FeaturedProjectsQueryResult;
}) {
  const container = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>(ALL);
  const [selected, setSelected] = useState<Project | null>(null);

  const { eyebrow, headline, subheadline } = data;

  // Only show a tab for categories that actually have a featured project.
  const categories = useMemo(() => {
    const present = new Set(projects.map((p) => stegaClean(p.category)));
    return CATEGORY_ORDER.filter((category) => present.has(category));
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeTab === ALL) return projects;
    return projects.filter((p) => stegaClean(p.category) === activeTab);
  }, [projects, activeTab]);

  useGSAP(
    () => {
      if (!container.current) return;

      gsap.set('[data-fp-reveal]', { y: 30, opacity: 0 });
      gsap.to('[data-fp-reveal]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.15,
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      });
    },
    { scope: container, dependencies: [data] },
  );

  // Re-run the card reveal whenever the filtered set changes (initial load + tab switch).
  useGSAP(
    () => {
      if (!container.current) return;

      gsap.fromTo(
        '[data-project-card]',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
          scrollTrigger: {
            trigger: '[data-fp-grid]',
            start: 'top 90%',
            toggleActions: 'play none none none',
          },
        },
      );
    },
    { scope: container, dependencies: [activeTab, projects] },
  );

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl">
            {eyebrow && (
              <p
                data-fp-reveal
                className="text-xs font-semibold uppercase tracking-widest text-accent"
              >
                {eyebrow}
              </p>
            )}
            <h2
              data-fp-reveal
              className="mt-2 font-heading text-4xl font-bold text-white md:text-5xl"
            >
              {headline}
            </h2>
            {subheadline && (
              <p data-fp-reveal className="mt-3 font-body text-base text-silver">
                {subheadline}
              </p>
            )}
          </div>
          <Link
            data-fp-reveal
            href="/realizacje"
            className="group inline-flex shrink-0 items-center gap-1.5 font-heading text-sm font-medium text-accent transition-colors hover:text-accent-hover"
          >
            Zobacz wszystkie realizacje
            <ArrowUpRight
              size={18}
              className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Category tabs */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(details) => setActiveTab(details.value)}
          activationMode="manual"
          className="mt-8"
        >
          <Tabs.List data-fp-reveal className="flex flex-wrap gap-2">
            <Tabs.Trigger
              value={ALL}
              className="cursor-pointer rounded-full border border-graphite bg-bg-surface px-4 py-2 text-sm font-medium text-silver transition-all duration-200 hover:text-white data-[selected]:border-accent data-[selected]:bg-accent data-[selected]:text-black"
            >
              Wszystkie
            </Tabs.Trigger>
            {categories.map((category) => (
              <Tabs.Trigger
                key={category}
                value={category}
                className="cursor-pointer rounded-full border border-graphite bg-bg-surface px-4 py-2 text-sm font-medium text-silver transition-all duration-200 hover:text-white data-[selected]:border-accent data-[selected]:bg-accent data-[selected]:text-black"
              >
                {categoryLabel(category)}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
        </Tabs.Root>

        {/* Project grid */}
        <div data-fp-grid className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard key={project._id} project={project} onOpen={() => setSelected(project)} />
          ))}
        </div>
      </div>

      <ProjectLightbox project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
