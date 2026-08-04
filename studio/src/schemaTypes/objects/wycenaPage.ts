import { DocumentsIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * „Wycena” chooser page (/wycena) — where the „Darmowa wycena” CTA lands. Lets
 * the visitor pick which quotation form to fill in. A fixed-id singleton
 * (see structure/index.ts), mirroring the ofertaPage/tarasyPage precedent.
 *
 * The forms render as identical full-width stripes, in array order — reordering
 * the array is how the client changes which form is listed first.
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
      description: 'Kolejność na liście — pierwszy formularz wyświetla się na górze.',
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
