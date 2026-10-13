import { SearchIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Per-page SEO, mirroring „Ustawienia / SEO" on a single page. Every field is
 * optional — an empty one falls back to the page's built-in title/description
 * (see `buildSeoMetadata` in the frontend), so nothing changes until filled in.
 * The title holds only the page name; the site name is appended automatically.
 */
export const seo = defineType({
  name: 'seo',
  title: 'SEO',
  type: 'object',
  icon: SearchIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł strony (SEO)',
      description:
        'Wyświetlany w karcie przeglądarki i wynikach wyszukiwania. Nazwa firmy dopisuje się automatycznie. Zostaw puste, aby użyć domyślnego.',
      type: 'string',
      validation: (rule) => rule.max(60).warning('Tytuł dłuższy niż 60 znaków może zostać ucięty.'),
    }),
    defineField({
      name: 'description',
      title: 'Opis strony (SEO)',
      description: 'Krótki opis w wynikach wyszukiwania. Zostaw puste, aby użyć domyślnego.',
      type: 'text',
      rows: 3,
      validation: (rule) =>
        rule.max(160).warning('Opis dłuższy niż 160 znaków może zostać ucięty.'),
    }),
    defineField({
      name: 'ogImage',
      title: 'Obraz Open Graph',
      description: 'Wyświetlany przy udostępnianiu strony w mediach społecznościowych.',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({
          name: 'alt',
          title: 'Tekst alternatywny',
          description: 'Ważny dla dostępności i SEO.',
          type: 'string',
          validation: (rule) =>
            rule.custom((alt, context) => {
              const image = context.parent as { asset?: { _ref?: string } } | undefined;
              return image?.asset?._ref && !alt ? 'Wymagane' : true;
            }),
        }),
      ],
    }),
  ],
});
