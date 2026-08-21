# Current Feature: Client Feedback — Round 8

## Status

In Progress

## Goals

- **#1 Tarasy Drewniane brands** — content-only, no code change. Confirmed `tarasy-drewniane.brands`
  is `null` and the generic `OfferBrands`/`BrandItem`/`VariantGrid` components already render it
  correctly once populated. ⚠️ Blocked on client (she adds 3 `brand` entries + wood descriptions in
  Studio herself). Nothing to implement.
- **#2 "goliatgres.pl" → bold link to Goliat's site** — add optional `linkText` (string) and
  `linkUrl` (url) fields to the shared `benefit` object in
  `studio/src/schemaTypes/documents/service.ts:184-211`; update
  `frontend/app/components/offer/OfferBenefits.tsx:108-110` to render the matched substring as a
  bold, underlined, new-tab link when both fields are set, falling back to plain text otherwise. Set
  `linkText: "goliatgres.pl"` / `linkUrl: "https://goliatgres.pl"` on `tarasy-gresowe`'s `b3` benefit.
  Requires `sanity:typegen` + Studio redeploy.
- **#3 Taras quotation form material labels** — in
  `frontend/app/components/forms/TarasForm.tsx:32-33`, `MATERIAL_OPTIONS`: drop the parenthetical —
  `'Thermo Jesion (Termojesion)'` → `'Thermo Jesion'`, `'Thermo Sosna (Thermososna)'` → `'Thermo
  Sosna'`. No schema/validation impact (`material` is a free string).
- **#4 Kontakt "Biuro" description bold** — add `font-bold` to the `officeDescription` `<p>` in
  `frontend/app/components/sections/ContactShowroom.tsx:134` (the "Biuro" heading above it is already
  bold). Styling only, no CMS/content change.
- **#5 Hero subheadline contrast** — swap `text-silver` → `text-white/80` on the description text in
  4 files: `HeroSection.tsx:98` (also drop the dead `/110` opacity leftover on `text-silver/110`),
  `OfferHero.tsx:79`, `AboutHero.tsx:50`, `ProjectsGrid.tsx:120-121`. Do **not** touch
  `ProjectsGrid.tsx:53`'s card caption or any other secondary/metadata text — scoped to
  hero-adjacent descriptions only.

## Notes

