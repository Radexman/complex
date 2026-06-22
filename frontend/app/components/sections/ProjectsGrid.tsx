'use client';

import Image from 'next/image';
import { useMemo, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';
import { Tabs } from '@ark-ui/react/tabs';
import { stegaClean } from 'next-sanity';

import type { AllProjectsQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import ProjectLightbox from '@/app/components/ui/ProjectLightbox';

gsap.registerPlugin(ScrollTrigger);

type Project = AllProjectsQueryResult[number];
type ProjectCategory = Project['category'];

const ALL = 'all';

/** Polish labels keyed by category value. Order here drives the (static) tab order. */
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
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
      )}
      <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
      {/* Category badge */}
      <span className="absolute left-3 top-3 text-xs font-semibold uppercase tracking-widest text-accent">
        {categoryLabel(stegaClean(project.category))}
      </span>
      {/* Bottom info row */}
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
        <p className="font-heading text-lg font-bold leading-tight text-white">{project.city}</p>
        {project.surface != null && <p className="font-body text-sm text-silver">{project.surface} m²</p>}
      </div>
    </button>
  );
}

export default function ProjectsGrid({ projects }: { projects: AllProjectsQueryResult }) {
  const container = useRef<HTMLElement>(null);
  const [activeTab, setActiveTab] = useState<string>(ALL);
  const [selected, setSelected] = useState<Project | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === ALL) return projects;
    return projects.filter((p) => stegaClean(p.category) === activeTab);
  }, [projects, activeTab]);

  // Page header reveal on mount — it's above the fold, so no ScrollTrigger.
  useGSAP(
    () => {
      gsap.fromTo(
        '[data-pg-reveal]',
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
      );
    },
    { scope: container },
  );

  // Re-run the card reveal on initial render and on every filter change.
  useGSAP(
    () => {
      gsap.fromTo(
        '[data-project-card]',
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', stagger: 0.07 },
      );
    },
    { scope: container, dependencies: [activeTab, projects] },
  );

  return (
    <section ref={container} className="section-padding bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6 md:px-12">
        {/* Header */}
        <div className="text-center">
          <p
            data-pg-reveal
            className="text-xs font-semibold uppercase tracking-widest text-accent"
          >
            Nasze portfolio
          </p>
          <h1
            data-pg-reveal
            className="mt-2 font-heading text-5xl font-bold text-white md:text-6xl"
          >
            Realizacje
          </h1>
          <p
            data-pg-reveal
            className="mx-auto mt-4 max-w-2xl font-body text-base text-silver"
          >
            Przeglądaj nasze projekty tarasów, zadaszeń, żaluzji i schodów modułowych. Każda
            realizacja to indywidualne podejście i dbałość o każdy detal.
          </p>
        </div>

        {/* Category tabs — all categories always shown, in fixed order */}
        <Tabs.Root
          value={activeTab}
          onValueChange={(details) => setActiveTab(details.value)}
          activationMode="manual"
        >
          <Tabs.List data-pg-reveal className="mt-10 flex flex-wrap justify-center gap-2">
            <Tabs.Trigger
              value={ALL}
              className="cursor-pointer rounded-full border border-graphite bg-bg-surface px-4 py-2 text-sm font-medium text-silver transition-all duration-200 hover:text-white data-[selected]:border-accent data-[selected]:bg-accent data-[selected]:text-black"
            >
              Wszystkie
            </Tabs.Trigger>
            {CATEGORY_ORDER.map((category) => (
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

        {/* Results count */}
        <p className="mt-4 text-center text-sm text-silver">
          Wyświetlono {filtered.length} realizacji
        </p>

        {/* Project grid */}
        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpen={() => setSelected(project)}
            />
          ))}
        </div>
      </div>

      <ProjectLightbox project={selected} onClose={() => setSelected(null)} />
    </section>
  );
}
