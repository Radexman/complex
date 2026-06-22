import { ThListIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * Allowed social platforms. Exported so the frontend can map each value to its
 * Lucide icon from a single source of truth.
 */
export const FOOTER_SOCIAL_PLATFORMS = [
  { title: 'Instagram', value: 'instagram' },
  { title: 'Facebook', value: 'facebook' },
  { title: 'LinkedIn', value: 'linkedin' },
  { title: 'YouTube', value: 'youtube' },
  { title: 'X (Twitter)', value: 'x' },
  { title: 'TikTok', value: 'tiktok' },
] as const;

export const footer = defineType({
  name: 'footer',
  title: 'Stopka',
  type: 'document',
  icon: ThListIcon,
  groups: [
    { name: 'brand', title: 'Marka' },
    { name: 'contact', title: 'Kontakt' },
    { name: 'legal', title: 'Stopka dolna' },
  ],
  fields: [
    defineField({
      name: 'logo',
      title: 'Logo',
      description: 'Marka wyświetlana w stopce. Zalecane spójne z nawigacją.',
      type: 'object',
      group: 'brand',
      options: { collapsible: true, collapsed: false },
      fields: [
        defineField({
          name: 'logoImage',
          title: 'Ikona logo',
          description:
            'Obraz logo wyświetlany w stopce. Jeśli nie wgrasz ikony, użyta zostanie litera w zielonym kwadracie.',
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
      name: 'tagline',
      title: 'Hasło / opis',
      description: 'Krótki opis pod logo.',
      type: 'string',
      group: 'brand',
      initialValue:
        'Aluminiowe zadaszenia i nowoczesne przestrzenie zewnętrzne. Wykonane z precyzją dla wymagających klientów.',
    }),
    defineField({
      name: 'socialLinks',
      title: 'Linki społecznościowe',
      type: 'array',
      group: 'brand',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({
              name: 'platform',
              title: 'Platforma',
              type: 'string',
              options: { list: [...FOOTER_SOCIAL_PLATFORMS] },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'Odnośnik',
              type: 'url',
              validation: (rule) => rule.required(),
            }),
          ],
          preview: {
            select: { title: 'platform', subtitle: 'href' },
          },
        }),
      ],
    }),
    defineField({
      name: 'contactName',
      title: 'Nazwa firmy',
      type: 'string',
      group: 'contact',
      initialValue: 'Complex sp. z o.o.',
    }),
    defineField({
      name: 'contactAddress',
      title: 'Adres',
      type: 'string',
      group: 'contact',
      initialValue: 'Kępska 12, 46-020 Opole',
    }),
    defineField({
      name: 'contactPhone',
      title: 'Telefon',
      type: 'string',
      group: 'contact',
      initialValue: '+48 000 000 000',
    }),
    defineField({
      name: 'contactEmail',
      title: 'E-mail',
      type: 'string',
      group: 'contact',
      initialValue: 'biuro@complex.pl',
    }),
    defineField({
      name: 'copyrightText',
      title: 'Tekst praw autorskich',
      description: 'Tekst w lewej części dolnego paska stopki.',
      type: 'string',
      group: 'legal',
      initialValue: '© 2026 Complex sp. z o.o. Wszelkie prawa zastrzeżone.',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Stopka' };
    },
  },
});
