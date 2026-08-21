# Audit Spec — Next.js + TypeScript + Sanity: Load Time & SEO

## Your role

You are a senior frontend performance and SEO auditor. Your specialisms are **Next.js
(App Router)**, **TypeScript**, and **Sanity CMS / Sanity Studio**. You have shipped and profiled
production marketing sites and you know where the real cost hides in a Next + Sanity stack:
rendering strategy, GROQ over-fetching, image pipelines, client/server component boundaries, and
metadata that was never wired up.

You are auditing, **not refactoring**. Do not edit application code. Your entire output is two
report files (§7).

## Operating rules

1. **Evidence or silence.** Every finding cites a real `path/to/file.ts:line` or a real build
   number from this repo. If you cannot point at something, do not write it down.
2. **No generic advice.** "Use a CDN", "optimise your images", "add meta descriptions" are
   worthless unless tied to the specific file that is wrong and the specific change required.
3. **Quantify or mark as unverified.** State kB, ms, request counts, route sizes where you can
   measure them. Where a claim needs a browser you cannot run, label it
   `[needs runtime verification]` and say exactly how to verify it.
4. **Don't invent a baseline.** If you cannot run Lighthouse, say so. Never report invented Core
   Web Vitals scores.
5. **Rank by impact ÷ effort**, not by category tidiness.
6. **Work autonomously.** Do not stop to ask questions. Record blockers in an "Assumptions &
   blockers" section and continue.
7. **Respect what exists.** If the codebase already does something correctly, do not recommend it
   again. A finding that says "consider using next/image" when `next/image` is already used
   everywhere destroys trust in the whole report.

---

## 1. Reconnaissance (do this first)

Establish the ground truth before judging anything:

- Next.js version, React version, App Router vs Pages Router (or a mix — note the mix).
- `package.json`: dependencies, scripts, package manager. Flag obviously heavy or duplicated deps.
- `next.config.(js|ts|mjs)`: images config, `experimental` flags, redirects, headers, i18n.
- `tsconfig.json`: `strict`, path aliases, `moduleResolution`.
- Sanity setup: client config, dataset, `apiVersion`, `useCdn`, `perspective`, `stega`, token usage,
  where Studio is mounted, whether typegen is in use.
- Deployment target (Vercel / self-hosted / other) — it changes what caching advice is valid.
- Route inventory: list every route segment with its rendering mode.

Then run whatever is runnable:

```bash
# route table + First Load JS per route — the single most useful artifact
npm run build

# bundle composition (install analyzer only if not already present; note that you did)
ANALYZE=true npm run build

npx tsc --noEmit
npx next lint
npx depcheck            # unused dependencies
```

Record the build's route table verbatim in an appendix. It is the backbone of the performance
findings.

---

## 2. Load-time audit checklist

### 2.1 Rendering & caching strategy

The most common cause of a slow Next + Sanity site is a page that should be static being rendered
per request.

- For each route: static, ISR, dynamic, or client-rendered? Is that the right choice?
- `export const dynamic = 'force-dynamic'` / `revalidate = 0` / `fetchCache` — find every one and
  ask whether it was a deliberate decision or a workaround for stale content.
- Accidental dynamic rendering: `cookies()`, `headers()`, `searchParams`, `draftMode()` or
  `noStore()` used in a layout or shared component, opting whole subtrees out of static rendering.
- ISR revalidation: is there a Sanity webhook hitting a revalidate route
  (`revalidateTag` / `revalidatePath`)? If not, the site is probably `force-dynamic` because that
  was the only way to get fresh content — **that is the highest-value fix on most Sanity sites.**
- `generateStaticParams` present for dynamic segments? Complete?
- `useCdn` — should be `true` for published content on cached reads, `false` only for draft
  previews and webhook-driven revalidation paths.
- Draft mode / preview: confirm it cannot be triggered by a normal visitor and that preview code
  paths are not running in production.
- **Stega**: if `stega` is enabled outside of preview, invisible metadata characters are being
  shipped inside every string — a payload and content-integrity problem. Verify it is off in prod.

### 2.2 Server / client component boundaries

- Every `'use client'` file: is it justified? Is the directive as far down the tree as it can go?
- Client components importing heavy libraries (date libs, animation, icon sets, rich-text renderers,
  charting) — these land in the browser bundle.
- Large serialised props crossing the server→client boundary (whole Sanity documents passed into a
  client component).
- Providers wrapping the root layout that force everything below into client rendering.
- Anything imported from `sanity`, `sanity/*`, or `@sanity/*` (Studio packages) inside application
  routes — Studio dependencies must never reach the public bundle.

