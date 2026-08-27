import { DocumentTextIcon } from '@sanity/icons';
import { defineArrayMember, defineField, defineType } from 'sanity';

/**
 * The privacy policy at `/polityka-prywatnosci`. A fixed-id singleton (see
 * structure/index.ts).
 *
 * CMS-owned rather than hardcoded on purpose: legal text is the copy most likely
 * to be revised by someone who is not a developer — a lawyer's correction, a new
 * registered address, a processor added to the list — and none of that should
 * need a deploy.
 */
export const legalPage = defineType({
  name: 'legalPage',
  title: 'Polityka prywatności',
  type: 'document',
  icon: DocumentTextIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Tytuł strony',
      description: 'Nagłówek H1 oraz tytuł zakładki w przeglądarce.',
      type: 'string',
      initialValue: 'Polityka prywatności',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lastUpdated',
      title: 'Data aktualizacji',
      description:
        'Pokazywana pod tytułem. Zaktualizuj ją przy każdej zmianie treści — to standard w dokumentach prawnych.',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' },
    }),
    defineField({
      name: 'intro',
      title: 'Wstęp',
      description:
        'Akapit otwierający, wskazujący Administratora danych. Oddziel akapity pustą linią.',
      type: 'text',
      rows: 8,
    }),
    defineField({
      name: 'sections',
      title: 'Sekcje',
      description: 'Kolejne części dokumentu. Kolejność na liście = kolejność na stronie.',
      type: 'array',
      of: [defineArrayMember({ type: 'legalSection' })],
    }),
    defineField({
      name: 'seoDescription',
      title: 'Opis SEO',
      description: 'Krótki opis strony dla wyszukiwarek (meta description).',
      type: 'text',
      rows: 2,
      initialValue:
        'Zasady przetwarzania danych osobowych i wykorzystania plików cookies w serwisie ccomplex.pl.',
    }),
  ],
  preview: {
    select: { subtitle: 'title' },
    prepare({ subtitle }: { subtitle?: string }) {
      return { title: 'Polityka prywatności', subtitle };
    },
  },
});
