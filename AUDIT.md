# Complex — Next.js + Sanity Load Time & SEO Audit

Audit date: 2026-08-19 · Branch: `feature/audit-nextjs-sanity` · Auditor role: senior Next.js/Sanity performance & SEO review (audit only, no application code changed).

---

## 1. Executive summary

The app is in better shape than a typical Next+Sanity site: every image goes through `next/image` (zero raw `<img>` tags), the Sanity fetching layer correctly uses the Live Content API (`sanityFetch`) instead of ad-hoc webhook-based ISR, `next/font` is used with `display: 'swap'`, stega is correctly disabled on the client used for build-time/server-action fetches, and no Sanity token ever reaches a `NEXT_PUBLIC_*` variable. TypeScript is clean and ESLint has a single pre-existing warning. The three things worth fixing first:

1. **Every Sanity-sourced image is missing `.auto('format')`** (`frontend/sanity/lib/utils.ts:12-14`). This is a single-line, single-file fix that touches every image on every page (20+ call sites) — the highest leverage-to-effort item in this audit.
2. **No `robots.ts` and no structured data exist anywhere in the codebase.** The site has a working, well-built `sitemap.ts` but nothing tells crawlers where to find it, and there is zero JSON-LD for a business with a real address and showroom — both are supportable, cheap wins.
3. **Bundle weight cannot be measured from this Next 16 + Turbopack build** — the production build no longer prints a First Load JS table, and no bundle analyzer is installed. Given GSAP + `@gsap/react` are imported in 26 of the app's ~119 components (including the homepage's LCP-critical `HeroSection.tsx`), this is worth instrumenting rather than guessing about.

Five real unused dependencies were found and confirmed by direct import search (not just `depcheck`, which also flagged several false positives for CSS/PostCSS-config-only packages). No critical security issues (token leakage, stega leakage) were found — both were checked and are handled correctly by the existing code.

---

## 2. Baseline

### Versions (measured from `package.json` / build output)

| | |
|---|---|
| Next.js | `16.2.7` (Turbopack build) |
| React | `19.2.7` |
| Router | App Router only (no Pages Router files found) |
| TypeScript | `5.9.3`, `strict: true` |
| Sanity Studio | `5.31.1` (separate `studio/` workspace, not embedded in `frontend/`) |
| `next-sanity` | `13.0.8` |
| Deployment | Vercel (`@vercel/speed-insights` installed; `vercel.json` present in `frontend/`) |
| Package manager | npm workspaces (`frontend/`, `studio/`) |

### Route table (measured — `npm run build`, 2026-08-19)

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/draft-mode/enable
├ ○ /dziekujemy-kontakt
├ ○ /o-nas
├ ○ /oferta
├ ● /oferta/[slug]
│ ├ /oferta/tarasy-drewniane
│ ├ /oferta/schody-modulowe
│ ├ /oferta/tarasy-gresowe
│ └ [+3 more paths]
├ ○ /realizacje
├ ƒ /sitemap.xml
├ ○ /tarasy
├ ○ /wycena
├ ○ /wycena/schody
├ ○ /wycena/schody/przeslany-formularz
├ ○ /wycena/taras
├ ○ /wycena/taras/przeslany-formularz
├ ○ /wycena/zadaszenie
├ ○ /wycena/zadaszenie/przeslany-formularz
├ ○ /wycena/zaluzje
└ ○ /wycena/zaluzje/przeslany-formularz

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

