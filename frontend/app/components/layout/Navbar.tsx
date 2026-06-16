'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Accordion, Dialog, Portal } from '@ark-ui/react';
import { ChevronDown, Menu as MenuIcon, X } from 'lucide-react';

import type { Navbar as NavbarType } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';

type NavItem = { label: string; href: string };

/** Offer categories — mirrors the project's information architecture. */
const OFERTA_ITEMS: NavItem[] = [
  { label: 'Zadaszenia aluminiowe', href: '/oferta/zadaszenia-aluminiowe' },
  { label: 'Żaluzje tarasowe', href: '/oferta/zaluzje-tarasowe' },
  { label: 'Tarasy kompozytowe', href: '/oferta/tarasy-kompozytowe' },
  { label: 'Tarasy z płyt gresowych', href: '/oferta/tarasy-gresowe' },
  { label: 'Tarasy drewniane', href: '/oferta/tarasy-drewniane' },
  { label: 'Elewacje kompozytowe', href: '/oferta/elewacje-kompozytowe' },
  { label: 'Schody modułowe', href: '/oferta/schody-modulowe' },
];

/** Quotation forms shown under "Formularze wycen". */
const WYCENA_ITEMS: NavItem[] = [
  { label: 'Formularz Wyceny Tarasu', href: '/wycena/taras' },
  { label: 'Formularz Wyceny Zadaszenia', href: '/wycena/zadaszenie' },
  { label: 'Formularz Wyceny Żaluzji', href: '/wycena/zaluzje' },
  { label: 'Formularz Wyceny Schodów', href: '/wycena/schody' },
];

/** Simple top-level links rendered after the Oferta dropdown. */
const NAV_LINKS: NavItem[] = [
  { label: 'Realizacje', href: '/realizacje' },
  { label: 'O nas', href: '/o-nas' },
  { label: 'Kierownik budowy', href: '/kierownik-budowy' },
  { label: 'Kontakt', href: '/kontakt' },
];

