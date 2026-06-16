import { StarIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const heroSection = defineType({
  name: 'heroSection',
  title: 'Sekcja Hero',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Zdjęcie tła',
      description: 'Pełnoekranowe zdjęcie w tle sekcji hero.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Ważne dla dostępności i SEO.',
          type: 'string',
        }),
      ],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek (zawiera frazę z pola "Wyróżniona fraza").',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineAccent',
      title: 'Wyróżniona fraza',
      description:
        'Fragment nagłówka renderowany w kolorze akcentu (zieleń). Musi dokładnie występować w polu "Nagłówek".',
      type: 'string',
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Przycisk główny — etykieta',
      type: 'string',
      initialValue: 'Nasze realizacje',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'Przycisk główny — odnośnik',
      type: 'string',
      initialValue: '/realizacje',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Przycisk drugorzędny — etykieta',
      type: 'string',
      initialValue: 'Darmowa wycena',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'Przycisk drugorzędny — odnośnik',
      type: 'string',
      initialValue: '/wycena/zadaszenie',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'stats',
      title: 'Statystyki',
      description: 'Rząd kart statystyk na dole sekcji (zalecane 4).',
      type: 'array',
      of: [defineArrayMember({ type: 'heroStat' })],
      initialValue: [
        { value: '1200+', label: 'Realizacji' },
        { value: '15', label: 'Lat doświadczenia' },
        { value: '98%', label: 'Zadowolonych klientów' },
        { value: '50+', label: 'Opcji projektowych' },
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    select: { title: 'headline', media: 'backgroundImage' },
    prepare({ title, media }) {
      return { title: title || 'Sekcja Hero', subtitle: 'Hero', media };
    },
  },
});
