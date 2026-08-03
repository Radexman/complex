import { DocumentsIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * „Wycena” chooser page (/wycena) — where the „Darmowa wycena” CTA lands. Lets
 * the visitor pick which quotation form to fill in. A fixed-id singleton
 * (see structure/index.ts), mirroring the ofertaPage/tarasyPage precedent.
 *
 * Card order drives the bento layout: the first card is the large hero tile, so
 * reordering the array is how the client changes which form is promoted.
 */
export const wycenaPage = defineType({
  name: 'wycenaPage',
  title: 'Strona Wycena',
  type: 'document',
  icon: DocumentsIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      type: 'string',
      initialValue: 'Bezpłatna wycena',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      type: 'string',
      initialValue: 'Wybierz formularz wyceny',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      type: 'text',
      rows: 3,
      initialValue:
        'Wypełnienie formularza zajmuje kilka minut i do niczego nie zobowiązuje. Wybierz produkt, którego dotyczy Twoje zapytanie — dzięki temu od razu zapytamy o właściwe szczegóły.',
    }),
    defineField({
      name: 'forms',
      title: 'Formularze',
      description:
        'Kolejność decyduje o układzie kafelków — pierwsza karta jest największa.',
      type: 'array',
      of: [defineArrayMember({ type: 'wycenaFormCard' })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Strona Wycena', subtitle };
    },
  },
});
