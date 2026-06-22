import { ImagesIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Header copy for the standalone „Realizacje” listing page (`/realizacje`). A fixed-id
 * singleton (see structure/index.ts) — distinct from `featuredProjectsSection`, which is the
 * home-page section header. The project cards on this page come from `project` documents.
 */
export const realizacjePage = defineType({
  name: 'realizacjePage',
  title: 'Strona Realizacje',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Nasze portfolio',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek strony.',
      type: 'string',
      initialValue: 'Realizacje',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Przeglądaj nasze projekty tarasów, zadaszeń, żaluzji i schodów modułowych. Każda realizacja to indywidualne podejście i dbałość o każdy detal.',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Strona Realizacje', subtitle };
    },
  },
});
