# Complex — Optimization Plan

Companion to `AUDIT.md` (2026-08-19). This file is self-contained — you don't need to have read the audit to act on it.

---

## 1. Quick wins

All items below are XS/S effort, independently shippable, low regression risk, and verifiable immediately after merge.

- [ ] **1. Auto-format every Sanity image (PERF-01).** File: `frontend/sanity/lib/utils.ts:12-14`.
  ```diff
   export function urlForImage(source: SanityImageSource) {
  -  return builder.image(source);
  +  return builder.image(source).auto('format');
   }
  ```
  Verify: rebuild, inspect any rendered image's `src` URL and confirm `auto=format` is present in the query string. Single-file change; upgrades all 20+ call sites at once.

- [ ] **2. Add `app/robots.ts` (SEO-01).** New file: `frontend/app/robots.ts`.
  ```ts
  import { MetadataRoute } from 'next';
  import { resolveSiteUrl } from '@/app/lib/siteUrl';

  export default function robots(): MetadataRoute.Robots {
    const baseUrl = resolveSiteUrl({ configuredUrl: process.env.NEXT_PUBLIC_SITE_URL });
    return {
      rules: { userAgent: '*', allow: '/' },
      sitemap: `${baseUrl}/sitemap.xml`,
    };
  }
  ```
  Check `frontend/app/lib/siteUrl.ts`'s actual `resolveSiteUrl` signature before pasting — it's already used identically in `frontend/app/sitemap.ts:33`. Verify: `next build && next start`, then `curl http://localhost:3000/robots.txt` → 200 with a `Sitemap:` line.

- [ ] **3. Give offer pages their own OG image (SEO-03).** File: `frontend/app/oferta/[slug]/page.tsx:26-40`.
  ```diff
  + import { resolveOpenGraphImage } from '@/sanity/lib/utils';
    ...
    if (!service) return {};
  +  const ogImage = resolveOpenGraphImage(service.heroImage);
    return {
      title: `${service.title} — Complex`,
      description: service.seoDescription ?? undefined,
  +    openGraph: { images: ogImage ? [ogImage] : [] },
    };
  ```
  Verify: Facebook Sharing Debugger (or view-source) on `/oferta/tarasy-drewniane` shows that offer's own hero photo as `og:image`, not the generic site default.

- [ ] **4. Remove `@tailwindcss/typography` (unused).** File: `frontend/package.json`. Not registered via `@plugin` anywhere in `globals.css`, no `prose` class used anywhere. `npm uninstall @tailwindcss/typography --workspace=frontend`. Verify: `npm run build` still succeeds, `git diff frontend/package.json frontend/package-lock.json` shows only the removal.

- [ ] **5. Remove `autoprefixer` (unused).** File: `frontend/package.json`. Not referenced in `postcss.config.mjs` — Tailwind v4's `@tailwindcss/postcss` handles vendor prefixing internally. `npm uninstall autoprefixer --workspace=frontend`. Verify: `npm run build` succeeds; spot-check compiled CSS still has vendor prefixes where needed (Tailwind v4/Lightning CSS handles this natively).

- [ ] **6. Remove `date-fns` (unused).** File: `frontend/package.json`. Zero imports anywhere in `frontend/`. `npm uninstall date-fns --workspace=frontend`. Verify: `npm run build` succeeds.

- [ ] **7. Remove `@sanity/uuid` (unused).** File: `frontend/package.json`. Zero imports anywhere in `frontend/`. `npm uninstall @sanity/uuid --workspace=frontend`. Verify: `npm run build` succeeds.

- [ ] **8. Remove `sanity-image` (unused).** File: `frontend/package.json`. Zero imports; the app already uses `@sanity/image-url` + `next/image` correctly everywhere. `npm uninstall sanity-image --workspace=frontend`. Verify: `npm run build` succeeds.

- [ ] **9. Move `sanity` to devDependencies (CODE-02).** File: `frontend/package.json`. Only used via the CLI in the `sanity:typegen` script, never imported by app code. Verify: `npm run sanity:typegen` and `npm run build` still succeed after moving it.

- [ ] **10. Add explicit `server-only` dependency (CODE-01).** `npm install server-only --workspace=frontend`. Currently `frontend/sanity/lib/token.ts:1` imports it while relying on an undocumented internal alias from `next`'s own dependency tree. Verify: `ls frontend/node_modules/server-only` resolves; `npm run build` and `npm run type-check` pass.

- [ ] **11. Add Organization JSON-LD (SEO-02).** File: `frontend/app/layout.tsx` (or a new small component rendered from it), sourcing name/address/phone from the already-fetched `footer`/`settings` data. Verify: Google Rich Results Test / `curl` + JSON.parse the `<script type="application/ld+json">` block, confirm it validates against schema.org `Organization`.

Items 4–10 can ship together as one dependency-hygiene commit; items 1–3 and 11 are separate, content/behavior-affecting changes and should be their own commits per the project's "one feature/fix per commit" convention.

---

## 2. Phased roadmap

### Phase 1 — Quick wins (a day or less)
All 11 items in §1 above. No dependencies between them; items 4–10 (`package.json` edits) can land in one PR, items 1, 2, 3, 11 as separate small PRs. Expected outcome: smaller install footprint, correctly-formatted images at the CDN layer, a real `robots.txt`, per-offer social previews, and baseline structured data — all with zero architectural risk.

