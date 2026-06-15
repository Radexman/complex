import {BarChartIcon} from '@sanity/icons'
import {defineField, defineType} from 'sanity'

export const heroStat = defineType({
  name: 'heroStat',
  title: 'Statystyka',
  type: 'object',
  icon: BarChartIcon,
  fields: [
    defineField({
      name: 'value',
      title: 'Wartość',
      description: 'Np. "1200+", "15", "98%".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Np. "Realizacji", "Lat doświadczenia".',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {title: 'value', subtitle: 'label'},
  },
})
