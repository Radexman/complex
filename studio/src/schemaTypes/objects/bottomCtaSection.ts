import { RocketIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Bottom lead-generation CTA + showroom/map block on the home page. A fixed-id
 * singleton (see structure/index.ts). The map coordinates and Google Maps
 * directions URL are hardcoded in the frontend component, not managed here.
 */
export const bottomCtaSection = defineType({
  name: 'bottomCtaSection',
  title: 'Sekcja CTA / Salon',
  type: 'document',
  icon: RocketIcon,
  groups: [
    { name: 'cta', title: 'Blok CTA', default: true },
    { name: 'showroom', title: 'Blok kontaktu / salonu' },
  ],
  fields: [
    defineField({
      name: 'backgroundImage',
      title: 'Zdjęcie tła',
      description: 'Pełnoekranowe zdjęcie tła bloku CTA.',
      type: 'image',
      group: 'cta',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta (pigułka) nad nagłówkiem.',
      type: 'string',
      group: 'cta',
      initialValue: 'Bezpłatna konsultacja',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek bloku CTA.',
      type: 'string',
      group: 'cta',
      initialValue: 'Zaprojektuj swoją przestrzeń na zewnątrz',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'headlineAccent',
      title: 'Wyróżniony fragment nagłówka',
      description:
        'Fragment nagłówka renderowany w kolorze akcentu. Musi być dokładnym fragmentem nagłówka.',
      type: 'string',
      group: 'cta',
      initialValue: 'na zewnątrz',
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      group: 'cta',
      initialValue:
        'Przekształć swój dom dzięki pergoli zaprojektowanej na miarę — łączącej elegancję architektoniczną z precyzją wykonania. Odwiedź nasze biuro i obejrzyj próbniki materiałów na żywo.',
    }),
    defineField({
      name: 'primaryCtaLabel',
      title: 'Etykieta przycisku głównego',
      type: 'string',
      group: 'cta',
      initialValue: 'Zobacz nasze realizacje',
    }),
    defineField({
      name: 'primaryCtaHref',
      title: 'Link przycisku głównego',
      type: 'string',
      group: 'cta',
      initialValue: '/realizacje',
    }),
    defineField({
      name: 'secondaryCtaLabel',
      title: 'Etykieta przycisku dodatkowego',
      type: 'string',
      group: 'cta',
      initialValue: 'Darmowa wycena',
    }),
    defineField({
      name: 'secondaryCtaHref',
      title: 'Link przycisku dodatkowego',
      type: 'string',
      group: 'cta',
      initialValue: '/wycena/zadaszenie',
    }),
    defineField({
      name: 'bullets',
      title: 'Punkty zapewnienia',
      description: 'Krótkie punkty wyświetlane pod przyciskami.',
      type: 'array',
      of: [{ type: 'string' }],
      group: 'cta',
      initialValue: ['Bez zobowiązań', 'Odpowiedź w ciągu 24h', 'Bezpłatna wizyta na miejscu'],
    }),
    defineField({
      name: 'contactEyebrow',
      title: 'Brew bloku kontaktu',
      description: 'Mała etykieta nad nagłówkiem bloku kontaktu (np. „Kontakt bezpośredni”).',
      type: 'string',
      group: 'showroom',
      initialValue: 'Kontakt bezpośredni',
    }),
    defineField({
      name: 'contactNote',
      title: 'Notatka o preferowanym kontakcie',
      description:
        'Krótkie zdanie informujące, że telefon i e-mail to preferowane formy kontaktu.',
      type: 'text',
      rows: 2,
      group: 'showroom',
      initialValue:
        'Najszybciej skontaktujesz się z nami telefonicznie lub mailowo — to nasze preferowane formy kontaktu.',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Telefon',
      description: 'Numer telefonu wyświetlany jako przycisk (link tel:).',
      type: 'string',
      group: 'showroom',
      initialValue: '+48 661 242 507',
    }),
    defineField({
      name: 'contactEmail',
      title: 'E-mail',
      description: 'Adres e-mail wyświetlany jako przycisk (link mailto:).',
      type: 'string',
      group: 'showroom',
      initialValue: 'biuro@ccomplex.pl',
    }),
    defineField({
      name: 'showroomLabel',
      title: 'Nagłówek salonu',
      description: 'Nagłówek nad mapą.',
      type: 'string',
      group: 'showroom',
      initialValue: 'Odwiedź nasze biuro i salon wystawowy',
    }),
    defineField({
      name: 'showroomDescription',
      title: 'Opis salonu',
      type: 'text',
      rows: 2,
      group: 'showroom',
      initialValue:
        'Zapraszamy do obejrzenia próbników materiałów, gotowych rozwiązań i rozmowy z naszym doradcą.',
    }),
    defineField({
      name: 'showroomAddress',
      title: 'Adres salonu',
      description: 'Adres wyświetlany w dymku na mapie.',
      type: 'string',
      group: 'showroom',
      initialValue: 'Kępska 12, 46-020 Opole',
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Sekcja CTA / Salon', subtitle };
    },
  },
});
