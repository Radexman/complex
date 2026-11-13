import { Phone } from 'lucide-react';
import { stegaClean } from 'next-sanity';

import { sanityFetch } from '@/sanity/lib/live';
import { footerQuery } from '@/sanity/lib/queries';

/**
 * Floating call button, always in view in the bottom-right corner (client request: the phone
 * number should never be more than a tap away). The number is the footer's `contactPhone`, so it
 * stays in sync with the footer and the contact section. Sits below dialogs and the lightbox
 * (`z-40` vs their `z-50`).
 */
export default async function CallButton() {
  const { data: footer } = await sanityFetch({ query: footerQuery });
  const phone = footer?.contactPhone;
  if (!phone) return null;

  const cleanPhone = stegaClean(phone);

  return (
    <a
      href={`tel:${cleanPhone.replace(/\s+/g, '')}`}
      aria-label={`Zadzwoń: ${cleanPhone}`}
      className="fixed right-4 bottom-4 z-40 flex h-14 items-center gap-2 rounded-full bg-accent px-4 font-heading text-sm font-semibold text-black shadow-lg shadow-black/40 ring-1 ring-black/10 transition-colors hover:bg-accent-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white md:right-6 md:bottom-6"
    >
      <Phone size={22} aria-hidden="true" />
      <span className="hidden md:inline">{phone}</span>
    </a>
  );
}
