import { DocumentsIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/** The four quotation forms a card can point at. */
export const WYCENA_FORM_SLUGS = ['taras', 'zadaszenie', 'zaluzje', 'schody'] as const;

/**
 * One quotation-form card on the „Wycena” chooser page. Embedded in the
 * `wycenaPage` singleton; the array order decides the bento layout, so the first
 * card is the large hero tile.
 */
export const wycenaFormCard = defineType({
  name: 'wycenaFormCard',
  title: 'Karta formularza',
  type: 'object',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'formSlug',
      title: 'Formularz',
      description: 'Do którego formularza prowadzi karta (adres /wycena/…).',
      type: 'string',
      options: { list: [...WYCENA_FORM_SLUGS] },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Tytuł',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'badge',
      title: 'Etykieta',
      description: 'Opcjonalna plakietka, np. „Najczęściej wybierany”.',
      type: 'string',
    }),
    defineField({
      name: 'image',
      title: 'Zdjęcie',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          type: 'string',
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'formSlug', media: 'image' },
  },
});
