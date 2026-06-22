import { ImageIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Allowed project categories — values mirror the offer slugs (see `offerCard.ts`),
 * but are kept here as a standalone list so the `project` document does not depend on
 * the offer section. Titles are the Polish labels shown to editors and on the site.
 */
export const PROJECT_CATEGORIES = [
  { title: 'Zadaszenia aluminiowe', value: 'zadaszenia-aluminiowe' },
  { title: 'Żaluzje tarasowe', value: 'zaluzje-tarasowe' },
  { title: 'Tarasy kompozytowe', value: 'tarasy-kompozytowe' },
  { title: 'Tarasy z płyt gresowych', value: 'tarasy-gresowe' },
  { title: 'Tarasy drewniane', value: 'tarasy-drewniane' },
  { title: 'Elewacje kompozytowe', value: 'elewacje-kompozytowe' },
  { title: 'Schody modułowe', value: 'schody-modulowe' },
] as const;

export const project = defineType({
  name: 'project',
  title: 'Realizacja',
  type: 'document',
  icon: ImageIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Nazwa realizacji, np. „Nowoczesny taras z zadaszeniem”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'city',
      title: 'Miasto',
      description: 'Sama nazwa miasta — bez ulicy i pełnego adresu, np. „Katowice”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      description: 'Kategoria oferty, do której należy realizacja.',
      type: 'string',
      options: {
        list: [...PROJECT_CATEGORIES],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'coverImage',
      title: 'Zdjęcie główne',
      description: 'Główne zdjęcie pokazywane w siatce i w powiększeniu (lightbox).',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Ważny dla dostępności i SEO.',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'surface',
      title: 'Powierzchnia (m²)',
      description: 'Powierzchnia realizacji w metrach kwadratowych, np. 42. Pole opcjonalne.',
      type: 'number',
      validation: (rule) => rule.positive(),
    }),
    defineField({
      name: 'isFeatured',
      title: 'Wyróżniona na stronie głównej',
      description: 'Gdy zaznaczone, realizacja pojawia się w sekcji „Wybrane projekty” na stronie głównej.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'title', city: 'city', category: 'category', media: 'coverImage' },
    prepare({ title, city, category, media }) {
      const label = PROJECT_CATEGORIES.find((c) => c.value === category)?.title;
      const subtitle = [city, label].filter(Boolean).join(' · ');
      return { title: title || 'Realizacja', subtitle, media };
    },
  },
});