Spec: `context/features/feedback-round-8-spec.md`. Five independent, low-risk items from a redlined
PDF (`19.08.pdf`, 19.08.2026) plus one chat follow-up (item #5, not in the PDF) — no item touches
another's files, so they can land in one branch/commit set or be split, either works.

- Only item #2 touches schema → `cd frontend && npm run sanity:typegen` after the `service.ts`
  edit, and `npm run deploy` from `studio/` so the client can see the new fields.
- No new server actions/utilities → no new Vitest coverage needed (per spec's own "Tests" section).
- Item #1 is content-only and blocked on the client (wood descriptions + images) — nothing to build;
  don't invent placeholder brand entries.
- Item #5's exact opacity value is an assumption (`text-white/80`); spec flags `/90` as the fallback
  if the client wants it closer to pure white — a one-word swap after she sees it live, not worth
  blocking on.
- Verification checklist (from spec): `npm test`, `npm run type-check` (both workspaces), `npm run
  lint`, clean `next build` after `rm -rf .next`; in-browser checks for the Goliat link, the taras
  form dropdown + lead email label, Biuro bold text, Tarasy Drewniane still rendering null brands
  (not a bug), and hero description contrast on Home/an offer subpage/O nas/Realizacje. Do not
  actually send a quotation/contact form through Resend outside a controlled test.

## History

### Next.js + Sanity Load Time & SEO Audit (2026-08-19)

Audit-only pass (no application code changed) producing `AUDIT.md` and `OPTIMIZATION-PLAN.md` at the
repo root. Spec: `context/features/audit-nextjs-sanity-spec.md`. Branch `feature/audit-nextjs-sanity`
(deliverables not yet committed/merged as of this entry — the branch carries forward into the
follow-up "Implement Quick Wins from Audit" feature above, which acts on this audit's findings).

- Recon: Next 16.2.7 (Turbopack) / React 19.2.7 / App Router only, npm-workspaces monorepo. `npm run
  build` succeeded (20 routes, 17 static/SSG, 2 legitimately dynamic), `tsc --noEmit` clean, `eslint`
  1 pre-existing warning, `depcheck` installed on the fly via `npx` (only package installed, as
  permitted for analysis tooling).
- **`depcheck`'s output was not trusted at face value** — it can't parse `.mjs` config files or CSS
  `@import`/`@plugin`, so it flagged `tailwindcss`/`@tailwindcss/postcss`/`postcss` as unused when
  they're genuinely wired up in `postcss.config.mjs`/`globals.css`. Each flag was independently
  verified with a direct import grep before being trusted; 5 came back genuinely unused
  (`@tailwindcss/typography`, `autoprefixer`, `date-fns`, `@sanity/uuid`, `sanity-image`).
- **Traced `@sanity/client`'s actual source** (`node_modules/@sanity/client/dist/_chunks-es/config.js`)
  rather than guessing whether stega leaks into production — confirmed `defaultConfig.stega =
  {enabled: false}`, so the base `client` (used for `client.fetch()` in `sitemap.ts`,
  `generateStaticParams`, and two server actions) has stega off since `frontend/sanity/lib/client.ts`
  never sets `enabled: true`. No stega leak.
- **One finding deliberately downgraded from the generic checklist's assumption**: the root layout
  calls `draftMode()` (`frontend/app/layout.tsx:75`), which the audit spec's checklist treats as
  automatically forcing dynamic rendering — but the measured build output shows `/` and other routes
  still prerendering as static (○), contradicting that assumption. Flagged as `[needs runtime
  verification]` (DATA-01) rather than asserted as broken, with exact steps to verify via a real
  Presentation-tool draft session.
- **One finding scoped down after checking the actual schema**, not left as a generic "add
  projections" note: the ~17 un-projected singleton section queries in `sanity/lib/queries.ts`
  looked like classic over-fetching, but checking `studio/src/schemaTypes/singletons/settings.tsx`
  directly showed the `settings` doc has only 3 top-level fields — not a meaningful over-fetch, so
  this was explicitly *not* reported as a finding (operating rule: don't recommend something that
  isn't actually a problem).
- **GSAP found in 26 of ~119 components** (including the homepage's LCP-critical `HeroSection.tsx`)
  via `'use client'` + `@gsap/react` grep — reported as one aggregate Phase-3 structural finding
  (PERF-03) rather than 26 individual line items, since it's a deliberate, spec-driven animation
  pattern (project-overview.md calls for scroll-triggered entrance animations everywhere), not 26
  separate mistakes.
- ⚠️ **No bundle size data available**: Next 16's Turbopack build no longer prints a First Load JS
  table, and no `@next/bundle-analyzer` is installed in either workspace. `ANALYZE=true npm run
  build` was attempted per the spec and confirmed to have no effect. `.next/static` totals were used
  as a rough proxy (3.1 MB, largest chunk 773 KB) but flagged as unattributable to specific routes
  without an analyzer — recommended as a Phase 2 prerequisite before the GSAP refactor.
- No Lighthouse/Core Web Vitals numbers were run or invented — every performance claim is either
  grep/read evidence or explicitly labeled `[needs runtime verification]`.
- 11 quick wins produced (not padded to a round number) — see `OPTIMIZATION-PLAN.md` §1, now the
  goal list for the follow-up feature above.

### Multiple Variants per Board Type — Tarasy accordion (2026-08-19)

Replaced the offer-page Producenci/brands accordion's 1-panel = 1-image/1-spec-list model with a
per-panel **flat responsive grid of variants**, eliminating the "dostępne są w różnych kolorach…"
prose workaround for board types like "Deski kompozytowe komorowe". Spec:
`context/features/feedback-planks-variants-spec.md.md` (client request via WhatsApp — she rejected
one accordion entry per board type as too long a list, wants more thumbnails inside a single panel
instead; volumes ~9 for komorowe, ~5 for pełne). Branch `feature/planks-variants`. Session picked up
mid-flight: the Sanity schema/GROQ query change had already been made by a prior pass before this
session started; this session did the frontend rewrite, content migration, and — per two follow-up
requests — a component split and an accessibility pass.

- **The "Tarasy accordion" turned out to be the shared `OfferBrands`/`brands` mechanism** used on
  *every* offer page, not something Tarasy-specific — the client had repurposed the generic
  Producenci/brands section to list board types. `brand.image`/`brand.specs` moved to a new
  `brand.variants[]` (`brandVariant`: required `name`/`image`+`alt`/`specs`, optional
  `description`/`manufacturer`), matching the spec's `BoardType`/`BoardVariant` model while keeping
  the codebase's existing `brand` naming (per the spec's own "adapt naming to existing conventions"
  instruction).
- **Single-variant panels keep the old two-column large-image+specs layout with no expand
  interaction** (spec's preferred edge case); 2+ variants render a `grid-cols-[repeat(auto-fill,
minmax(160px,1fr))]` grid whose thumbnail buttons expand an inline detail region positioned after
  the clicked card's row (read via `getComputedStyle(grid).gridTemplateColumns`, recomputed on
  resize) — the image-search pattern the spec asked for, not the full-width-below-grid fallback.
- **The spec's flagged "outer accordion clips the inner detail" breakage point does not apply in
  this codebase** — verified by reading `@zag-js/accordion` source: Ark UI's `Accordion.ItemContent`
  toggles a plain `hidden` attribute with no height/max-height animation at all here. Nothing to
  clip. Closing the outer panel resets the inner grid's state via a render-time adjustment
  (comparing a tracked previous `expanded` prop, not a `useEffect` — the repo's
  `react-hooks/set-state-in-effect` rule is an error, not a warning; same lesson as the
  `ProjectLightbox` precedent from the Realizacje page).
- **Content migrated losslessly, not just for Tarasy.** Because `brands[]` is shared, the schema
  change silently affected `zadaszenia-tarasowe` (8 brands) and `akcesoria-do-zadaszen` (8 brands)
  too — their Producenci sections would have rendered empty without migration, even though the spec
  marks "changes to the zadaszenia section" out of scope (this was data preservation, not a new
  feature there; both still resolve to the pixel-identical single-variant fallback). All brand
  entries across the 3 services wrapped into one `variants[]` item each via direct Sanity mutate API
  calls (dry-run first, then applied — no pending drafts existed on any of the 3 docs, verified
  first). `tar-drazone`'s image had no `alt` under the old schema — viewed the actual asset and wrote
  a real descriptive Polish alt rather than inventing one blind.
- ⚠️ **Two pre-existing content gaps surfaced, not silently patched:** "Deski kompozytowe pełne" has
  no photo (never did — the old component rendered it specs-only) and all 8 `akcesoria-do-zadaszen`
  variants have zero specs (never populated). Both fields are now `rule.required()`/`rule.min(1)` on
  `brandVariant`, so these will show Studio validation warnings until the client fills them in.
  Frontend renders both fine regardless (graceful degrade, no visual regression) — flagged for the
  client, not invented placeholder content.
- **Accessibility:** cards are `<button>` with `aria-expanded`/`aria-controls`; detail region is
  `role="region"` with `aria-labelledby`; focus-visible rings; focus stays on the trigger on open and
  returns to it on close. **One real bug caught in the audit pass:** `Esc`-to-close was originally a
  global `window` keydown listener, so pressing Escape anywhere on the page — not just while focus
  was in the grid — would close an open detail. Rescoped to an `onKeyDown` on the grid's own wrapper
  (event bubbling), firing only when focus is actually inside the widget. Added `role="group"` +
  `aria-label="Warianty: {brand name}"` on the grid so screen readers announce the cluster as
  related. Confirmed no `<button>` carries a negative `tabIndex` — full natural tab order.
- **Component split (user request, second pass):** `OfferBrands.tsx` (~400 lines) broken into
  `brandTypes.ts` (shared `Service`/`Brand`/`Variant` types), `VariantSpecs.tsx`, `SingleVariant.tsx`,
  `VariantDetail.tsx`, `VariantGrid.tsx` (the interactive row/column/detail-state piece),
  `BrandItem.tsx` (one accordion item) — `OfferBrands.tsx` itself down to 93 lines (header +
  `Accordion.Root` + GSAP wiring). Named exports on the internal pieces, matching the
  `forms/shared/*` precedent; no existing precedent in this repo for a nested `offer/brands/`
  subfolder for private-only internals, so these stayed flat under `offer/`.
- **Styling iterated live against the running dev server per user feedback:** white card background
  → the site's glass treatment, applied as **local Tailwind utilities on the button itself**
  (`bg-bg-surface/80 backdrop-blur-xl border-white/15`) rather than the shared global `.glass`
  utility — editing that class directly would have restyled the Hero stat cards, the About card, and
  the OfferTechSpecs cards too. Added `cursor-pointer` (Tailwind Preflight resets native `<button>`
  cursor to `default`, which is why it wasn't showing).
- ⚠️ **No Playwright available this session** — verification leaned on SSR HTML instead: fetched
  rendered pages via `curl`, and for the multi-variant grid path (no live brand currently has 2+
  variants) temporarily published 2 extra test variants on `tar-drazone`, checked the markup, then
  reverted — confirmed cleanly reverted (`variantCount: 1` on both `tarasy-kompozytowe` brands, no
  `TEST` strings left published) both times this was done. **Not driven in a real browser:** the
  actual click-to-expand/collapse interaction, `Esc`-to-close + focus return, responsive behavior at
  real viewport widths, and Lighthouse/CLS measurement — reasoned through the code carefully (caught
  two real bugs this way: a filter that silently dropped imageless variants losing their specs, and
  the `aria-controls`/`insertAfter` condition initially requiring the opened card to equal the
  row-end card, which is only true when the last card of a row is the one clicked) but not visually
  confirmed interactively.
- **One Windows-specific hiccup, not a code bug:** `next build` failed with `ENOTEMPTY: directory not
  empty, rmdir '.next\server\app\tarasy'` when a `next dev` server was still running — Windows won't
  let a process delete a directory another process holds open file handles into (unlike Linux/macOS).
  Resolved by stopping the dev server before building; not a regression, same class of issue as the
  repo's prior `.next` staleness incidents.
- Verified: **172/172 Vitest** (unchanged — no new server actions/utilities, this feature is
  presentational + schema/content), `type-check` (both workspaces), `lint` (only the pre-existing
  `useCountUp` warning at `TrustSection.tsx:65`), clean `next build` after `rm -rf .next` — all offer
  routes prerender as before, 6 offer slugs still SSG.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted
  `ProjectsGrid.tsx` (Prettier/formatting-only drift, unrelated to this feature) and
  `package-lock.json`'s pre-existing 153-line drift.

### Implement Quick Wins from Audit (2026-08-21)

Acted on `OPTIMIZATION-PLAN.md` §1 (all 11 quick wins) from the audit above. Branch
`feature/audit-quick-wins` (branched off `feature/audit-nextjs-sanity`, which had zero unique
commits of its own — both `AUDIT.md`/`OPTIMIZATION-PLAN.md` and this feature's work landed together
on merge to `main`). Real code changes this time, not audit-only. Two user-requested follow-ups
happened in the same session before completing: a `sanity`/`@sanity/vision` version-skew fix in
`studio/`, and knocking out the one pre-existing ESLint warning.

- **Shipped as 4 focused commits** rather than one, per the project's "one feature/fix per commit"
  convention: (1) the audit docs, (2) dependency hygiene (5 unused-dep removals, `sanity` moved to
  devDependencies, `server-only` added explicitly, the studio version-skew fix, and a new root-level
  `allowScripts` entry — see below), (3) the 4 content/behavior quick wins (image auto-format,
  `robots.ts`, offer-page OG images, Organization JSON-LD), (4) the TrustSection lint fix.
- **`urlForImage()` getting `.auto('format')` is a one-line, one-file change that upgrades every
  image on every page** (`frontend/sanity/lib/utils.ts:12-14`) — the highest-leverage item in the
  plan, exactly as flagged in the audit.
- **The offer-page OG image fix and the Organization JSON-LD were both verified against a live
  server, not just a successful build** — curled the running `next start` output and confirmed
  `og:image` on `/oferta/tarasy-drewniane` points at that service's own hero photo (not the generic
  site default), and that the JSON-LD `<script>` block renders real business data (name, phone,
  email, address, logo) correctly passed through `stegaClean`.
- ⚠️ **The user's running `next dev`/`sanity dev` servers died twice this session from ordinary
  `npm uninstall`/`npm install` runs** — large `node_modules` churn while a dev server holds file
  handles open crashes the process outright on Windows (same family of issue as the documented
  `ENOTEMPTY` build precedent, but killing a live process instead of just blocking a build). Flagged
  to the user both times rather than silently restarting anything; a temporary `next start` was used
  for curl-based verification once, then killed afterward.
- **Follow-up bug the user caught by restarting their dev server: a `sanity`/`@sanity/vision`
  version skew in `studio/`.** Moving `frontend`'s `sanity` to devDependencies (quick win #9) let npm
  resolve and workspace-hoist a newer `sanity` core (`^5.31.2`, not the `^5.28.0` that was typed —
  npm saves the resolved version, not the literal range) into the shared root `node_modules`, while
  `studio/package.json` still pinned both `sanity` and `@sanity/vision` at `^5.31.1`, triggering
  Sanity Studio's own auto-update mismatch prompt on `npm run dev`. Fixed by bumping both together in
  `studio/` to `^5.31.2` so they stay in lockstep rather than relying on implicit hoisting.
- **Follow-up: user asked about two Vercel build warnings before committing** — investigated both
  rather than reassuring blindly. `npm warn allow-scripts` traced to a real npm v11+ supply-chain
  feature (confirmed via `npm-approve-scripts` docs and GitHub issues, since local npm `10.8.2`
  predates it and returned "Unknown command"); traced all 4 flagged packages via `npm ls` to
  legitimate transitive deps of `next`/`sanity`/`vitest`/`eslint-config-next` doing expected
  native-binary-download install scripts, then added a root-level `allowScripts` block pinning them
  (currently advisory only, but npm has said future releases will block unapproved scripts by
  default). The second warning ("Running in production environment mode") was traced by grepping the
  entire dependency tree and reading source directly to `@sanity/cli`'s `warnOnNonProductionEnvironment.js`
  (an oclif-framework warning, hence the `›` prefix) — confirmed it's Sanity CLI's own env-detection
  notice during the `prebuild` typegen step, not a Next.js/application warning, and has no effect on
  the deployed app. Couldn't fully pin down why it fired for the "production" case specifically given
  the current version's early-return guard — most likely explanation is it came from an older
  `@sanity/cli` before this session's version bump; user will confirm on the next deploy.
- **The TrustSection lint fix was a real bug fix, not a suppression.** The pre-existing
  `react-hooks/exhaustive-deps` warning's deps array (`[triggered]`) was deliberately incomplete —
  `parsed` is a fresh object literal every render, so naively adding it (as the linter suggests) would
  have restarted the count-up animation on every re-render once `triggered` was already `true`, not
  just the one time it flips. Fixed with a `hasStartedRef` guard so the effect could safely list all
  its real dependencies while still firing `start()` exactly once. `eslint .` now returns 0/0
  (previously 1 warning, present since before this session).
- Verified across the whole feature: `tsc --noEmit` clean (both workspaces), `eslint .` 0 warnings/0
  errors, `next build` succeeds (21 routes — `/robots.txt` now static), **172/172 Vitest passing**,
  and live-server curl verification for all 4 content/behavior quick wins.
- **Left untouched (same precedent as prior features):** the pre-existing uncommitted
  `ProjectsGrid.tsx`, and the typegen-regenerated `frontend/sanity.types.ts` /
  `sanity.schema.json` / `studio/sanity.types.ts` (pre-existing drift from before this session, not
  something any quick win required changing — regenerating them is a harmless side effect of running
  `npm run build`).