17 of 20 routes are fully static or SSG. The two dynamic routes are legitimately dynamic: `/api/draft-mode/enable` (a draft-mode toggle endpoint) and `/sitemap.xml` (reads `next/headers` to build absolute URLs only when `NEXT_PUBLIC_SITE_URL` isn't set — see `frontend/app/sitemap.ts:29-40`, a deliberately-guarded pattern, not a bug).

**⚠️ No First Load JS / route size table.** Next 16's Turbopack build output (see full log in Appendix) does not print the classic per-route JS-weight table that Next's webpack builds produced. `ANALYZE=true npm run build` was attempted; no `@next/bundle-analyzer` (or equivalent) is installed in either workspace, so it has no effect. As a rough proxy, `frontend/.next/static` totals **3.1 MB**, with the largest single chunk at **773 KB** (unminified build id, cannot be attributed to a specific route without an analyzer). **[needs runtime verification]** — install `@next/bundle-analyzer` or use Chrome DevTools Coverage / Lighthouse against a deployed preview to get real per-route numbers.

### Tooling run (measured)

| Command | Result |
|---|---|
| `npm run build` (frontend) | ✅ Compiled successfully in ~30-36s, 26/26 static pages generated, 0 errors |
| `npx tsc --noEmit` (frontend) | ✅ Clean, exit code 0 |
| `npx eslint .` (frontend) | 1 warning, 0 errors — `react-hooks/exhaustive-deps` at `frontend/app/components/sections/TrustSection.tsx:65` (pre-existing, documented in `context/current-feature.md` history) |
| `npx depcheck` (frontend) | See §3.4 — several real hits, several false positives (depcheck doesn't parse `.mjs` config files or CSS `@import`/`@plugin`) |
| `ANALYZE=true npm run build` | No effect — no bundle analyzer installed |

`depcheck` was installed on the fly via `npx` (not added to `package.json`) — the only package installed during this audit, as permitted for analysis tooling.

---

## 3. Findings

### Performance

| Field | |
|---|---|
| **ID** | PERF-01 |
| **Severity** | Medium |
| **Effort** | XS |
| **Location** | `frontend/sanity/lib/utils.ts:12-14` |
| **What's wrong** | `urlForImage()` — the single helper every image URL in the app is built through — never calls `.auto('format')`. Every Sanity CDN image request is served in its original upload format (JPEG/PNG). |
| **Why it matters** | `next/image` re-encodes through `/_next/image` regardless, so browsers still get WebP today — this is not a "browsers get unoptimized images" bug. But Next's optimizer has to fetch and transform the larger original-format source on every cache miss, and Sanity's own CDN would do the WebP/AVIF conversion for free at the origin, shrinking what Next has to download and process. Because the fix is in one shared helper, it upgrades all 20+ call sites at once. |
| **Fix** | ```ts\nexport function urlForImage(source: SanityImageSource) {\n  return builder.image(source).auto('format');\n}\n``` |
| **Verify** | Rebuild, inspect a rendered `<img>` `src` (or `curl -I` the Sanity CDN URL directly) and confirm the query string includes `auto=format`. |

| Field | |
|---|---|
| **ID** | PERF-02 |
| **Severity** | Low |
| **Effort** | M |
| **Location** | All `urlForImage(...)` call sites, e.g. `frontend/app/components/sections/HeroSection.tsx:66`, `frontend/app/components/sections/ProjectsGrid.tsx:21`, `frontend/app/components/offer/OfferGallery.tsx` |
| **What's wrong** | Zero occurrences of `placeholder="blur"` or any LQIP usage in the codebase (`rg 'placeholder=.blur\|lqip'` → no matches). Sanity's asset pipeline provides `metadata.lqip` per image via `asset->`, but no GROQ query dereferences it. |
| **Why it matters** | Images pop in abruptly instead of fading from a blurred placeholder. Not a CLS issue here (dimensions are already read off the asset ref in `frontend/app/lib/sanityImageDimensions.ts`, and `fill` containers have fixed dimensions), so this is a perceived-loading-polish item, not a Core Web Vitals fix. |
| **Fix** | Add `"lqip": asset->metadata.lqip` to the relevant image projections in `frontend/sanity/lib/queries.ts`, thread it through the section types, and pass `placeholder="blur" blurDataURL={lqip}` on the highest-value `next/image` usages (hero, gallery grids) first. |
| **Verify** | Network tab: confirm a blurred placeholder paints before the full image on a throttled connection. |

| Field | |
|---|---|
| **ID** | PERF-03 |
| **Severity** | Medium |
| **Effort** | L |
| **Location** | `frontend/app/components/sections/HeroSection.tsx:1` (and 25 other files — `rg "from '@gsap/react'"` / `rg "from 'gsap'"`) |
| **What's wrong** | 26 of ~119 app components are `'use client'` solely to run a GSAP scroll/entrance animation (`useGSAP`), including `HeroSection.tsx` — the homepage's LCP element. The entire component's markup (headline, CTAs, stat cards) is bundled as a client component rather than just the animated wrapper. |
| **Why it matters** | This is a deliberate, spec-driven pattern (project-overview.md calls for "scroll-triggered entrance animations" everywhere), not an oversight, so it isn't a quick fix — but it is the single biggest unmeasured contributor to client JS weight (gsap + @gsap/react ship on nearly every route), and it's the reason PERF's "no bundle table" gap in §2 actually matters. |
| **Fix** | Not a quick win. A structural pattern would isolate the GSAP scope into a small dedicated client wrapper (e.g. `<AnimateIn>`) that takes server-rendered children as `props.children`, so only the wrapper — not the section's full markup — needs `'use client'`. This is an L-effort change across the animation system, not a single-file fix. |
| **Verify** | Once `@next/bundle-analyzer` is installed (see Assumptions), compare gsap's bundle contribution before/after. |

**Unused dependencies (quick wins — see full list in §3.4 and OPTIMIZATION-PLAN.md).**

### SEO

| Field | |
|---|---|
| **ID** | SEO-01 |
| **Severity** | Medium |
| **Effort** | XS |
| **Location** | `frontend/app/` (no `robots.ts`); `frontend/public/` (no `robots.txt`) |
| **What's wrong** | No robots file exists at all — confirmed via `Glob` for both `app/robots.ts` and `public/robots.txt`. |
| **Why it matters** | Search engines default to crawl-everything without an explicit file, so this isn't a site-wide-noindex emergency — but there's no explicit `Sitemap:` declaration pointing crawlers at the already-well-built `sitemap.xml`, and no way to formally exclude non-indexable paths (`/api/*`, the `przeslany-formularz` confirmation pages, which already correctly self-exclude via per-page `robots: { index: false, follow: false }` metadata, e.g. `frontend/app/wycena/taras/przeslany-formularz/page.tsx:9`). |
| **Fix** | ```ts\nimport { MetadataRoute } from 'next';\nimport { resolveSiteUrl } from '@/app/lib/siteUrl';\n\nexport default function robots(): MetadataRoute.Robots {\n  const baseUrl = resolveSiteUrl({ configuredUrl: process.env.NEXT_PUBLIC_SITE_URL });\n  return {\n    rules: { userAgent: '*', allow: '/' },\n    sitemap: `${baseUrl}/sitemap.xml`,\n  };\n}\n``` (adjust to whatever `resolveSiteUrl` actually accepts — see `frontend/app/lib/siteUrl.ts`) |
| **Verify** | `curl http://localhost:3000/robots.txt` after `next build && next start`; confirm it 200s and includes a `Sitemap:` line. |

| Field | |
|---|---|
| **ID** | SEO-02 |
| **Severity** | Medium |
| **Effort** | S |
| **Location** | Entire codebase — `rg "application/ld\+json"` → no matches |
| **What's wrong** | No structured data anywhere. The site has real `LocalBusiness`-supporting content: a physical address and showroom map (`frontend/app/components/sections/ContactShowroom.tsx`), phone/email in `footer` (`studio/src/schemaTypes/objects/footer.ts:114-134`). |
| **Why it matters** | `Organization`/`LocalBusiness` JSON-LD is a well-supported, low-risk win for local-search and knowledge-panel eligibility. Do **not** add `Product` or `FAQPage` markup — nothing on the current pages supports those schema types (no pricing shown per-item, no FAQ content found). |
| **Fix** | Add a JSON-LD `<script type="application/ld+json">` in `frontend/app/layout.tsx` (or a dedicated component) sourcing `Organization` fields from the `footer`/`settings` singletons that are already fetched. |
| **Verify** | Google's Rich Results Test against the rendered HTML, or `curl` the page and confirm the `<script type="application/ld+json">` block parses as valid JSON matching schema.org's `Organization` shape. |

| Field | |
|---|---|
| **ID** | SEO-03 |
| **Severity** | Low |
| **Effort** | S |
| **Location** | `frontend/app/oferta/[slug]/page.tsx:26-40` |
| **What's wrong** | `generateMetadata` for the 6 offer pages sets only `title` and `description`. No `openGraph.images` override and no `alternates.canonical`. All 6 pages therefore share the single generic site OG image from the root layout instead of their own `heroImage` — which the query already fetches (`serviceBySlugQuery` in `frontend/sanity/lib/queries.ts:145`) but `generateMetadata` doesn't use. |
| **Why it matters** | Social shares of any of the 6 offer pages (e.g. a link to "Zadaszenia tarasowe" posted on Facebook) show the same generic preview image instead of that offer's own hero photo, weakening click-through from shares. |
| **Fix** | ```ts\nimport { resolveOpenGraphImage } from '@/sanity/lib/utils';\n// inside generateMetadata, after fetching `service`:\nconst ogImage = resolveOpenGraphImage(service.heroImage);\nreturn {\n  title: `${service.title} — Complex`,\n  description: service.seoDescription ?? undefined,\n  openGraph: { images: ogImage ? [ogImage] : [] },\n};\n``` (the `resolveOpenGraphImage` helper already exists and is used identically in `frontend/app/layout.tsx:33`) |
| **Verify** | View source / Facebook Sharing Debugger on `/oferta/tarasy-drewniane`; confirm `og:image` points at that service's own hero photo. |

### Sanity & data

| Field | |
|---|---|
| **ID** | DATA-01 |
| **Severity** | Medium |
| **Effort** | — (investigation, not a code fix) |
| **Location** | `frontend/app/layout.tsx:75` |
| **What's wrong** | The root layout calls `await draftMode()` — a dynamic API that reads cookies — on every route in the app. The generic rule of thumb is that this forces the whole subtree out of static rendering. |
| **Why it matters** | The measured build output contradicts the generic rule: `/`, `/o-nas`, `/oferta`, `/realizacje`, `/tarasy`, `/wycena/*` all still show as `○ (Static)` in §2's route table, not `ƒ (Dynamic)`. Next 16 appears to be prerendering the non-draft shell statically regardless of the `draftMode()` read. **[needs runtime verification]**: confirm that visiting a route with an active Sanity Presentation draft-mode session actually serves live draft content and not a cached static shell. Verify by: hitting `/api/draft-mode/enable` with a valid Sanity preview token, then loading `/` and confirming an intentionally-changed-but-unpublished field appears. |
| **Fix** | N/A until verified — if draft mode turns out to serve stale static output, the fix is scoping the draft-mode check lower in the tree (e.g., a client-side check) rather than in the root layout. |
| **Verify** | See "What's wrong" — this is the verification step itself. |

**Checked and confirmed correct (no finding needed):**
- **Stega**: `frontend/sanity/lib/client.ts:13` passes `stega: { studioUrl }` with no `enabled` key. Traced into `@sanity/client`'s `defaultConfig.stega = { enabled: false }` (`node_modules/@sanity/client/dist/_chunks-es/config.js:128`) — stega is off by default on this client, and every `client.fetch()` call site (`sitemap.ts`, `generateStaticParams`, the two server actions that call `client.fetch`) uses this client, not `sanityFetch`. No stega leakage into sitemap URLs, static params, or emailed form-config strings.
- **Token leakage**: `SANITY_API_READ_TOKEN` / `SANITY_API_WRITE_TOKEN` are correctly server-only; no `NEXT_PUBLIC_*` variable holds a secret (checked `.env.example`, `.env.local` variable names, and every `process.env.NEXT_PUBLIC_*` read in `frontend/sanity/lib/api.ts`).
- **`apiVersion`**: pinned to a date string (`'2025-09-25'`, `frontend/sanity/lib/api.ts:27`), not `'v1'` or floating.
- **Studio isolation**: Studio lives in the separate `studio/` npm workspace with its own `sanity dev`/`sanity build` scripts — not embedded as a route inside `frontend/`. No `/studio` route exists in `frontend/app`, so there is no Studio-in-public-bundle risk to check.
- **Typegen**: in active use (`frontend/package.json` `predev`/`prebuild` hooks run `sanity:typegen`), confirmed by a clean `npm run build` regenerating `frontend/sanity.types.ts` from `sanity.schema.json`.
- **`useCdn: true`** on the shared client (`frontend/sanity/lib/client.ts:10`) is correct for published-content reads; preview/draft paths go through `sanityFetch`'s live mechanism instead, which is the intended split.
- **GROQ projections on list/detail queries** are already explicit and narrow — `allProjectsQuery`, `featuredProjectsQuery`, `serviceBySlugQuery`, `allServicesQuery`, `terraceServicesQuery`, `galleryProjectsByCategoryQuery` (all in `frontend/sanity/lib/queries.ts`) select specific fields, not bare `*`/`...`. The ~17 singleton section queries (`heroQuery`, `trustQuery`, `settingsQuery`, etc.) *are* un-projected `*[_type=="x"][0]`, but each backs a single-purpose page-section schema with only a handful of fields (e.g. `settings` has 3 top-level fields — checked directly in `studio/src/schemaTypes/singletons/settings.tsx`) — not a meaningful over-fetch, so this is **not** flagged as a finding.
- **No webhook-driven ISR revalidation route exists** (no `/api/revalidate`) — this looks like a gap per the generic checklist, but it isn't: the app uses `next-sanity`'s Live Content API (`<SanityLive>` in `frontend/app/layout.tsx:90`) instead of the older webhook+`revalidateTag` pattern, which is Sanity's current recommended approach and explains why routes are static yet content still updates live.

### Code health

| Field | |
|---|---|
| **ID** | CODE-01 |
| **Severity** | Low |
| **Effort** | XS |
| **Location** | `frontend/sanity/lib/token.ts:1` |
| **What's wrong** | `import 'server-only'` with no `server-only` entry in `frontend/package.json` (dependencies or devDependencies) and no copy of the package anywhere in `node_modules`. |
| **Why it matters** | The build succeeds today only because `next` itself declares `server-only` as its own internal dependency (`node_modules/next/package.json:326`) and Next's bundler has special resolution for it — this is undocumented, implicit behavior to rely on. If this file (or anything importing it) were ever pulled into a non-Next context — a script, a different test runner — resolution would fail. `frontend/vitest.config.ts` currently only includes `app/**/*.test.ts`, so no test hits this today, but it's one config change away from breaking. |
| **Fix** | `npm install server-only --workspace=frontend` (it's a ~0-byte marker package; safe, explicit). |
| **Verify** | `ls frontend/node_modules/server-only` resolves; `npm run build` and `npm run type-check` still pass. |

| Field | |
|---|---|
| **ID** | CODE-02 |
| **Severity** | Low |
| **Effort** | XS |
| **Location** | `frontend/package.json` (`dependencies`) |
| **What's wrong** | `sanity` (the full Studio package) is listed under `dependencies`, not `devDependencies`, even though `rg "from 'sanity'"` across `frontend/app` and `frontend/sanity` returns zero matches — it's only invoked via the CLI in the `sanity:typegen` script. |
| **Why it matters** | Doesn't bloat the actual browser bundle (nothing imports it), but misrepresents what's needed at runtime vs. build/dev time, and inflates any tooling that reads `dependencies` to decide what ships. |
| **Fix** | Move `sanity` from `dependencies` to `devDependencies` in `frontend/package.json`. |
| **Verify** | `npm run sanity:typegen` and `npm run build` still succeed after the move. |

### §3.4 — Dependency audit detail (depcheck + manual verification)

`depcheck` flagged 9 packages as unused. Each was independently verified with a direct import/reference search before being trusted (`depcheck` cannot parse `.mjs` config files or CSS `@import`/`@plugin` directives, which produces false positives):

| Package | depcheck says | Manual check | Verdict |
|---|---|---|---|
| `@tailwindcss/typography` | unused | `rg "typography\|prose"` in `globals.css` and `app/**/*.tsx` → no matches, no `@plugin` registration | **Real — unused** |
| `autoprefixer` | unused | `postcss.config.mjs` only registers `@tailwindcss/postcss`; no `autoprefixer` plugin entry | **Real — unused** |
| `date-fns` | unused | `rg "from 'date-fns"` across `frontend/` → no matches | **Real — unused** |
| `@sanity/uuid` | unused | `rg "from '@sanity/uuid"` across `frontend/` → no matches | **Real — unused** |
| `sanity-image` | unused | `rg "from 'sanity-image"` across `frontend/` → no matches (superseded by `@sanity/image-url` + `next/image`, used correctly elsewhere) | **Real — unused** |
| `@tailwindcss/postcss` | unused | Registered in `postcss.config.mjs:3` | **False positive — keep** |
| `tailwindcss` | unused | `@import 'tailwindcss'` in `globals.css:1` | **False positive — keep** |
| `postcss` | unused | Required by the postcss pipeline itself (`postcss.config.mjs`) | **False positive — keep** |
| `@types/react-dom` (dev) | unused | No direct import expected for a `@types` package; ambient types used implicitly by `react-dom` — low-confidence flag, not acted on without stronger signal | **Inconclusive — see Assumptions** |

Also found independent of `depcheck`: **`server-only` missing** (CODE-01) and **`sanity` misclassified** (CODE-02), both above.

---

## 4. Assumptions & blockers

- **No First Load JS table**: Next 16's Turbopack build output doesn't print one, and no bundle analyzer is installed in either workspace. Per audit rules, no package was installed to work around this beyond `depcheck` (explicitly permitted analysis tooling). Recommend installing `@next/bundle-analyzer` as a first Phase-3 step — see OPTIMIZATION-PLAN.md.
- **Draft-mode static/dynamic behavior (DATA-01)** could not be verified without driving a real Presentation-tool preview session against a running server and comparing draft vs. published output. Exact verification steps are given in the finding.
- **Lighthouse / Core Web Vitals**: not run. This audit had no headless browser available. Every performance claim in §3 is either a static-analysis fact (grep/read evidence) or explicitly labeled `[needs runtime verification]` — no Core Web Vitals numbers are invented anywhere in this report, per the operating rules.
- **`@types/react-dom` unused-dependency flag**: not acted on. `@types/*` packages are consumed ambiently by the TypeScript compiler, not via explicit imports, so a plain `rg` import search isn't a reliable signal either way for this one package. Left as inconclusive rather than guessed.
- **`.next/static` chunk sizes** (3.1 MB total, 773 KB largest chunk) are a rough proxy only — chunk filenames are content-hashed with no readable route attribution, so this number cannot be broken down per-route without an analyzer.
- This audit covers the site as it exists today (20 routes: home, offer index + 6 detail pages, 4 quotation forms + confirmations, realizacje, o-nas, tarasy). The original `context/project-overview.md` spec describes additional routes (`/konfigurator`, `/wizualizacja`, `/kontakt`, `/kierownik-budowy`) that don't exist in the current build — not treated as findings, since they're simply not built yet.

---

## 5. Appendix

### Full `npm run build` output

```
> prebuild
> sanity typegen generate
✔ Config loaded from sanity.cli.ts
✔ Schema loaded from ../sanity.schema.json
✔ Successfully generated types to C:/Users/borde/Desktop/complex/frontend/sanity.types.ts in 7498ms
  └─ 29 queries and 59 schema types
  └─ found queries in 1 file after evaluating 7 files

> build
> next build

▲ Next.js 16.2.7 (Turbopack)
- Environments: .env.local

  Creating an optimized production build ...
✓ Compiled successfully in 29.7s
  Running TypeScript ...
  Finished TypeScript in 26.1s ...
  Collecting page data using 7 workers ...
✓ Generating static pages using 7 workers (26/26) in 4.5s
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/draft-mode/enable
├ ○ /dziekujemy-kontakt
├ ○ /o-nas
├ ○ /oferta
├ ● /oferta/[slug]
│ ├ /oferta/tarasy-drewniane
│ ├ /oferta/schody-modulowe
│ ├ /oferta/tarasy-gresowe
│ └ [+3 more paths]
├ ○ /realizacje
├ ƒ /sitemap.xml
├ ○ /tarasy
├ ○ /wycena
├ ○ /wycena/schody
├ ○ /wycena/schody/przeslany-formularz
├ ○ /wycena/taras
├ ○ /wycena/taras/przeslany-formularz
├ ○ /wycena/zadaszenie
├ ○ /wycena/zadaszenie/przeslany-formularz
├ ○ /wycena/zaluzje
└ ○ /wycena/zaluzje/przeslany-formularz

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses generateStaticParams)
ƒ  (Dynamic)  server-rendered on demand
```

### `npx eslint .`

```
frontend\app\components\sections\TrustSection.tsx
  65:6  warning  React Hook useEffect has missing dependencies: 'parsed' and 'start'. Either include them or remove the dependency array  react-hooks/exhaustive-deps

✖ 1 problem (0 errors, 1 warning)
```

### `npx depcheck` (raw)

```
Unused dependencies
* @sanity/uuid
* @tailwindcss/postcss
* @tailwindcss/typography
* autoprefixer
* date-fns
* postcss
* sanity-image
* tailwindcss
Unused devDependencies
* @types/react-dom
Missing dependencies
* server-only: .\sanity\lib\token.ts
```
(See §3.4 for which of these are real vs. false positives, verified by direct search.)

### Route inventory (all 20 routes, with rendering mode from the build)

| Route | Mode |
|---|---|
| `/` | Static |
| `/_not-found` | Static |
| `/api/draft-mode/enable` | Dynamic |
| `/dziekujemy-kontakt` | Static |
| `/o-nas` | Static |
| `/oferta` | Static |
| `/oferta/[slug]` (×6: tarasy-drewniane, schody-modulowe, tarasy-gresowe, +3 more) | SSG |
| `/realizacje` | Static |
| `/sitemap.xml` | Dynamic |
| `/tarasy` | Static |
| `/wycena` | Static |
| `/wycena/schody`, `/wycena/taras`, `/wycena/zadaszenie`, `/wycena/zaluzje` | Static |
| `/wycena/schody/przeslany-formularz`, `/wycena/taras/przeslany-formularz`, `/wycena/zadaszenie/przeslany-formularz`, `/wycena/zaluzje/przeslany-formularz` | Static |
