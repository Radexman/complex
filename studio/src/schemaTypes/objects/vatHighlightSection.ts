import { CreditCardIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * „Korzyść podatkowa" highlight — the reduced VAT rate that applies when the
 * company supplies the materials, versus the standard rate the customer pays
 * buying them alone. A fixed-id singleton (see structure/index.ts), rendered on
 * the home page and on every offer page.
 *
 * The reduced rate is conditional in law, which is what `footnote` is for —
 * keep the hedge in the copy.
 */
export const vatHighlightSection = defineType({
  name: 'vatHighlightSection',
  title: 'Sekcja VAT',
  type: 'document',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      type: 'string',
      initialValue: 'Korzyść podatkowa',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      type: 'string',
      initialValue: 'Kupujemy materiał za Ciebie — płacisz niższy VAT',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'text',
      rows: 3,
      initialValue:
        'Gdy materiał kupujesz samodzielnie, płacisz za niego pełną stawkę VAT. Gdy zamawiasz u nas całą realizację razem z materiałem, do rozliczenia wchodzi obniżona stawka — a różnica zostaje w Twoim budżecie.',
    }),
    defineField({
      name: 'rates',
      title: 'Stawki',
      description: 'Dwie karty: wariant z materiałem po naszej stronie i wariant samodzielny.',
      type: 'array',
      of: [defineArrayMember({ type: 'vatRate' })],
      validation: (rule) => rule.length(2),
      initialValue: [
        {
          rate: '8%',
          label: 'Materiał kupujemy my',
          description:
            'Zamawiasz u nas usługę razem z materiałem — całość rozliczamy jedną, obniżoną stawką.',
          isAdvantage: true,
        },
        {
          rate: '23%',
          label: 'Materiał kupujesz sam',
          description:
            'Kupując materiał na własną rękę, płacisz za niego podstawową stawkę VAT, niezależnie od tego, kto wykona montaż.',
          isAdvantage: false,
        },
      ],
    }),
    defineField({
      name: 'footnote',
      title: 'Zastrzeżenie',
      description:
        'Obniżona stawka nie obowiązuje bezwarunkowo — to pole musi zawierać zastrzeżenie. Treść do potwierdzenia z księgowością.',
      type: 'text',
      rows: 3,
      initialValue:
        'Obniżona stawka VAT dotyczy robót w obiektach budownictwa objętego społecznym programem mieszkaniowym i wymaga spełnienia warunków ustawowych. Ostateczną stawkę potwierdzamy indywidualnie na etapie wyceny.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Etykieta przycisku',
      description: 'Opcjonalny przycisk pod kartami. Zostaw puste, aby go ukryć.',
      type: 'string',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Link przycisku',
      type: 'string',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Sekcja VAT', subtitle };
    },
  },
});
