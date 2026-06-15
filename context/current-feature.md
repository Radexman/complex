# Current Feature

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

## History

### Trust Section (2026-06-15)

CMS-managed social-proof / credibility block on the home page, directly below the hero, with a GSAP scroll reveal. Also added a navbar entrance animation in the same session.

- Sanity: `trustSection` + `trustStat` object types (`studio/src/schemaTypes/objects/`), embedded as the `trust` field on the `settings` singleton (no `homePage` doc — matches the Hero precedent). `trustStat.icon` is a constrained `options.list` dropdown (8 allowed values, exported as `TRUST_STAT_ICONS`). Polish `initialValue` defaults for header, stats, badges. Registered `trustStat` in `index.ts`; regenerated types (`TrustSection`/`TrustStat`).
- Component `frontend/app/components/sections/TrustSection.tsx` (`'use client'`): centered header (`max-w-4xl`), responsive 4/2/1 stat-card grid, badge row. Icon string → Lucide via a static `ICON_MAP` (no dynamic imports), with `stegaClean` on the key so Visual Editing metadata doesn't break the lookup. Green radial glow in the upper-left (`relative overflow-hidden` section + absolute blurred radial). Full in-component fallbacks; rendered **always** in `page.tsx` (initialValue doesn't backfill the existing singleton), so the section shows even before an editor populates it.
- **GSAP fix:** initial implementation chained three `.from()` tweens in one ScrollTrigger timeline → cards stayed stuck at `opacity:0` (immediateRender footgun). Rewrote to `gsap.set(...)` hidden state + `.to()` reveals (header → cards stagger 0.1 → badges) with `toggleActions: 'play none none none'`, via `useGSAP`. Reliable now.
- **Hover polish:** card carries `border-b-2` at rest (was `hover:border-b-2`, which shifted height by 1px) and only swaps the bottom color to accent on hover; icon gets `group-hover:brightness-125` (greener) and its tile `group-hover:bg-accent/20`.
- **Navbar entrance:** new `nav-slide-down` keyframe in `globals.css` (`translateY(-100%)` + fade); header animates in with `animate-[nav-slide-down_0.45s_cubic-bezier(0.22,1,0.36,1)]`. Independent of the scroll-based background transition.
- Verified: frontend `tsc`, studio `tsc`, `eslint`, `next build` all pass. No server actions/utilities added, so no Vitest tests (per coding standards).

### Navbar dropdown links not clickable (fix, 2026-06-15)

Oferta / Formularze wycen desktop dropdown items had no hover feedback and didn't navigate on click. Ark UI's `Menu` (portalled, Zag-driven) was the culprit; two attempts to fix it within Ark (`asChild`+`Link`, then plain `Menu.Item`+`onSelect`/`router.push`) both still failed in the browser.

- Final fix: **removed Ark `Menu` from the desktop dropdowns entirely.** New in-file `NavDropdown` component — plain `useState` open/close, no portal, real `<Link>` anchors. Closes on outside `pointerdown`, `Escape`, or link click. Panel is `absolute top-full` inside a `relative` wrapper (`align` left/right); hover via native `hover:bg-white/10`. Real anchors restore native clicks, hover, and middle-click "open in new tab".
- Dropped the `Menu`/`useRouter` imports; `Portal` stays (mobile `Dialog` drawer still uses Ark). Mobile drawer (Ark `Accordion` + `Link`) was unaffected and left as-is.

### Navbar logo image (2026-06-15)

Optional uploadable logo image for the navbar, falling back to the existing letter-square + brand text.

- Sanity: added a `logoImage` (`type: 'image'`, hotspot) field to the `navbar.logo` object (`studio/src/schemaTypes/objects/navbar.ts`); relabeled `iconLetter` as the fallback. Field is named `logoImage` (not `icon`) to avoid colliding with a plugin-registered `icon` type during schema extract. Regenerated types (`LogoImage`).
- Component `Navbar.tsx`: when `logo.logoImage.asset` is set, render it via `next/image` (`urlForImage(...).height(64).fit('max')`, `h-8 w-auto object-contain`, `priority`) in place of the whole current logo; otherwise fall back to the green letter-square + text. Mobile drawer title stays text (`logoText`).
- Note: image **replaces** the square+text (a logo image normally includes the wordmark) — not shown alongside.

