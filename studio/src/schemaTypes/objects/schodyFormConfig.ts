import { ComponentIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Fixed-id singleton holding configuration for the „Formularz Wyceny Schodów”
 * (`/wycena/schody`). Currently just the technical diagram the dimension inputs
 * A–h refer to; kept separate from „Ustawienia / SEO” to match the repo's
 * split-singleton precedent (see `tarasFormConfig`).
 */
export const schodyFormConfig = defineType({
  name: 'schodyFormConfig',
  title: 'Formularz Schodów',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'diagram',
      title: 'Schemat wymiarów',
      description:
        'Rysunek techniczny schodów z oznaczeniami A–h, prezentowany nad polami wymiarów w formularzu wyceny.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          type: 'string',
          initialValue: 'Schemat wymiarów schodów modułowych',
          validation: (rule) => rule.required(),
        }),
      ],
    }),
  ],
  preview: {
    select: { media: 'diagram' },
    prepare({ media }) {
      return { title: 'Formularz Schodów', media };
    },
  },
});
