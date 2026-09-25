import { HelpCircleIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * The standalone FAQ page at `/faq`. A fixed-id singleton (see structure/index.ts), rendered as
 * an Ark UI accordion grouped by category — same pattern as `OfferBrands`.
 */
export const faqPage = defineType({
  name: 'faqPage',
  title: 'Strona FAQ',
  type: 'document',
  icon: HelpCircleIcon,
  groups: [
    { name: 'content', title: 'Treść', default: true },
    { name: 'seo', title: 'SEO' },
  ],
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      type: 'string',
      group: 'content',
      initialValue: 'Pytania i odpowiedzi',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      type: 'string',
      group: 'content',
      initialValue: 'Najczęściej zadawane pytania',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      type: 'text',
      rows: 2,
      group: 'content',
      initialValue: 'Znajdź odpowiedź na swoje pytanie lub skontaktuj się z nami bezpośrednio.',
    }),
    defineField({
      name: 'categories',
      title: 'Kategorie pytań',
      description: 'Kolejność na liście = kolejność na stronie.',
      type: 'array',
      group: 'content',
      of: [defineArrayMember({ type: 'faqCategory' })],
    }),
    defineField({
      name: 'seoTitle',
      title: 'SEO — tytuł strony',
      type: 'string',
      group: 'seo',
      initialValue: 'FAQ — Najczęstsze pytania',
    }),
    defineField({
      name: 'seoDescription',
      title: 'SEO — opis strony',
      type: 'text',
      rows: 3,
      group: 'seo',
      initialValue:
        'Odpowiedzi na najczęściej zadawane pytania dotyczące zadaszeń tarasowych, tarasów kompozytowych, gresowych, drewnianych oraz akcesoriów.',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }: { subtitle?: string }) {
      return { title: 'Strona FAQ', subtitle };
    },
  },
});