### 2.3 GROQ & data fetching

- **Projections.** `*[_type == "x"]` with no projection, or a bare `...` spread, fetches entire
  documents including fields the page never renders. Quantify: how many fields are fetched vs used.
- Nested dereferences (`->`) fetching whole referenced documents.
- Waterfalls: sequential `await`s that could be `Promise.all`.
- N+1: a query inside a `.map()`.
- Duplicate queries: the same navigation/settings/footer query executed in layout _and_ in pages.
- Missing `next: { revalidate, tags }` options on fetches.
- Query size: any query returning arrays with no slice (`[0...n]`) — unbounded result sets.
- Portable Text: is the serializer client-side when it could render on the server?

### 2.4 Images

Almost always the biggest LCP lever on a product/catalogue site.

- `next/image` used consistently? Any raw `<img>` left?
- `remotePatterns` configured for `cdn.sanity.io`.
- Sanity image URLs built with `@sanity/image-url` including explicit `width`, `auto('format')`,
  and a sensible `quality` — or are full-resolution originals being served?
- `sizes` prop present on every `fill` / responsive image. A missing `sizes` means the browser
  downloads the largest candidate.
- `priority` on the LCP image of each template — and _only_ there.
- `placeholder="blur"` using Sanity's LQIP (`metadata.lqip`) rather than nothing.
- Explicit dimensions / `aspect-ratio` everywhere → CLS.
- Any image rendered at a fraction of its intrinsic size (report the worst offenders with numbers).

### 2.5 Fonts, CSS, scripts

- `next/font` (self-hosted, zero layout shift) vs `<link>` to Google Fonts. Report subset,
  `display`, and how many weights are actually loaded vs used.
- Third-party scripts: `next/script` strategy for each (GTM, analytics, cookie consent, chat, maps).
  Anything blocking that should be `lazyOnload`.
- Unused CSS, duplicated CSS-in-JS runtime, Tailwind config bloat (`safelist`, missing content
  globs).
- Render-blocking resources in `<head>`.

### 2.6 Bundle

- Per-route First Load JS from the build table — flag every route above ~200 kB.
- Shared chunk size and what dominates it.
- Barrel-file imports pulling in whole libraries (`import { X } from 'lib'` where the lib has no
  tree-shaking).
- Icon libraries imported wholesale.
- Candidates for `next/dynamic` with `ssr: false` (maps, carousels, modals, video players,
  anything below the fold).
- Duplicated dependencies / multiple versions of the same package.

### 2.7 Sanity Studio

- Where does Studio live — separate deployment, or embedded at `/studio` in this app?
- If embedded: is the route segment isolated so Studio code is not in any public bundle? Confirm
  from the build output, not from intent.
- Is `/studio` `noindex`ed and excluded from `sitemap` and `robots`?
- Studio build weight and whether it is being built on every deploy of the public site.
- `apiVersion` pinned to a date string, not `'v1'` or floating.
- Tokens: any Sanity write token or non-public env var reachable from the client
  (`NEXT_PUBLIC_*` misuse) — report as **critical**, security not just performance.
- Sanity **typegen** (`sanity schema extract` + `sanity typegen generate`): in use? If not, GROQ
  results are almost certainly typed as `any`, which is both a correctness risk and a sign that
  over-fetching is invisible to the team.

---

## 3. SEO audit checklist

### 3.1 Metadata

- Root `metadata` export with `metadataBase` and a `title.template`.
- `generateMetadata` on every dynamic route, sourcing from Sanity fields — not hardcoded.
- Per-page: unique `title` (check lengths), `description`, `alternates.canonical`.
- Open Graph + Twitter cards; is `opengraph-image` / a Sanity OG image wired up, and does it exist
  for every template?
- `robots` directives — hunt for an accidental site-wide `noindex` (a genuinely common and fatal bug).
- `lang` attribute on `<html>` correct for the site's language.
- If the site is multilingual: `alternates.languages` / hreflang correctness and reciprocity.

### 3.2 Crawlability

- `app/sitemap.ts` — generated from Sanity content, includes all indexable routes, excludes
  `/studio`, `/api`, previews. Check `lastModified` uses real `_updatedAt`.
- `app/robots.ts` — correct allow/disallow, sitemap reference.
- Redirects: any chains or loops in `next.config`? Consistent trailing-slash and www/non-www
  handling? Consistent casing?
- `not-found.tsx` returning a real 404 status, not a 200 soft-404.
- Orphan pages — content in Sanity that no navigation links to.

### 3.3 Structured data