### Phase 2 — High impact (image polish + measurement)
- **LQIP blur placeholders (PERF-02)**: add `"lqip": asset->metadata.lqip` to image projections in `frontend/sanity/lib/queries.ts`, thread through section types, wire `placeholder="blur"` on hero/gallery `next/image` usages first. Effort: M. Depends on: nothing (independent of Phase 1).
- **Install `@next/bundle-analyzer`** in `frontend/` and wire `ANALYZE=true npm run build` to actually produce output (currently a no-op — see AUDIT.md §2). Effort: S. This unblocks real measurement for Phase 3's GSAP work.
- **Resolve DATA-01** (draft-mode static/dynamic verification): drive a real Presentation-tool preview session, confirm draft content actually appears vs. a stale static shell. Effort: S (verification only, fix TBD based on outcome). Do this before Phase 3 if the GSAP refactor is prioritized, since it touches the same root layout.

Expected outcome: real numbers to point Phase 3 at, smoother perceived image loading, and a resolved question mark on draft-mode correctness.

### Phase 3 — Structural (architecture, needs a plan)
- **GSAP client-boundary refactor (PERF-03)**: introduce a dedicated `<AnimateIn>`-style client wrapper so `'use client'` scopes down to just the animated element rather than entire sections like `HeroSection.tsx`. Touches the animation pattern across ~26 files. Effort: L. Depends on: Phase 2's bundle analyzer being in place first, so the win is measurable before and after.
- Re-run the dependency audit after Phases 1–2 land, since removing unused packages and adding new ones (bundle-analyzer, server-only) changes the dependency graph.

Expected outcome: a measured, justified reduction in client JS for the homepage's LCP path — or, if the analyzer shows GSAP's cost is already small, a documented decision to leave the current pattern alone rather than refactoring blind.

---

## 3. Metrics & targets

| Metric | Current | Target | How to measure |
|---|---|---|---|
| First Load JS per route | **Unknown** — Turbopack build doesn't print it, no analyzer installed | Establish baseline first, then keep flagship routes (`/`, `/oferta/[slug]`) under 200 kB | Install `@next/bundle-analyzer` (Phase 2); re-run `ANALYZE=true npm run build` |
| LCP (`/` hero image) | Not measured — no Lighthouse run this session | `[needs runtime verification]` | Lighthouse against a deployed preview, or Vercel's Speed Insights (`@vercel/speed-insights` is already installed and presumably collecting real-user data — check the Vercel dashboard directly) |
| CLS | Not measured | `[needs runtime verification]` | Same as above — the codebase already reads intrinsic image dimensions off the Sanity asset ref (`frontend/app/lib/sanityImageDimensions.ts`), so CLS from images is structurally unlikely, but unverified without a real page load |
| Indexed page count | Not measured (no robots.txt/sitemap submitted to Search Console per this audit's visibility) | All 20 indexable routes crawlable and indexed, confirmation pages correctly excluded (already working via per-page `noindex`) | Google Search Console, after Quick Win #2 ships |
| Unused dependencies | 5 confirmed (`@tailwindcss/typography`, `autoprefixer`, `date-fns`, `@sanity/uuid`, `sanity-image`) | 0 | `npx depcheck`, cross-checked manually per AUDIT.md §3.4 (depcheck alone is not reliable for CSS/config-referenced packages) |
| TypeScript errors | 0 | 0 (maintain) | `npx tsc --noEmit` |
| ESLint errors/warnings | 0 errors, 1 pre-existing warning | 0/0 (separate from this audit's scope) | `npx eslint .` |

---

## 4. Verification protocol

Run before starting any phase, and again after it lands, so improvement is provable rather than assumed:

1. **Build health** — from `frontend/`: `npm run build` (must succeed, note build time and route table), `npx tsc --noEmit` (must be clean), `npx eslint .` (must not exceed 1 pre-existing warning at `TrustSection.tsx:65`).
2. **Dependency check** — `npx depcheck`, manually cross-reference any new flags the way AUDIT.md §3.4 did (grep for actual imports before trusting a flag) rather than deleting on depcheck's say-so alone.
3. **Image format check** — after Quick Win #1: pick 3 rendered pages, inspect image `src` attributes (DevTools Network tab or view-source), confirm `auto=format` on the Sanity CDN URL.
4. **Crawlability check** — after Quick Win #2: `curl http://localhost:3000/robots.txt` (200, has `Sitemap:` line) and `curl http://localhost:3000/sitemap.xml` (200, includes all 20 indexable routes minus the 4 `noindex` confirmation pages).
5. **Structured data check** — after Quick Win #11: Google Rich Results Test on the homepage, confirm `Organization` markup validates with no errors.
6. **Social preview check** — after Quick Win #3: Facebook Sharing Debugger (or equivalent) on at least 2 of the 6 offer pages, confirm distinct `og:image` values matching each service's own hero photo.
7. **Bundle measurement** — once Phase 2's analyzer is installed: record First Load JS for `/` and `/oferta/[slug]` before and after any Phase 3 change; the GSAP refactor should only proceed if the analyzer shows a measurable win worth the L-effort risk.
8. **Windows build caveat**: stop any running `next dev` server before `next build` — a prior session hit `ENOTEMPTY` on `.next/server/app/*` when a dev server held file handles open (Windows-specific; not a code bug).
