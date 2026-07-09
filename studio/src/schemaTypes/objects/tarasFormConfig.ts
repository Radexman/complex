import { ComponentIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Fixed-id singleton holding configuration for the „Formularz Wyceny Tarasu”
 * (`/wycena/taras`). Currently just the 4 shape diagrams the editor uploads;
 * kept separate from „Ustawienia / SEO” to match the repo's split-singleton
 * precedent. Room to grow into shared config for the other quotation forms.
 */
export const tarasFormConfig = defineType({
  name: 'tarasFormConfig',
  title: 'Formularz Tarasu',
  type: 'document',
  icon: ComponentIcon,
  fields: [
    defineField({
      name: 'shapes',
      title: 'Kształty tarasu',
      description: 'Cztery diagramy kształtów tarasu prezentowane w formularzu wyceny.',
      type: 'array',
      of: [defineArrayMember({ type: 'tarasShape' })],
      validation: (rule) => rule.required().length(4),
      initialValue: [
        { _type: 'tarasShape', shapeNumber: '1', label: 'Kształt 1', sides: ['A', 'B'] },
        {
          _type: 'tarasShape',
          shapeNumber: '2',
          label: 'Kształt 2',
          sides: ['A', 'B', 'C', 'D', 'E', 'F'],
        },
        {
          _type: 'tarasShape',
          shapeNumber: '3',
          label: 'Kształt 3',
          sides: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        },
        {
          _type: 'tarasShape',
          shapeNumber: '4',
          label: 'Kształt 4',
          sides: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Formularz Tarasu' };
    },
  },
});
