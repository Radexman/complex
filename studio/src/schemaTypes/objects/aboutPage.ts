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
    { name: 'cta', title: 'CTA' },
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
        'Specjalizujemy się w kompleksowym wykonaniu zadaszeń tarasowych oraz tarasów. Realizacje wykonujemy na wybranych obszarach województwa opolskiego i śląskiego.',
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
      description:
        'Zdjęcie zespołu, warsztatu lub gotowej realizacji. Kadr pionowy wygląda najlepiej.',
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

    // ── CTA ─────────────────────────────────────────────────────────────────
    defineField({
      name: 'cta',
      title: 'Sekcja CTA',
      description:
        'Blok zamykający na dole strony ("Masz pytania?"). Numer telefonu pochodzi ze stopki — nie duplikuj go tutaj.',
      type: 'object',
      group: 'cta',
      fields: [
        defineField({
          name: 'eyebrow',
          title: 'Brew',
          type: 'string',
          initialValue: 'Zacznijmy współpracę',
        }),
        defineField({
          name: 'headline',
          title: 'Nagłówek',
          type: 'string',
          initialValue: 'Masz pytania lub chcesz poznać naszą ofertę?',
        }),
        defineField({
          name: 'description',
          title: 'Opis',
          type: 'text',
          rows: 2,
          initialValue:
            'Skontaktuj się z nami — odpowiadamy w ciągu 3 dni roboczych i umawiamy bezpłatną wizytę pomiarową.',
        }),
        defineField({
          name: 'primaryCtaLabel',
          title: 'Przycisk główny — etykieta',
          type: 'string',
          initialValue: 'Skontaktuj się',
        }),
        defineField({
          name: 'primaryCtaHref',
          title: 'Przycisk główny — link',
          description: 'Kontakt to okno modalne otwierane z dowolnej strony, stąd kotwica.',
          type: 'string',
          initialValue: '/#kontakt',
        }),
        defineField({
          name: 'secondaryCtaLabel',
          title: 'Przycisk drugi — etykieta',
          type: 'string',
          initialValue: 'Formularz wyceny',
        }),
        defineField({
          name: 'secondaryCtaHref',
          title: 'Przycisk drugi — link',
          type: 'string',
          initialValue: '/wycena',
        }),
      ],
    }),
  ],
  preview: {
    select: { subtitle: 'heroHeadline' },
    prepare({ subtitle }) {
      return { title: 'Strona O nas', subtitle };
    },
  },
});
