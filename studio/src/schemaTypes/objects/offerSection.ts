import { ThLargeIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const offerSection = defineType({
  name: 'offerSection',
  title: 'Sekcja Oferta',
  type: 'object',
  icon: ThLargeIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Nasza oferta',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek sekcji.',
      type: 'string',
      initialValue: 'Premium systemy zadaszeń tarasowych',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Odkryj kolekcję naszych architektonicznych realizacji, zaprojektowanych tak, aby przekształcić Twoją przestrzeń na świeżym powietrzu w luksusową strefę relaksu.',
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Link do oferty — etykieta',
      type: 'string',
      initialValue: 'Poznaj całą ofertę',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaHref',
      title: 'Link do oferty — odnośnik',
      type: 'string',
      initialValue: '/oferta',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cards',
      title: 'Karty oferty',
      description:
        'Karty w układzie bento. Zalecane 5 (jedna wyróżniona + cztery mniejsze), maksymalnie 6.',
      type: 'array',
      of: [defineArrayMember({ type: 'offerCard' })],
      validation: (rule) => rule.min(1).max(6),
      initialValue: [
        {
          title: 'Tarasy kompozytowe',
          description:
            'Tarasy Kompozytowe są świetnym rozwiązaniem na swobodne odprężenie na łonie natury',
          icon: 'layers',
          featured: true,
          badges: ['Powłoka proszkowa', '10 lat gwarancji', 'Wymiary na zamówienie'],
          offerSlug: 'zadaszenia-aluminiowe',
        },
        {
          title: 'Tarasy z płyt gresowych',
          description:
            'Tarasy z płyt gresowych są jednym z najbardziej wytrzymałych rozwiązań w zakresie konstrukcji ogrodowych',
          icon: 'sliders-horizontal',
        },
        {
          title: 'Tarasy drewniane',
          description: 'Tarasy drewniane, jeśli stawiasz na naturalne rozwiązania',
          icon: 'sparkles',
        },
        {
          title: 'Zadaszenia aluminiowe',
          description: 'Zadaszenia aluminiowe na taras - trwałe, stabilne i praktyczne!',
          icon: 'sun',
        },
        {
          title: 'Żaluzje tarasowe',
          description: 'Żaluzje tarasowe - idealne do osłony tarasu',
          icon: 'wind',
        },
        {
          title: 'Schody modułowe',
          description: 'Schody modułowe z profesjonalnym montażem – szybka realizacja.',
          icon: 'wind',
        },
        {
          title: 'Elewacje kompozytowe',
          description: 'Elewacje kompozytowe Legro Natural, to wyjątkowe okładziny',
          icon: 'wind',
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare({ title }) {
      return { title: title || 'Sekcja Oferta', subtitle: 'Oferta' };
    },
  },
});
