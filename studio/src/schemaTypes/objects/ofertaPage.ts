import { TagIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Header copy for the offer index page (`/oferta`) — the overview listing every
 * service. A fixed-id singleton (see structure/index.ts), mirroring `realizacjePage`
 * and `tarasyPage`. The cards on the page are derived from the `service` documents
 * themselves — only the heading/intro copy lives here.
 */
export const ofertaPage = defineType({
  name: 'ofertaPage',
  title: 'Strona Oferta',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Co oferujemy',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek strony.',
      type: 'string',
      initialValue: 'Oferta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Specjalizujemy się w kompleksowej realizacji przestrzeni zewnętrznych. Wybierz kategorię, która Cię interesuje, aby poznać szczegóły i zobaczyć nasze realizacje.',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Strona Oferta', subtitle };
    },
  },
});
