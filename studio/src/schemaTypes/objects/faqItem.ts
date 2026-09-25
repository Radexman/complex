import { HelpCircleIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const faqItem = defineType({
  name: 'faqItem',
  title: 'Pytanie',
  type: 'object',
  icon: HelpCircleIcon,
  fields: [
    defineField({
      name: 'question',
      title: 'Pytanie',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'answer',
      title: 'Odpowiedź',
      type: 'text',
      rows: 5,
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'question' },
  },
});
