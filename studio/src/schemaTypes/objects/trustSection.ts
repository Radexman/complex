import {StarIcon} from '@sanity/icons'
import {defineArrayMember, defineField, defineType} from 'sanity'

export const trustSection = defineType({
  name: 'trustSection',
  title: 'Sekcja Trust',
  type: 'object',
  icon: StarIcon,
  fields: [
    defineField({
      name: 'eyebrow',
      title: 'Brew',
      description: 'Mała etykieta nad nagłówkiem (wersaliki).',
      type: 'string',
      initialValue: 'Dlaczego Complex?',
    }),
    defineField({
      name: 'headline',
      title: 'Nagłówek',
      description: 'Główny nagłówek sekcji.',
      type: 'string',
      initialValue: 'Zaufali nam właściciele domów w całym regionie',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'subheadline',
      title: 'Podtytuł',
      description: 'Tekst wspierający pod nagłówkiem.',
      type: 'text',
      rows: 3,
      initialValue:
        'Nasze zaangażowanie w jakość sprawiło, że staliśmy się pierwszym wyborem przy realizacji nowoczesnych przestrzeni zewnętrznych.',
    }),
    defineField({
      name: 'stats',
      title: 'Statystyki',
      description: 'Karty statystyk (zalecane 4, maksymalnie 6).',
      type: 'array',
      of: [defineArrayMember({type: 'trustStat'})],
      initialValue: [
        {
          icon: 'shield',
          value: '1200+',
          label: 'Zrealizowanych montaży',
          description: 'Pergole i zadaszenia zamontowane na terenie Śląska i Opolszczyzny',
        },
        {
          icon: 'clock',
          value: '15',
          label: 'Lat doświadczenia',
          description: 'Pionierskie rozwiązania w zakresie przestrzeni zewnętrznych',
        },
        {
          icon: 'award',
          value: '98%',
          label: 'Zadowolonych klientów',
          description: 'Na podstawie zweryfikowanych opinii klientów',
        },
        {
          icon: 'users',
          value: '50+',
          label: 'Opcji projektowych',
          description: 'Konstrukcje, materiały i wykończenia dobrane do każdego projektu',
        },
      ],
      validation: (rule) => rule.min(1).max(6),
    }),
    defineField({
      name: 'badges',
      title: 'Odznaki zaufania',
      description: 'Krótkie etykiety wyświetlane jako lista na dole sekcji.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      initialValue: [
        '10 lat gwarancji',
        'Bezpłatna konsultacja',
        'Materiały premium',
        'Realizacje na terenie Śląska i Opolszczyzny',
      ],
    }),
  ],
  preview: {
    select: {title: 'headline'},
    prepare({title}) {
      return {title: title || 'Sekcja Trust', subtitle: 'Trust'}
    },
  },
})
