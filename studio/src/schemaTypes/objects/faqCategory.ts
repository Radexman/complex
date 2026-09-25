import { UlistIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

export const faqCategory = defineType({
  name: 'faqCategory',
  title: 'Kategoria',
  type: 'object',
  icon: UlistIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Nazwa kategorii',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'items',
      title: 'Pytania i odpowiedzi',
      type: 'array',
      of: [defineArrayMember({ type: 'faqItem' })],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { title: 'title', count: 'items.length' },
    prepare({ title, count }: { title?: string; count?: number }) {
      return { title, subtitle: count ? `${count} pytań` : 'Brak pytań' };
    },
  },
});