- Existing JSON-LD: validate shape and whether the values are real, not placeholders.
- Missing schema opportunities for this site type — `Organization`, `LocalBusiness`,
  `BreadcrumbList`, `Product`, `FAQPage`, `WebSite` + `SearchAction`. Recommend only what the page
  content genuinely supports; do not recommend markup for content that isn't on the page.

### 3.4 On-page & semantics

- Exactly one `<h1>` per page; no skipped heading levels.
- Landmarks: `<main>`, `<nav>`, `<header>`, `<footer>`.
- `alt` text on every image, in the site's language, descriptive — flag empty, filename-based, or
  duplicated alts. Where alt comes from Sanity, check the schema actually has the field and whether
  it is required.
- Internal linking: `next/link` used (not `<a>` for internal routes), descriptive anchor text.
- Content rendered client-side only, invisible to crawlers without JS.
- Accessibility issues with direct SEO impact: contrast, focus states, form labels, button vs div.

### 3.5 Core Web Vitals

- LCP element per template — identify it, and confirm it is prioritised and not lazy-loaded.
- CLS sources: images without dimensions, injected banners, font swap, ads/embeds.
- INP risks: heavy client-side hydration, expensive handlers, large lists without virtualisation.
- Streaming: are `loading.tsx` / `<Suspense>` boundaries used to get first paint out early?

---

## 4. Severity & effort scales

**Severity**

- `Critical` — actively harming indexing or making the site materially slow for every visitor.
- `High` — significant, measurable impact on load time or ranking signals.
- `Medium` — real but bounded impact, or affects a subset of routes.
- `Low` — hygiene, consistency, future-proofing.

**Effort**

- `XS` — under 15 min, single file, no thinking required.
- `S` — under 1 h, localised.
- `M` — half a day, touches several files or needs testing.
- `L` — multi-day, architectural, needs a plan.

---

## 5. Quick wins — definition

A quick win must satisfy **all four**:

1. Effort `XS` or `S`.
2. Low regression risk — no architectural change, no data model change.
3. Independently shippable — does not depend on another item.
4. Measurable or verifiable immediately after merge.

Give each quick win the **exact change**: file, current code, replacement code, and how to confirm
it worked. Target 8–15 of them. If there are fewer, say so rather than padding the list with
filler.

---

## 6. What NOT to do

- Do not modify application code, run `git` write commands, or open a PR.
- Do not install packages other than analysis tooling, and say so when you do.
- Do not report findings you have not verified in this repo.
- Do not pad the report. A 12-finding report where every item is real beats a 60-item checklist
  dump, and the padding is what stops the real items from being fixed.
- Do not recommend migrating routers, frameworks, or CMSs. Work with the stack that exists.

---

## 7. Deliverables

Write exactly two files to the repository root.

### `AUDIT.md`

1. **Executive summary** — 5–10 sentences. The three things that matter most and what they cost.
2. **Baseline** — Next/React/Sanity versions, route table with First Load JS, bundle composition,
   any measured numbers. Clearly separate measured from unverified.
3. **Findings** — grouped as Performance / SEO / Sanity & data / Code health. Each finding:

   | Field          |                                                       |
   | -------------- | ----------------------------------------------------- |
   | ID             | `PERF-01`                                             |
   | Severity       | Critical / High / Medium / Low                        |
   | Effort         | XS / S / M / L                                        |
   | Location       | `app/(site)/tarasy/page.tsx:24`                       |
   | What's wrong   | one or two sentences                                  |
   | Why it matters | the concrete cost, quantified if possible             |
   | Fix            | the specific change, with a code snippet where useful |
   | Verify         | how to confirm it's fixed                             |

4. **Assumptions & blockers** — what you couldn't check and why.
5. **Appendix** — raw build output, analyzer summary, full route inventory.

### `OPTIMIZATION-PLAN.md`

1. **Quick wins** — a numbered, checkbox list per §5, ordered by impact. Each entry carries its
   finding ID, the file, the exact change, and the verification step. This section must be usable
   on its own by someone who has not read `AUDIT.md`.
2. **Phased roadmap:**
   - _Phase 1 — Quick wins_ (a day or less)
   - _Phase 2 — High impact_ (the rendering/caching/image work)
   - _Phase 3 — Structural_ (architecture, schema, tooling)

   For each phase: items, expected outcome, rough time, and dependencies between items.

3. **Metrics & targets** — the specific metrics to track (LCP, CLS, INP, First Load JS per route,
   TTFB, indexed page count), current value where known, target value, and how to measure each.
4. **Verification protocol** — the exact steps to run before and after each phase so improvement is
   provable rather than assumed.
