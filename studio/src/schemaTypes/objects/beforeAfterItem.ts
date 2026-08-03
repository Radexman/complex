import { TransferIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * One before/after pair shown in the „Przed i po" section. Embedded in the
 * `beforeAfterSection` singleton.
 */
export const beforeAfterItem = defineType({
  name: 'beforeAfterItem',
  title: 'Realizacja przed i po',
  type: 'object',
  icon: TransferIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Nazwa realizacji, np. „Zadaszenie tarasowe”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'location',
      title: 'Lokalizacja',
      description: 'Miejscowość, np. „Opole”.',
      type: 'string',
    }),
    defineField({
      name: 'beforeImage',
      title: 'Zdjęcie „przed”',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'afterImage',
      title: 'Zdjęcie „po”',
      type: 'image',
      options: { hotspot: true },
      validation: (rule) => rule.required(),
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          type: 'string',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'location', media: 'afterImage' },
  },
});
