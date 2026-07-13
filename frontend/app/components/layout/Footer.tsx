import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone } from 'lucide-react';
import type { IconType } from 'react-icons';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaTiktok,
  FaXTwitter,
  FaYoutube,
} from 'react-icons/fa6';

import { stegaClean } from 'next-sanity';

import { sanityFetch } from '@/sanity/lib/live';
import { footerQuery } from '@/sanity/lib/queries';
import { urlForImage } from '@/sanity/lib/utils';

type NavLink = { label: string; href: string };

const SOCIAL_ICONS: Record<string, IconType> = {
  instagram: FaInstagram,
  facebook: FaFacebookF,
  linkedin: FaLinkedinIn,
  youtube: FaYoutube,
  x: FaXTwitter,
  tiktok: FaTiktok,
};

const OFERTA_LINKS: NavLink[] = [
  { label: 'Zadaszenia tarasowe', href: '/oferta/zadaszenia-tarasowe' },
  { label: 'Żaluzje tarasowe', href: '/oferta/zaluzje-tarasowe' },
  { label: 'Tarasy kompozytowe', href: '/oferta/tarasy-kompozytowe' },
  { label: 'Tarasy gresowe', href: '/oferta/tarasy-gresowe' },
  { label: 'Tarasy drewniane', href: '/oferta/tarasy-drewniane' },
  { label: 'Elewacje kompozytowe', href: '/oferta/elewacje-kompozytowe' },
  { label: 'Schody modułowe', href: '/oferta/schody-modulowe' },
];

const FIRMA_LINKS: NavLink[] = [
  { label: 'O nas', href: '/o-nas' },
  { label: 'Realizacje', href: '/realizacje' },
  { label: 'Kontakt', href: '/kontakt' },
];

const NARZEDZIA_LINKS: NavLink[] = [
  { label: 'Formularz wyceny tarasu', href: '/wycena/taras' },
  { label: 'Formularz wyceny zadaszenia', href: '/wycena/zadaszenie' },
  { label: 'Formularz wyceny żaluzji', href: '/wycena/zaluzje' },
  { label: 'Formularz wyceny schodów', href: '/wycena/schody' },
];

const LEGAL_LINKS: NavLink[] = [
  { label: 'Polityka prywatności', href: '/polityka-prywatnosci' },
  { label: 'Regulamin', href: '/regulamin' },
  { label: 'Polityka cookies', href: '/polityka-cookies' },
];

function LinkColumn({ heading, links }: { heading: string; links: NavLink[] }) {
  return (
    <div>
      <h3 className="mb-4 font-heading text-sm font-semibold text-white">{heading}</h3>
      <ul className="flex flex-col gap-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="text-sm text-silver transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default async function Footer() {
  const { data: footer } = await sanityFetch({ query: footerQuery });

  if (!footer) return null;

  const logoText = footer.logo?.text;
  const logoLetter = footer.logo?.iconLetter;
  const logoHref = footer.logo?.href ?? '/';
  const logoImageUrl = footer.logo?.logoImage?.asset
    ? urlForImage(footer.logo.logoImage)?.height(96).fit('max').url()
    : undefined;
  const tagline = footer.tagline;
  const contactName = footer.contactName;
  const contactAddress = footer.contactAddress;
  const contactPhone = footer.contactPhone;
  const contactEmail = footer.contactEmail;
  const copyrightText = footer.copyrightText;
  const socialLinks = (footer.socialLinks ?? []).filter((link) => link?.platform && link?.href);

  return (
    <footer className="border-t border-graphite bg-bg-deep">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-12 pt-16 pb-12 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Link href={logoHref} className="flex w-fit items-center gap-2.5" aria-label={logoText}>
              {logoImageUrl ? (
                <Image
                  src={logoImageUrl}
                  alt={logoText ?? ''}
                  width={240}
                  height={48}
                  className="h-12 w-auto object-contain"
                />
              ) : (
                (logoLetter || logoText) && (
                  <>
                    {logoLetter && (
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-accent font-heading text-lg font-bold text-black">
                        {logoLetter}
                      </span>
                    )}
                    {logoText && (
                      <span className="font-heading text-xl font-bold text-white">{logoText}</span>
                    )}
                  </>
                )
              )}
            </Link>
            {tagline && (
              <p className="mt-4 max-w-xs font-body text-sm leading-relaxed text-silver">
                {tagline}
              </p>
            )}
            {socialLinks.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {socialLinks.map((link, index) => {
                  const Icon = SOCIAL_ICONS[stegaClean(link.platform)];
                  if (!Icon) return null;
                  return (
                    <a
                      key={`${link.platform}-${index}`}
                      href={link.href as string}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={link.platform as string}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-graphite bg-bg-surface text-silver transition-all duration-200 hover:border-accent hover:text-accent"
                    >
                      <Icon size={18} aria-hidden="true" />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <LinkColumn heading="Oferta" links={OFERTA_LINKS} />
          <LinkColumn heading="Firma" links={FIRMA_LINKS} />
          <LinkColumn heading="Narzędzia" links={NARZEDZIA_LINKS} />
          <div>
            <h3 className="mb-4 font-heading text-sm font-semibold text-white">Kontakt</h3>
            <div className="font-body text-sm leading-relaxed text-silver">
              {contactName && <p className="font-medium text-white">{contactName}</p>}
              {contactAddress && (
                <p className="mt-3 flex items-start gap-2">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{contactAddress}</span>
                </p>
              )}
              {contactPhone && (
                <a
                  href={`tel:${contactPhone.replace(/\s+/g, '')}`}
                  className="mt-3 flex items-start gap-2 transition-colors hover:text-white"
                >
                  <Phone size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{contactPhone}</span>
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="mt-3 flex items-start gap-2 transition-colors hover:text-white"
                >
                  <Mail size={14} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{contactEmail}</span>
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center justify-between gap-4 border-t border-graphite py-6 md:flex-row">
          <p className="font-body text-xs text-silver">{copyrightText}</p>
          <div className="flex gap-6">
            {LEGAL_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs text-silver transition-colors hover:text-white"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
