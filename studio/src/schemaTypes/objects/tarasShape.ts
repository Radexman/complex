import { defineField, defineType } from 'sanity';

/**
 * A single terrace-shape diagram used by the „Formularz Wyceny Tarasu” form.
 * The editor uploads the diagram image; `sides` drives which dimension inputs
 * and building-position checkboxes the form renders for that shape.
 */
export const tarasShape = defineType({
  name: 'tarasShape',
  title: 'Kształt tarasu',
  type: 'object',
  fields: [
    defineField({
      name: 'shapeNumber',
      title: 'Numer kształtu',
      description: 'Identyfikator kształtu („1”–„4”) używany do dopasowania w formularzu.',
      type: 'string',
      options: {
        list: [
          { title: 'Kształt 1', value: '1' },
          { title: 'Kształt 2', value: '2' },
          { title: 'Kształt 3', value: '3' },
          { title: 'Kształt 4', value: '4' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'label',
      title: 'Etykieta',
      description: 'Podpis wyświetlany pod diagramem, np. „Kształt 1”.',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'image',
      title: 'Diagram kształtu',
      description: 'Rysunek (SVG lub PNG) prezentujący kształt tarasu i oznaczenia boków.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Ważny dla dostępności i SEO.',
          type: 'string',
        }),
      ],
    }),
    defineField({
      name: 'sides',
      title: 'Boki',
      description:
        'Oznaczenia boków tego kształtu (np. A, B, C). Decydują, które pola wymiarów i położenia budynku pojawiają się w formularzu.',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      validation: (rule) => rule.required().min(1),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'shapeNumber', media: 'image' },
    prepare({ title, subtitle, media }) {
      return {
        title: title || 'Kształt tarasu',
        subtitle: subtitle ? `Kształt ${subtitle}` : undefined,
        media,
      };
    },
  },
});
