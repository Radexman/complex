import { TransferIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * „Przed i po" section on the home page — a slider revealing an after photo over
 * a before photo. A fixed-id singleton (see structure/index.ts).
 *
 * `items` is an array even though the client asked for a single pair: with one
 * item the project picker hides itself, and adding a second one later needs no
 * schema change.
 */
export const beforeAfterSection = defineType({
  name: 'beforeAfterSection',
  title: 'Sekcja Przed i po',
  type: 'document',
  icon: TransferIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem.',
      type: 'string',
      initialValue: 'Metamorfozy',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      type: 'string',
      initialValue: 'Przed i po',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      type: 'text',
      rows: 3,
      initialValue:
        'Przesuń suwak, aby zobaczyć, jak zmieniają się przestrzenie naszych klientów. Po lewej stan przed realizacją, po prawej efekt końcowy.',
    }),
    defineField({
      name: 'items',
      title: 'Realizacje',
      description: 'Każda pozycja to jedna para zdjęć: przed i po.',
      type: 'array',
      of: [defineArrayMember({ type: 'beforeAfterItem' })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Sekcja Przed i po', subtitle };
    },
  },
});
