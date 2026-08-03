import { CreditCardIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * One VAT rate card in the „Korzyść podatkowa" highlight. Embedded in the
 * `vatHighlightSection` singleton.
 */
export const vatRate = defineType({
  name: 'vatRate',
  title: 'Stawka VAT',
  type: 'object',
  icon: CreditCardIcon,
  fields: [
    defineField({
      name: 'rate',
      title: 'Stawka',
      description: 'Sama stawka, np. „8%”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Wariant',
      description: 'Czego dotyczy ta stawka, np. „Materiał po naszej stronie”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'isAdvantage',
      title: 'Wariant korzystny',
      description: 'Zaznacz na karcie z niższą stawką — zostanie wyróżniona kolorem akcentu.',
      type: 'boolean',
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: 'rate', subtitle: 'label' },
  },
});
