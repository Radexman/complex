import { BarChartIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/** Allowed icon identifiers — mapped to Lucide icons in the frontend component. */
export const TRUST_STAT_ICONS = [
  { title: 'Tarcza (jakość / gwarancja)', value: 'shield' },
  { title: 'Zegar (doświadczenie)', value: 'clock' },
  { title: 'Nagroda (zadowolenie klientów)', value: 'award' },
  { title: 'Ludzie (zespół)', value: 'users' },
  { title: 'Gwiazda (oceny)', value: 'star' },
  { title: 'Znacznik (certyfikaty)', value: 'check' },
  { title: 'Narzędzie (rzemiosło)', value: 'tool' },
  { title: 'Pinezka (region)', value: 'map' },
] as const;

export const trustStat = defineType({
  name: 'trustStat',
  title: 'Karta statystyki',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Ikona',
      description: 'Ikona wyświetlana na górze karty.',
      type: 'string',
      options: {
        list: [...TRUST_STAT_ICONS],
        layout: 'dropdown',
      },
      initialValue: 'shield',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Wartość',
      description: 'Duża liczba lub tekst, np. "1200+", "15", "98%".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Pogrubiona etykieta pod wartością.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Mniejszy, przygaszony tekst pod etykietą.',
      type: 'string',
    }),
  ],
  preview: {
    select: { title: 'value', subtitle: 'label' },
  },
});
