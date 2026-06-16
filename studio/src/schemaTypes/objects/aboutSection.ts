import { UsersIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const aboutSection = defineType({
  name: 'aboutSection',
  title: 'Sekcja O nas',
  type: 'document',
  icon: UsersIcon,
  fields: [
    defineField({
      name: 'cardImage',
      title: 'Zdjęcia w karcie',
      description: 'Zdjęcie karty w sekcji "o nas"',
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
    }),
    defineField({
      name: 'cardContent',
      title: 'Zawartość karty',
      description: 'Treść w karcie w prawym dolnym rogu zdjęcia',
      type: 'object',
      fields: [
        defineField({
          name: 'title',
          title: 'Tytuł',
          description: 'Nazwa karty',
          type: 'string',
          initialValue: '13+',
          validation: (rule) => rule.required(),
        }),
        defineField({
          name: 'description',
          title: 'Opis',
          description: 'Krótki opis (1 zdanie)',
          type: 'string',
          initialValue: 'Lat doświadczenia w tworzeniu ekskluzywnych zadaszeń ogrodowych',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'O firmie Complex',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek sekcji',
      type: 'string',
      initialValue: 'Tworzymy wyjątkowe przestrzenie do życia na świeżym powietrzu',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Opis tego czym zajmuje się firma i jakie ma osiągnięcia',
      type: 'text',
      rows: 8,
      initialValue: `Od 2009 roku firma Complex wyznacza standardy w projektowaniu i realizacji zadaszeń klasy premium. Łączymy nowoczesne rozwiązania architektoniczne z precyzją inżynierii, tworząc pergole i zadaszenia tarasowe, które zmieniają zwykłe przestrzenie w wyjątkowe miejsca wypoczynku. Nasze dążenie do perfekcji widoczne jest w każdym detalu — od starannie wyselekcjonowanych materiałów po doświadczenie naszych ekip montażowych. Nie tworzymy jedynie pergoli. Projektujemy przestrzenie, które podnoszą komfort życia i pozwalają w pełni korzystać z uroków otoczenia.
      `,
    }),
    defineField({
      name: 'badges',
      title: 'Odznaki',
      description: 'Odznaki z poszczególnymi osiągnięciami. Zalecane 4 - 6',
      type: 'array',
      of: [defineArrayMember({ type: 'aboutBadge' })],
      initialValue: [
        {
          title: 'Najwyższa jakość',
          description:
            'Wyłącznie najwyższej klasy materiały i wykończenia, zapewniające trwałość, estetykę oraz niezawodność na lata.',
          icon: 'gem',
        },
      ],
    }),
  ],
  preview: {
    select: { subtitle: 'headline' },
    prepare({ subtitle }) {
      return { title: 'Sekcja O nas', subtitle };
    },
  },
});
