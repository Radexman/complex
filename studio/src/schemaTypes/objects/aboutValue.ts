import { HeartIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

import { BENEFIT_ICONS } from '../documents/service';

/**
 * One value card in the „Co nas wyróżnia" grid on „O nas". Embedded in the `aboutPage`
 * singleton. Reuses `BENEFIT_ICONS` so the dropdown and the frontend lookup map
 * (app/lib/benefitIcons.ts) can never drift apart.
 */
export const aboutValue = defineType({
  name: 'aboutValue',
  title: 'Wartość',
  type: 'object',
  icon: HeartIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Ikona',
      description: 'Ikona wyświetlana nad tytułem.',
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
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'icon' },
  },
});