### Navbar (2026-06-15)

Fixed site navigation bar, CMS-managed logo + CTA, with desktop dropdowns and a mobile drawer.

- Sanity: `navbar` object type (`studio/src/schemaTypes/objects/navbar.ts`) with `logo {text, iconLetter, href}` + `ctaButton {label, href}` (Polish labels, spec defaults), added as the `navbar` field on the `settings` singleton. Generated `Navbar`/`Logo`/`CtaButton` types via TypeGen.
- Component `frontend/app/components/layout/Navbar.tsx` (`'use client'`): `fixed top-0 z-50 h-16`, transparent → `bg-bg-mid/80 backdrop-blur-md` past `scrollY > 50` (`transition-all duration-300`). Logo left, center nav, right actions.
- **Oferta** (7 links) + **Formularze wycen** (4 links) dropdowns use Ark UI `Menu` (portalled `z-50`, chevron rotates via `group-data-[state=open]`, closes on outside-click/select). Mobile drawer = Ark UI `Dialog` right slide-in (`bg-bg-mid`) with Ark `Accordion` sub-menus + bottom CTA; closes on link click / overlay / X.
- Links follow the **project IA** (not the screenshot placeholders); active state via `usePathname`. Logo/CTA have in-component fallbacks (matching the Hero precedent).
- **Layout fix:** center nav is an in-flow `flex-1` group with `shrink-0` sides (was `absolute left-1/2`), so center links never overlap the right actions as the viewport narrows toward `lg`.
- Installed `@ark-ui/react` + `lucide-react` (both were "to add" in the stack). `Header` now fetches `settings` and renders `<Navbar>`. Added `nav-fade-in` / `nav-slide-in-right` keyframes to `globals.css`.
- Used Ark `Dialog` (not the `Drawer` primitive — that one is a swipe/snap-point bottom-sheet, heavier than this spec needs).

### Hero Section (2026-06-15)

Fullscreen homepage hero, CMS-managed (Polish copy) with GSAP entrance animation.

- Sanity: `heroSection`/`heroStat` object types in `studio/src/schemaTypes/objects/`, embedded as the `hero` field on the `settings` singleton (no separate `homePage` doc — extends the existing singleton per project convention). Removed the test `settings.heading` field.
- Component `frontend/app/components/sections/HeroSection.tsx`: `next/image` background, dark gradient overlay + faded blueprint grid, accent-split headline (`stegaClean` before substring match so Visual Editing watermarks don't break it), primary (green) + glassmorphic secondary CTAs, separate `.glass` stat cards (2×2 mobile / 4-up desktop), staggered upward reveal via `useGSAP` (`gsap` + `@gsap/react`).
- Mobile: centered content, side-by-side equal-width CTAs, responsive type scale (`text-4xl`→`text-7xl`).
- CTA labels/hrefs and stats have in-component fallbacks (schema `initialValue` doesn't backfill fields added to an existing doc).
- Rendered on `/`; emptied the placeholder `Header` (site name stays in metadata only). Fixed `cdn.sanity.io` `remotePatterns` (object form — the `new URL(...)` form rejected query-string srcs). Exported `urlForImage`.
- Polished all client-facing Studio labels (schema fields, structure sidebar, workspace/Presentation titles).

### Styling — Global Design System (2026-06-15)

Set up the foundational design system in `frontend/app/globals.css` and `frontend/app/layout.tsx`.

- Color palette + typography tokens exposed via Tailwind v4 `@theme` (`bg-deep`/`bg-mid`/`bg-surface`, `accent` `#6FCF3A` + `accent-hover` `#5BB82E`, `graphite`, `silver`, `white`; `font-display`/`font-heading`/`font-body`)
- Fonts loaded via `next/font/google` (Bebas Neue, Space Grotesk, Inter) instead of `@import` — matches project convention and avoids double-loading
- Dark `body` background, smooth scroll, `.glass` and `.section-padding` utilities
- Removed leftover IBM Plex Mono font; set `html lang="pl"`