function isActivePath(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Desktop nav dropdown — plain React state + real <Link> anchors (no headless
 * library). Closes on outside pointerdown, Escape, or selecting a link.
 */
function NavDropdown({
  label,
  items,
  align = 'left',
}: {
  label: string;
  items: NavItem[];
  align?: 'left' | 'right';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-1 text-sm text-silver transition-colors duration-200 outline-none hover:text-white aria-expanded:text-white"
      >
        {label}
        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <div
          className={`glass absolute top-full mt-3 min-w-56 rounded-lg animate-[nav-fade-in_0.15s_ease-out] ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
        >
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-sm whitespace-nowrap text-silver transition-colors hover:bg-white/10 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Navbar({ navbar }: { navbar?: NavbarType }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const logoText = navbar?.logo?.text;
  const logoLetter = navbar?.logo?.iconLetter;
  const logoHref = navbar?.logo?.href ?? '/';
  const logoImageUrl = navbar?.logo?.logoImage?.asset
    ? urlForImage(navbar.logo.logoImage)?.height(96).fit('max').url()
    : undefined;
  const ctaLabel = navbar?.ctaButton?.label;
  const ctaHref = navbar?.ctaButton?.href;

  const navLinkClass = (active: boolean) =>
    `text-sm transition-colors duration-200 ${active ? 'text-white' : 'text-silver hover:text-white'}`;

  return (
    <header
      className={`fixed top-0 left-0 z-50 w-full animate-[nav-slide-down_0.45s_cubic-bezier(0.22,1,0.36,1)] transition-all duration-300 ${
        scrolled ? 'bg-bg-mid/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 md:px-8">
        <Link href={logoHref} className="flex shrink-0 items-center gap-2.5" aria-label={logoText}>
          {logoImageUrl ? (
            <Image
              src={logoImageUrl}
              alt={logoText ?? ''}
              width={240}
              height={48}
              className="h-12 w-auto object-contain"
              priority
            />
          ) : (
            (logoLetter || logoText) && (
              <>
                {logoLetter && (
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent font-heading text-xl font-bold text-black">
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
        <div className="hidden flex-1 items-center justify-center gap-5 lg:flex">
          <Link href="/" className={navLinkClass(isActivePath(pathname, '/'))}>
            Strona główna
          </Link>
          <NavDropdown label="Oferta" items={OFERTA_ITEMS} />
          {NAV_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={navLinkClass(isActivePath(pathname, item.href))}
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden shrink-0 items-center gap-3 lg:flex">
          <NavDropdown label="Formularze wycen" items={WYCENA_ITEMS} align="right" />
          {ctaLabel && ctaHref && (
            <Link
              href={ctaHref}
              className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
            >
              {ctaLabel}
            </Link>
          )}
        </div>
        <Dialog.Root open={mobileOpen} onOpenChange={(e) => setMobileOpen(e.open)}>
          <Dialog.Trigger className="text-white outline-none lg:hidden" aria-label="Otwórz menu">
            <MenuIcon size={24} aria-hidden="true" />
          </Dialog.Trigger>
          <Portal>
            <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-[nav-fade-in_0.2s_ease-out]" />
            <Dialog.Positioner className="fixed inset-0 z-50">
              <Dialog.Content className="ml-auto flex h-full w-80 max-w-[85vw] flex-col bg-bg-mid px-6 py-5 animate-[nav-slide-in-right_0.3s_ease-out]">
                <div className="flex items-center justify-between">
                  <Dialog.Title className="font-heading text-lg font-bold text-white">
                    {logoText}
                  </Dialog.Title>
                  <Dialog.CloseTrigger
                    className="text-silver transition-colors hover:text-white"
                    aria-label="Zamknij menu"
                  >
                    <X size={24} aria-hidden="true" />
                  </Dialog.CloseTrigger>
                </div>
                <div className="mt-8 flex flex-1 flex-col gap-1 overflow-y-auto">
                  <Link
                    href="/"
                    onClick={() => setMobileOpen(false)}
                    className="py-2.5 text-base text-silver transition-colors hover:text-white"
                  >
                    Strona główna
                  </Link>
                  <Accordion.Root collapsible>
                    <Accordion.Item value="oferta">
                      <Accordion.ItemTrigger className="group flex w-full items-center justify-between py-2.5 text-base text-silver transition-colors outline-none hover:text-white">
                        Oferta
                        <Accordion.ItemIndicator>
                          <ChevronDown
                            size={18}
                            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                          />
                        </Accordion.ItemIndicator>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent className="overflow-hidden">
                        <div className="flex flex-col border-l border-graphite pl-3">
                          {OFERTA_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="py-2 text-sm text-silver transition-colors hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="py-2.5 text-base text-silver transition-colors hover:text-white"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Accordion.Root collapsible>
                    <Accordion.Item value="wycena">
                      <Accordion.ItemTrigger className="group flex w-full items-center justify-between py-2.5 text-base text-silver transition-colors outline-none hover:text-white">
                        Formularze wycen
                        <Accordion.ItemIndicator>
                          <ChevronDown
                            size={18}
                            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                            aria-hidden="true"
                          />
                        </Accordion.ItemIndicator>
                      </Accordion.ItemTrigger>
                      <Accordion.ItemContent className="overflow-hidden">
                        <div className="flex flex-col border-l border-graphite pl-3">
                          {WYCENA_ITEMS.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setMobileOpen(false)}
                              className="py-2 text-sm text-silver transition-colors hover:text-white"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      </Accordion.ItemContent>
                    </Accordion.Item>
                  </Accordion.Root>
                </div>

                {ctaLabel && ctaHref && (
                  <Link
                    href={ctaHref}
                    onClick={() => setMobileOpen(false)}
                    className="mt-4 rounded-md bg-accent px-4 py-3 text-center text-sm font-semibold text-black transition-colors hover:bg-accent-hover"
                  >
                    {ctaLabel}
                  </Link>
                )}
              </Dialog.Content>
            </Dialog.Positioner>
          </Portal>
        </Dialog.Root>
      </nav>
    </header>
  );
}
