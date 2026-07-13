import { OlistIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const PROCESS_STEP_ICONS = [
  { title: 'Koperta (zapytanie)', value: 'mail' },
  { title: 'Kalkulator (wycena wstępna)', value: 'calculator' },
  { title: 'Linijka (pomiar)', value: 'ruler' },
  { title: 'Dokument zatwierdzony (wycena końcowa)', value: 'file-check' },
  { title: 'Dokument z podpisem (umowa)', value: 'file-signature' },
  { title: 'Młotek (montaż)', value: 'hammer' },
  { title: 'Tarcza (gwarancja)', value: 'shield-check' },
] as const;

export const processStep = defineType({
  name: 'processStep',
  title: 'Krok procesu',
  type: 'object',
  icon: OlistIcon,
  fields: [
    defineField({
      name: 'number',
      title: 'Numer',
      description: 'Numer kroku wyświetlany obok tytułu, np. „01”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'icon',
      title: 'Ikona',
      description: 'Ikona wyświetlana w węźle na osi czasu.',
      type: 'string',
      options: {
        list: [...PROCESS_STEP_ICONS],
        layout: 'dropdown',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      title: 'Tytuł',
      description: 'Krótka nazwa kroku, np. „Zapytanie”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Opis',
      description: 'Wyjaśnienie kroku (1–3 zdania).',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'number' },
    prepare({ title, subtitle }) {
      return { title, subtitle: subtitle ? `Krok ${subtitle}` : undefined };
    },
  },
});
