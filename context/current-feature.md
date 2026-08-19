# Current Feature

## Status

Not Started

## Goals

<!-- Populated by /feature load -->

## Notes

<!-- Populated by /feature load -->

## History

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
