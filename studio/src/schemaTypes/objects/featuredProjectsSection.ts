import { ImagesIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Header copy for the home-page „Wybrane projekty” section. A fixed-id singleton
 * (see structure/index.ts); the project cards themselves are separate `project`
 * documents filtered by `isFeatured`.
 */
export const featuredProjectsSection = defineType({
  name: 'featuredProjectsSection',
  title: 'Sekcja Realizacje',
  type: 'document',
  icon: ImagesIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Nasze realizacje',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek sekcji.',
      type: 'string',
      initialValue: 'Wybrane projekty',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Poznaj nasze realizacje — tarasy, zadaszenia i schody modułowe wykonane z dbałością o każdy detal.',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Sekcja Realizacje', subtitle };
    },
  },
});
