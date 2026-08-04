import { UsersIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * All copy for the standalone „O nas" page (`/o-nas`). A fixed-id singleton (see
 * structure/index.ts) — distinct from `aboutSection`, which is the shorter home-page teaser.
 * The process steps on this page come from the shared `processTimeline` singleton.
 */
export const aboutPage = defineType({
  name: 'aboutPage',
  title: 'Strona O nas',
  type: 'document',
  icon: UsersIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'story', title: 'Historia' },
    { name: 'values', title: 'Wartości' },
  ],
  fields: [
    // ── Hero ────────────────────────────────────────────────────────────────
    defineField({
      name: 'heroHeadline',
      title: 'Nagłówek',
      description: 'Główny nagłówek strony.',
      type: 'string',
      group: 'hero',
      initialValue: 'O nas',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'heroSubheadline',
      title: 'Podtytuł',
      description: 'Krótki tekst po prawej stronie nagłówka.',
      type: 'text',
      rows: 3,
      group: 'hero',
      initialValue:
        'Firma Complex sp. z o.o. z siedzibą w Opolu — specjaliści w dziedzinie zadaszeń aluminiowych, tarasów i schodów modułowych.',
    }),

    // ── Story ───────────────────────────────────────────────────────────────
    defineField({
      name: 'storyEyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem sekcji (wersaliki).',
      type: 'string',
      group: 'story',
      initialValue: 'Nasza historia',
    }),
    defineField({
      name: 'storyHeadline',
      title: 'Nagłówek sekcji',
      type: 'string',
      group: 'story',
      initialValue: 'Budujemy przestrzenie, które zostają na lata',
    }),
    defineField({
      name: 'storyBody',
      title: 'Treść',
      description:
        'Opis firmy. Oddziel akapity pustą linią (naciśnij Enter dwa razy) — każdy blok tekstu zostanie wyświetlony jako osobny akapit.',
      type: 'text',
      rows: 12,
      group: 'story',
    }),
    defineField({
      name: 'storyImage',
      title: 'Zdjęcie',
      description: 'Zdjęcie zespołu, warsztatu lub gotowej realizacji. Kadr pionowy wygląda najlepiej.',
      type: 'image',
      options: { hotspot: true },
      group: 'story',
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Krótki opis zdjęcia dla czytników ekranu i SEO.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'storyStats',
      title: 'Statystyki',
      description: 'Liczby pod zdjęciem. Maksymalnie 3 — więcej nie zmieści się w jednym rzędzie.',
      type: 'array',
      group: 'story',
      of: [defineArrayMember({ type: 'aboutStat' })],
      validation: (rule) => rule.max(3),
    }),

    // ── Values ──────────────────────────────────────────────────────────────
    defineField({
      name: 'valuesEyebrow',
      title: 'Brew',
      type: 'string',
      group: 'values',
      initialValue: 'Nasze wartości',
    }),
    defineField({
      name: 'valuesHeadline',
      title: 'Nagłówek sekcji',
      type: 'string',
      group: 'values',
      initialValue: 'Co nas wyróżnia',
    }),
    defineField({
      name: 'values',
      title: 'Wartości',
      description: 'Karty w siatce. Najlepiej wygląda 3 lub 6 kart (pełne rzędy).',
      type: 'array',
      group: 'values',
      of: [defineArrayMember({ type: 'aboutValue' })],
      validation: (rule) => rule.max(6),
    }),

  ],
  preview: {
    select: { subtitle: 'heroHeadline' },
    prepare({ subtitle }) {
      return { title: 'Strona O nas', subtitle };
    },
  },
});
