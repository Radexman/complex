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

// Icon identifiers for technical-spec cards — the benefit icons plus a few
// extras. Resolved to Lucide icons in OfferTechSpecs.tsx (same lookup pattern).
export const TECH_SPEC_ICONS = [
  ...BENEFIT_ICONS,
  { title: 'Dom (realizacje)', value: 'home' },
  { title: 'Euro (cena / VAT)', value: 'euro' },
  { title: 'Dokument (umowa / gwarancja)', value: 'file' },
  { title: 'Telefon (kontakt)', value: 'phone' },
] as const;

export const service = defineType({
  name: 'service',
  title: 'Oferta (podstrona)',
  type: 'document',
  icon: TagIcon,
  groups: [
    { name: 'hero', title: 'Hero', default: true },
    { name: 'benefits', title: 'Zalety' },
    { name: 'gallery', title: 'Galeria' },
    { name: 'brands', title: 'Producenci' },
    { name: 'techSpecs', title: 'Specyfikacja' },
    { name: 'formCta', title: 'CTA formularza' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Nazwa oferty, np. „Zadaszenia tarasowe”. Używana w tytule strony i menu.',
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
      name: 'order',
      title: 'Kolejność',
      description:
        'Kolejność wyświetlania na stronie „Oferta” (/oferta) — od najmniejszej liczby. Zmień numer, aby przestawić kafelek.',
      type: 'number',
      group: 'hero',
      initialValue: 99,
      validation: (rule) => rule.integer().positive(),
    }),
    defineField({
      name: 'isNew',
      title: 'Nowość',
      description:
        'Zaznacz, aby na stronie „Oferta” (/oferta) kafelek dostał zieloną etykietę „Nowość”. Odznacz, gdy oferta przestanie być nowa.',
      type: 'boolean',
      group: 'hero',
      initialValue: false,
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
      description: 'Formularz, do którego prowadzi przycisk CTA. Pozostaw puste, gdy oferta nie ma formularza.',
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
            defineField({
              name: 'linkText',
              title: 'Tekst linku',
              description:
                'Opcjonalny fragment tekstu w opisie, który ma być wyświetlony jako link, np. „goliatgres.pl”.',
              type: 'string',
              hidden: ({ parent }) => !parent?.description,
            }),
            defineField({
              name: 'linkUrl',
              title: 'Adres linku',
              description: 'Docelowy adres URL dla tekstu linku powyżej.',
              type: 'url',
              validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
              hidden: ({ parent }) => !parent?.description,
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        }),
      ],
    }),
    defineField({
      name: 'galleryFooterText',
      title: 'Tekst pod galerią',
      description: 'Opcjonalny krótki tekst wyświetlany pod galerią zdjęć, np. odnośnik do Facebooka.',
      type: 'text',
      rows: 2,
      group: 'gallery',
    }),
    defineField({
      name: 'galleryFacebookUrl',
      title: 'Link do Facebooka',
      description: 'Opcjonalny adres profilu/posta na Facebooku — wyświetlany jako link obok tekstu powyżej.',
      type: 'url',
      group: 'gallery',
    }),
    defineField({
      name: 'brandsEyebrow',
      title: 'Etykieta sekcji producentów',
      description: 'Mały tekst nad nagłówkiem. Domyślnie „Producenci i systemy”.',
      type: 'string',
      group: 'brands',
      initialValue: 'Producenci i systemy',
    }),
    defineField({
      name: 'brandsHeadline',
      title: 'Nagłówek sekcji producentów',
      description: 'Np. „Dostępne systemy i producenci”.',
      type: 'string',
      group: 'brands',
      initialValue: 'Dostępne systemy i producenci',
    }),
    defineField({
      name: 'brandsDescription',
      title: 'Opis sekcji producentów',
      description: 'Jedno zdanie pod nagłówkiem.',
      type: 'string',
      group: 'brands',
      initialValue:
        'Współpracujemy z renomowanymi producentami, dobierając systemy do indywidualnych potrzeb każdej realizacji.',
    }),
    defineField({
      name: 'brands',
      title: 'Producenci i systemy',
      description:
        'Opcjonalna lista producentów / typów (np. producentów, modeli, albo typów desek). Pozostaw pustą, gdy oferta nie wymaga tej sekcji — wtedy sekcja się nie pojawi. Każdy wpis może mieć jeden lub wiele wariantów (kolor / struktura / wymiary).',
      type: 'array',
      group: 'brands',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'brand',
          fields: [
            defineField({
              name: 'name',
              title: 'Nazwa',
              description: 'Nazwa producenta, modelu lub typu, np. „Deponti — Noble” albo „Deski kompozytowe komorowe”.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'shortDescription',
              title: 'Krótki opis',
              description: 'Jedno zdanie widoczne w zwiniętym wierszu.',
              type: 'string',
            }),
            defineField({
              name: 'fullDescription',
              title: 'Pełny opis',
              description:
                '2–4 zdania widoczne po rozwinięciu. Wciśnij Enter dwa razy, aby rozdzielić na osobne akapity.',
              type: 'text',
              rows: 3,
            }),
            defineField({
              name: 'variants',
              title: 'Warianty',
              description:
                'Warianty tego wpisu — kolor, struktura, wymiary. Jeden wariant renderuje się jak dotychczas (duże zdjęcie + specyfikacja). Więcej wariantów pokazuje siatkę miniaturek do rozwinięcia. Aby dodać wariant: skopiuj poprzedni i zmień nazwę, zdjęcie oraz specyfikację.',
              type: 'array',
              validation: (rule) => rule.min(1),
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'brandVariant',
                  fields: [
                    defineField({
                      name: 'name',
                      title: 'Nazwa wariantu',
                      description: 'Podpis widoczny na miniaturce, np. „Antracyt — struktura drewna”.',
                      type: 'string',
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'image',
                      title: 'Zdjęcie',
                      type: 'image',
                      options: { hotspot: true },
                      fields: [
                        defineField({
                          name: 'alt',
                          title: 'Tekst alternatywny',
                          description: 'Opisowy tekst po polsku (kolor, struktura) — ważny dla dostępności i SEO.',
                          type: 'string',
                          validation: (rule) => rule.required(),
                        }),
                      ],
                      validation: (rule) => rule.required(),
                    }),
                    defineField({
                      name: 'specs',
                      title: 'Specyfikacja',
                      description: 'Punkty specyfikacji tego wariantu, np. „Grubość 22 mm”.',
                      type: 'array',
                      of: [defineArrayMember({ type: 'string' })],
                      validation: (rule) => rule.min(1),
                    }),
                    defineField({
                      name: 'description',
                      title: 'Opis',
                      description: 'Opcjonalny krótki opis widoczny tylko po rozwinięciu wariantu.',
                      type: 'text',
                      rows: 3,
                    }),
                    defineField({
                      name: 'manufacturer',
                      title: 'Producent',
                      description: 'Opcjonalna nazwa producenta widoczna po rozwinięciu wariantu.',
                      type: 'string',
                    }),
                  ],
                  preview: {
                    select: { title: 'name', subtitle: 'manufacturer', media: 'image' },
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'shortDescription', media: 'variants.0.image' },
          },
        }),
      ],
    }),
    defineField({
      name: 'techSpecsHeadline',
      title: 'Nagłówek sekcji specyfikacji',
      description: 'Np. „Informacje techniczne i montaż”.',
      type: 'string',
      group: 'techSpecs',
      initialValue: 'Informacje techniczne i montaż',
    }),
    defineField({
      name: 'techSpecsDescription',
      title: 'Opis sekcji specyfikacji',
      description: 'Opcjonalny krótki akapit (maks. 2 zdania) pod nagłówkiem.',
      type: 'string',
      group: 'techSpecs',
    }),
    defineField({
      name: 'techSpecs',
      title: 'Informacje techniczne',
      description: 'Od 1 do 8 kart z ikoną, tytułem i treścią (montaż, gwarancja, VAT itp.).',
      type: 'array',
      group: 'techSpecs',
      validation: (rule) => rule.min(1).max(8),
      of: [
        defineArrayMember({
          type: 'object',
          name: 'techSpec',
          fields: [
            defineField({
              name: 'icon',
              title: 'Ikona',
              type: 'string',
              options: { list: [...TECH_SPEC_ICONS], layout: 'dropdown' },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'title',
              title: 'Tytuł',
              description: 'Nagłówek karty, np. „Montaż zadaszeń”.',
              type: 'string',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'content',
              title: 'Treść',
              description: 'Główna treść karty (2–4 zdania).',
              type: 'text',
              rows: 4,
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'title', subtitle: 'icon' },
          },
        }),
      ],
    }),
    defineField({
      name: 'formCtaHeadline',
      title: 'Nagłówek CTA formularza',
      description: 'Główny nagłówek banera, np. „Gotowy na bezpłatną wycenę?”.',
      type: 'string',
      group: 'formCta',
    }),
    defineField({
      name: 'formCtaSubheadline',
      title: 'Podtytuł CTA formularza',
      description: 'Zdanie wspierające pod nagłówkiem.',
      type: 'string',
      group: 'formCta',
    }),
    defineField({
      name: 'formCtaButtonLabel',
      title: 'Etykieta przycisku CTA',
      description: 'Tekst na przycisku, np. „Wypełnij formularz wyceny”.',
      type: 'string',
      group: 'formCta',
    }),
    defineField({
      name: 'formCtaBullets',
      title: 'Punkty zapewnienia',
      description: 'Krótkie punkty pod przyciskiem (zalecane 3), np. „Bez zobowiązań”.',
      type: 'array',
      group: 'formCta',
      of: [defineArrayMember({ type: 'string' })],
    }),
  ],
  // Mirrors the order the cards appear in on /oferta, so the Studio list reads the same way.
  orderings: [
    {
      title: 'Kolejność na stronie Oferta',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
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
