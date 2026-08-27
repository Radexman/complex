import type { ComponentPropsWithoutRef } from 'react';
import { FaFacebookF } from 'react-icons/fa6';

/**
 * „Więcej realizacji na Facebooku" — the outbound link the client asked for in
 * both „nasze realizacje" contexts (home page and `/realizacje`). Shared so the
 * two cannot drift.
 *
 * Renders nothing when the footer has no Facebook link configured, so removing
 * the profile from the CMS removes the link everywhere.
 */
export default function FacebookRealizacjeLink({
  href,
  className = '',
  ...rest
}: {
  href: string | null | undefined;
  className?: string;
  // Callers tag the link with their section's GSAP reveal attribute
  // (`data-fp-reveal` / `data-pg-reveal`) so it animates in with its siblings.
} & Omit<ComponentPropsWithoutRef<'a'>, 'href' | 'className'>) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-4 py-2 font-heading text-sm font-bold text-accent transition-colors hover:bg-accent hover:text-black ${className}`}
      {...rest}
    >
      <FaFacebookF size={14} aria-hidden="true" />
      Więcej realizacji na Facebooku
    </a>
  );
}
