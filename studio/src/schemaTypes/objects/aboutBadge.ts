import { ControlsIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const BADGE_ICONS = [
  { title: 'Klejnot', value: 'gem' },
  { title: 'Tarcza (precyzja)', value: 'target' },
  { title: 'Klucz (rzemiosło)', value: 'wrench' },
  { title: 'Nagroda (odznaczenie)', value: 'award' },
] as const;

export const aboutBadge = defineType({
  name: 'aboutBadge',
  title: 'Odznaka',
  type: 'object',
  icon: ControlsIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Ikona',
      description: 'Ikona wyświetlana z lewej strony odznaki',
      type: 'string',
      options: {
        list: [...BADGE_ICONS],
        layout: 'dropdown',
      },
      initialValue: 'gem',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Krótki tytuł odznaki',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Jedno zdanie opisu odznaki',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'description' },
  },
});
