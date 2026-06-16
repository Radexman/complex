import { BlockElementIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const OFFER_ICONS = [
  { title: 'Warstwy', value: 'layers' },
  { title: 'Suwaki (regulacja)', value: 'sliders-horizontal' },
  { title: 'Iskry (premium)', value: 'sparkles' },
  { title: 'Słońce (smart / oświetlenie)', value: 'sun' },
  { title: 'Wiatr (bioklimat / wentylacja)', value: 'wind' },
  { title: 'Tarcza (gwarancja)', value: 'shield' },
  { title: 'Dom', value: 'house' },
  { title: 'Konstrukcja', value: 'boxes' },
] as const;

/** Available offer pages — values are slugs; the frontend builds /oferta/<slug>. */
export const OFFER_SLUGS = [
  { title: 'Zadaszenia aluminiowe', value: 'zadaszenia-aluminiowe' },
  { title: 'Żaluzje tarasowe', value: 'zaluzje-tarasowe' },
  { title: 'Tarasy kompozytowe', value: 'tarasy-kompozytowe' },
  { title: 'Tarasy z płyt gresowych', value: 'tarasy-gresowe' },
  { title: 'Tarasy drewniane', value: 'tarasy-drewniane' },
  { title: 'Elewacje kompozytowe', value: 'elewacje-kompozytowe' },
  { title: 'Schody modułowe', value: 'schody-modulowe' },
] as const;

export const offerCard = defineType({
  name: 'offerCard',
  title: 'Karta oferty',
  type: 'object',
  icon: BlockElementIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Nazwa konkretnej oferty, np. „Pergole aluminiowe”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Krótki opis oferty (2–3 zdania).',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'image',
      title: 'Zdjęcie tła',
      description: 'Zdjęcie wypełniające tło karty.',
      type: 'image',
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
      name: 'icon',
      title: 'Ikona',
      description: 'Opcjonalna ikona wyświetlana w rogu karty. Pozostaw puste, aby ukryć.',
      type: 'string',
      options: {
        list: [...OFFER_ICONS],
        layout: 'dropdown',
      },
    }),
    defineField({
      name: 'featured',
      title: 'Wyróżniona',
      description:
        'Wyróżnia kartę jako dużą, główną w układzie bento (oznaczona etykietą „Wyróżnione”). Zalecana jedna na sekcję.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'badges',
      title: 'Odznaki',
      description:
        'Opcjonalne, krótkie etykiety wyświetlane na dole karty, np. „Powłoka proszkowa”, „10 lat gwarancji”.',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      validation: (rule) => rule.max(4),
    }),
    defineField({
      name: 'offerSlug',
      title: 'Oferta (odnośnik)',
      description: 'Strona oferty, do której prowadzi karta.',
      type: 'string',
      options: {
        list: [...OFFER_SLUGS],
        layout: 'dropdown',
      },
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description', media: 'image', featured: 'featured' },
    prepare({ title, subtitle, media, featured }) {
      return {
        title: title || 'Karta oferty',
        subtitle: featured ? '★ Wyróżniona' : subtitle,
        media,
      };
    },
  },
});
