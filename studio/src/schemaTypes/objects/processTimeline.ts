import { OlistIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const processTimeline = defineType({
  name: 'processTimeline',
  title: 'Sekcja Proces',
  type: 'document',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem.',
      type: 'string',
      initialValue: 'Jak to działa',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      type: 'string',
      initialValue: 'Twoja droga do wymarzonego tarasu',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      type: 'text',
      rows: 3,
      initialValue:
        'Od pierwszego zapytania po gotową realizację objętą gwarancją — proces zaprojektowany tak, aby był prosty i przejrzysty na każdym etapie.',
    }),
    defineField({
      name: 'steps',
      title: 'Kroki',
      description: 'Kolejne etapy współpracy (7 kroków stałego procesu).',
      type: 'array',
      of: [defineArrayMember({ type: 'processStep' })],
      validation: (rule) => rule.required().min(1).max(7),
      initialValue: [
        {
          _type: 'processStep',
          number: '01',
          icon: 'mail',
          title: 'Zapytanie',
          description:
            'Wysyłasz zapytanie poprzez formularz wyceny, e-mail lub telefonicznie. Opisujesz swoje potrzeby i wstępne oczekiwania dotyczące projektu.',
        },
        {
          _type: 'processStep',
          number: '02',
          icon: 'calculator',
          title: 'Wycena wstępna',
          description:
            'Na podstawie przesłanych informacji przygotowujemy orientacyjną wycenę, która pozwala oszacować koszt realizacji jeszcze przed wizją lokalną.',
        },
        {
          _type: 'processStep',
          number: '03',
          icon: 'ruler',
          title: 'Pomiar',
          description:
            'Umawiamy bezpłatną wizytę pomiarową na miejscu inwestycji. Dokładnie mierzymy przestrzeń i weryfikujemy warunki montażu.',
        },
        {
          _type: 'processStep',
          number: '04',
          icon: 'file-check',
          title: 'Wycena końcowa',
          description:
            'Na podstawie wykonanych pomiarów przygotowujemy szczegółową, ostateczną wycenę uwzględniającą wszystkie ustalenia.',
        },
        {
          _type: 'processStep',
          number: '05',
          icon: 'file-signature',
          title: 'Umowa',
          description:
            'Po akceptacji wyceny podpisujemy umowę z jasno określonym zakresem prac, materiałami, terminem realizacji i warunkami płatności.',
        },
        {
          _type: 'processStep',
          number: '06',
          icon: 'hammer',
          title: 'Montaż',
          description:
            'Nasza ekipa montażowa realizuje projekt zgodnie z umową i ustalonym harmonogramem, dbając o porządek i sprawny przebieg prac.',
        },
        {
          _type: 'processStep',
          number: '07',
          icon: 'shield-check',
          title: 'Gwarancja',
          description:
            'Po odbiorze prac przekazujemy gwarancję na montaż oraz materiały. Pozostajemy do dyspozycji w razie pytań lub potrzeby serwisu.',
        },
      ],
    }),
  ],
  preview: {
    select: { title: 'headline' },
    prepare({ title }) {
      return { title: 'Sekcja Proces', subtitle: title };
    },
  },
});
