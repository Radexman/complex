import { MenuIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

export const navbar = defineType({
  name: 'navbar',
  title: 'Nawigacja',
  type: 'object',
  icon: MenuIcon,
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'Marka wyświetlana po lewej stronie paska nawigacji.',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'logoImage',
          title: 'Ikona logo',
          description:
            'Obraz logo wyświetlany po lewej stronie. Jeśli nie wgrasz ikony, użyta zostanie litera w zielonym kwadracie.',
          type: 'image',
          options: { hotspot: true },
        }),
        defineField({
          name: 'text',
          title: 'Nazwa marki',
          description: 'Tekst obok ikony.',
          type: 'string',
          initialValue: 'Complex',
        }),
        defineField({
          name: 'iconLetter',
          title: 'Litera w ikonie (zapasowa)',
          description:
            'Pojedyncza litera w zielonym kwadracie. Używana, gdy nie wgrano ikony logo.',
          type: 'string',
          initialValue: 'C',
          validation: (rule) => rule.max(1),
        }),
        defineField({
          name: 'href',
          title: 'Odnośnik logo',
          description: 'Dokąd prowadzi kliknięcie w logo.',
          type: 'string',
          initialValue: '/',
        }),
      ],
    }),
    defineField({
      name: 'ctaButton',
      title: 'Przycisk CTA',
      description: 'Zielony przycisk po prawej stronie paska nawigacji.',
      type: 'object',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'label',
          title: 'Etykieta',
          type: 'string',
          initialValue: 'Darmowa wycena',
        }),
        defineField({
          name: 'href',
          title: 'Odnośnik',
          type: 'string',
          initialValue: '/wycena/zadaszenie',
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Nawigacja' };
    },
  },
});
