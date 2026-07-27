import { ThLargeIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Header copy for the standalone terrace landing page (`/tarasy`) that the company's
 * Google Ads point to. A fixed-id singleton (see structure/index.ts). The category
 * cards on the page are derived from the terrace `service` documents — only the
 * heading/intro copy lives here.
 */
export const tarasyPage = defineType({
  name: 'tarasyPage',
  title: 'Strona Tarasy',
  type: 'document',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Tarasy',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek strony.',
      type: 'string',
      initialValue: 'Tarasy na każdy dom',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Kompozytowe, gresowe i drewniane — wybierz rodzaj tarasu, który najlepiej pasuje do Twojej przestrzeni, i zobacz szczegóły oraz nasze realizacje.',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Strona Tarasy', subtitle };
    },
  },
});
