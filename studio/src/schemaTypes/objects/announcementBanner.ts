import { WarningOutlineIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

/**
 * Thin sticky promo bar above the Navbar, on every page. A fixed-id singleton
 * (see structure/index.ts). Visibility is gated by `isEnabled` AND `endsAt` —
 * the frontend computes the active window server-side, so an expired banner
 * never renders even if an editor forgets to untoggle it.
 */
export const announcementBanner = defineType({
  name: 'announcementBanner',
  title: 'Baner ogłoszeń',
  type: 'document',
  icon: WarningOutlineIcon,
  fields: [
    defineField({
      name: 'isEnabled',
      title: 'Włącz baner',
      type: 'boolean',
      initialValue: false,
      description: 'Odznacz, aby ręcznie ukryć baner niezależnie od daty zakończenia.',
    }),
    defineField({
      name: 'text',
      title: 'Treść banera',
      type: 'string',
      description: 'Np. „Promocja Jesienna — rabat do 15% na zadaszenia tarasowe”.',
      validation: (rule) => rule.required().max(120),
    }),
    defineField({
      name: 'endsAt',
      title: 'Data zakończenia promocji',
      type: 'datetime',
      description: 'Baner zostanie automatycznie ukryty po tej dacie.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Przycisk CTA — etykieta (opcjonalnie)',
      type: 'string',
      description: 'Np. „Zapytaj o wycenę”. Zostaw puste, aby nie wyświetlać przycisku.',
      initialValue: 'Zapytaj o wycenę',
    }),
    defineField({
      name: 'ctaHref',
      title: 'Przycisk CTA — link',
      type: 'string',
      description: 'Np. /wycena/zadaszenie. Wymagane, jeśli podano etykietę przycisku.',
      initialValue: '/wycena/zadaszenie',
      validation: (rule) =>
        rule.custom((value, context) => {
          const parent = context.parent as { ctaLabel?: string } | undefined;
          if (parent?.ctaLabel && !value) {
            return 'Podaj link, jeśli ustawiono etykietę przycisku CTA.';
          }
          return true;
        }),
    }),
  ],
  preview: {
    select: { subtitle: 'text', isEnabled: 'isEnabled' },
    prepare({ subtitle, isEnabled }) {
      return {
        title: 'Baner ogłoszeń',
        subtitle: isEnabled ? subtitle : `(wyłączony) ${subtitle ?? ''}`,
      };
    },
  },
});
