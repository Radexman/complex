import { TrendUpwardIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * One statistic under the story image on „O nas". Embedded in the `aboutPage` singleton.
 */
export const aboutStat = defineType({
  name: 'aboutStat',
  title: 'Statystyka',
  type: 'object',
  icon: TrendUpwardIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Wartość',
      description: 'Wyróżniona liczba lub krótkie hasło, np. „1200+” albo „Śląsk i Opolszczyzna”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Opis pod wartością, np. „Zrealizowanych projektów”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
  },
});
