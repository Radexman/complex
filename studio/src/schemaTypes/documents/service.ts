import { TagIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

import { PROJECT_CATEGORIES } from './project';

export const RELATED_FORM_SLUGS = [
  { title: 'Formularz Wyceny Zadaszenia', value: 'zadaszenie' },
  { title: 'Formularz Wyceny Żaluzji', value: 'zaluzje' },
  { title: 'Formularz Wyceny Tarasu', value: 'taras' },
  { title: 'Formularz Wyceny Schodów', value: 'schody' },
] as const;

// Icon identifiers for benefit cards — resolved to Lucide icons in
// OfferBenefits.tsx (same options.list lookup pattern as trustStat).
export const BENEFIT_ICONS = [
  { title: 'Tarcza (ochrona / trwałość)', value: 'shield' },
  { title: 'Zegar (czas)', value: 'clock' },
  { title: 'Nagroda (jakość)', value: 'award' },
  { title: 'Klienci', value: 'users' },
  { title: 'Gwiazda', value: 'star' },
  { title: 'Znacznik (gwarancja)', value: 'check' },
  { title: 'Narzędzie (montaż)', value: 'tool' },
  { title: 'Mapa (lokalizacja)', value: 'map' },
  { title: 'Słońce', value: 'sun' },
  { title: 'Krople (wilgoć)', value: 'droplets' },
  { title: 'Linijka (wymiary)', value: 'ruler' },
  { title: 'Błyskawica (szybkość)', value: 'zap' },
] as const;

export const service = defineType({
  name: 'service',
  title: 'Oferta (podstrona)',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'benefits', title: 'Zalety' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Nazwa oferty, np. „Zadaszenia aluminiowe”. Używana w tytule strony i menu.',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Adres URL (slug)',
      description: 'Generowany z tytułu. Tworzy adres strony /oferta/<slug>.',
      type: 'slug',
      group: 'hero',
      options: { source: 'title', maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'seoDescription',
      title: 'Opis SEO',
      description: 'Opis meta strony (wyświetlany w wynikach wyszukiwania).',
      type: 'text',
      rows: 3,
      group: 'hero',
    }),
    defineField({
      name: 'heroImage',
      title: 'Zdjęcie hero',
      description: 'Główne, pełnoekranowe zdjęcie w sekcji hero.',
      type: 'image',
      group: 'hero',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Ważny dla dostępności i SEO.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'heroHeadline',
      title: 'Nagłówek hero',
      description: 'Główny nagłówek wyświetlany w sekcji hero.',
      type: 'string',
      group: 'hero',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Podtytuł hero',
      description: 'Jedno lub dwa zdania pod nagłówkiem.',
      type: 'text',
      rows: 2,
      group: 'hero',
    }),
    defineField({
      name: 'relatedFormSlug',
      title: 'Powiązany formularz wyceny',
      description:
        'Formularz, do którego prowadzi przycisk CTA. Pozostaw puste, gdy oferta nie ma formularza (np. Elewacje kompozytowe).',
      type: 'string',
      group: 'hero',
      options: {
        list: [...RELATED_FORM_SLUGS],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'category',
      title: 'Kategoria',
      description:
        'Kategoria oferty. Musi odpowiadać kategorii realizacji, aby galeria pokazywała pasujące projekty.',
      type: 'string',
      group: 'hero',
      options: {
        list: [...PROJECT_CATEGORIES],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'benefitsEyebrow',
      title: 'Etykieta sekcji zalet',
      description: 'Mały tekst nad nagłówkiem. Domyślnie „Zalety produktu”.',
      type: 'string',
      group: 'benefits',
      initialValue: 'Zalety produktu',
    }),
    defineField({
      name: 'benefitsHeadline',
      title: 'Nagłówek sekcji zalet',
      description: 'Np. „Dlaczego warto wybrać zadaszenie aluminiowe?”.',
      type: 'string',
      group: 'benefits',
    }),
    defineField({
      name: 'benefitsDescription',
      title: 'Opis sekcji zalet',
      description: 'Krótki akapit (2–3 zdania) pod nagłówkiem.',
      type: 'text',
      rows: 3,
      group: 'benefits',
    }),
    defineField({
      name: 'benefits',
      title: 'Zalety',
      description: 'Od 2 do 6 kart z ikoną, tytułem i krótkim opisem.',
      type: 'array',
      group: 'benefits',
      validation: (rule) => rule.min(2).max(6),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'benefit',
          fields: [
            defineField({
              name: 'icon',
              title: 'Ikona',
              type: 'string',
              options: { list: [...BENEFIT_ICONS], layout: 'dropdown' },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Tytuł',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'description',
              title: 'Opis',
              type: 'string',
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current', media: 'heroImage' },
    prepare({ title, slug, media }) {
      return {
        title: title || 'Oferta',
        subtitle: slug ? `/oferta/${slug}` : undefined,
        media,
      };
    },
  },
});
