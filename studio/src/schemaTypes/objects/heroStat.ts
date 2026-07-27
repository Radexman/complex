import { BarChartIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const heroStat = defineType({
  name: 'heroStat',
  title: 'Statystyka',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Wartość',
      description:
        'Opcjonalna duża liczba lub tekst, np. "1200+", "15", "98%". Zostaw puste, aby ukryć liczbę i pokazać samą etykietę.',
      type: 'string',
    }),
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Np. "Realizacji", "Lat doświadczenia".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
  },
});
