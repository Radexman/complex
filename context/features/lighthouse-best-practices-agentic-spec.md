# Lighthouse — „Sprawdzone metody” i „Przeglądanie agentowe”

> **Source:** the developer's Lighthouse run on `https://www.ccomplex.pl/` (9.11.2026, own Chrome
> profile): Wydajność 100, Ułatwienia dostępu 92, **Sprawdzone metody 77**, SEO 100,
> **Przeglądanie agentowe 1/2**. Lighthouse warned that stored data (IndexedDB) may have affected the
> run and suggested incognito.
> All visible copy is **Polish**; all identifiers stay **English**.

---

## Status

Not started. Audited on 9.11.2026 with Lighthouse **13.6.0** (CLI, desktop Chrome, clean headless
profile) on four pages. This document is not the implementation.

| Page                          | Perf | A11y | Best practices | SEO | Agentic |
| ----------------------------- | ---- | ---- | -------------- | --- | ------- |
| `/`                           | 97   | 92   | 100            | 100 | **50**  |
| `/realizacje`                 | 73   | 94   | 100            | 100 | **50**  |
| `/oferta/zadaszenia-tarasowe` | 97   | 96   | 100            | 100 | **50**  |
| `/wycena/zadaszenie`          | 99   | 92   | 100            | 100 | 100     |

**Key finding:** in a clean profile „Sprawdzone metody” is **100**. The 77 comes from the developer's
browser state (third-party cookies and DevTools Issues present in that profile). The agentic score of
50 is real and reproducible, and it has two concrete causes.

---

## Overview

| #   | Item                                                    | Category        | Effort  | Priority |
| --- | ------------------------------------------------------- | --------------- | ------- | -------- |
| 1   | Leaflet map marker has no accessible name               | Agentic + A11y  | Trivial | **P0**   |
| 2   | Project filter uses Tabs without tab panels             | Agentic + A11y  | Small   | **P0**   |
| 3   | Third-party cookies (32 in the developer's run)          | Best practices  | —       | Round 13 |
| 4   | Security headers (HSTS, XFO/frame-ancestors, COOP, CSP) | Best practices  | Medium  | P2       |
| 5   | Source maps for large first-party JS                    | Best practices  | Trivial | P3       |
| 6   | `llms.txt`                                              | Agentic (bonus) | Small   | P2       |
| 7   | ARD manifest, WebMCP                                    | Agentic (bonus) | —       | Not now  |
| 8   | Other accessibility findings                            | A11y            | Small   | P1       |

Items 1 and 2 alone take „Przeglądanie agentowe” from 50 to 100 on every affected page: the
category currently has two scored audits, the accessibility tree (fails) and CLS (passes, 0).

---

## 1. Leaflet map marker has no accessible name

**Audit:** `agent-accessibility-tree` → „ARIA commands must have an accessible name”, and
`aria-command-name` in Accessibility. Affects every page with the showroom map (home and offer
pages).

Leaflet renders the marker as
`<div class="leaflet-marker-icon …" tabindex="0" role="button">` with no text, because
[ShowroomMap.tsx](frontend/app/components/ShowroomMap.tsx) uses a `L.divIcon` with only a styled
`<span>`. An agent or screen reader sees an unnamed button.

**Fix:** give the marker a name. Leaflet's `Marker` accepts `title` (sets the `title` attribute) and
`alt`; for a `divIcon`, also set `aria-label` on the icon element, e.g. in the existing `add` event
handler (`e.target.getElement()?.setAttribute('aria-label', …)`). Suggested label:
„Salon CComplex — Kępska 12, Opole”. Keep the marker keyboard-focusable: it opens the popup with
the „Nawiguj” link.

**Verify:** Lighthouse on `/` and `/oferta/zadaszenia-tarasowe` no longer lists the marker.

---

## 2. Project filter uses Tabs without tab panels

**Audit:** `agent-accessibility-tree` → „ARIA attributes must conform to valid values”, and
`aria-valid-attr-value` in Accessibility. Affects the home page (FeaturedProjectsSection) and
`/realizacje` (ProjectsGrid).

Both components use Ark UI `Tabs.Root` / `Tabs.List` / `Tabs.Trigger` as a **category filter**, but
render no `Tabs.Content`. Each trigger gets `role="tab"` and
`aria-controls="tabs:…:content-all"` pointing at a panel that doesn't exist, so the attribute is
invalid. Semantically this isn't a tab set either: the buttons filter one grid.

**Fix (recommended):** replace the Tabs with a control meant for single-choice filtering, e.g. Ark
UI **ToggleGroup** (single selection; buttons with `aria-pressed`) or **SegmentGroup** (radio
semantics). Keep the same visual style, the `activeTab` state and the `data-*-reveal` animation
hooks. Confirm the component API in the Ark UI docs during implementation.

**Alternative:** keep Tabs and wrap the grid in `Tabs.Content` per value. That makes the ARIA valid,
but it means one panel per category (or re-rendering one grid under a changing value), which is
more code for a worse semantic match.

**Verify:** Lighthouse on `/` and `/realizacje`: `aria-valid-attr-value` passes and the agentic
category shows 100. Check keyboard use (Tab to the group, arrows or Tab between options, Enter or
Space to select) and that filtering still animates as before.

---

## 3. Third-party cookies

The developer's run reported „Używa plików cookie innych firm — znaleziono 32”. The clean headless
run reported none, so the result depends on the browser's cookie state. The likely sources are the
Google tags loaded by GTM (`AW-850864161`: `google.com`, `doubleclick.net`); this was not confirmed
cookie-by-cookie in this audit. The OpenStreetMap tiles and the Leaflet assets from `unpkg.com` are
not expected to set cookies.

**Fix:** none in this spec. This is the cookie banner + Consent Mode v2 work already tracked in
Round 13 (item 3). With consent denied by default, the advertising cookies should not be set before
the visitor agrees, which addresses both this audit and the legal issue.

**Note for testing:** run Lighthouse in an incognito window or a clean profile; the developer's
profile also triggered the IndexedDB warning.

---

## 4. Security headers

Shown as unscored hints („○”) under „Zaufanie i bezpieczeństwo”. Current response headers on `www`:
only `Strict-Transport-Security: max-age=63072000` (Vercel default). No CSP, X-Frame-Options,
COOP, Referrer-Policy or X-Content-Type-Options.

Add via `headers()` in [next.config.ts](frontend/next.config.ts), in this order of safety:

| Header                                 | Value                                                                    | Notes |
| -------------------------------------- | ------------------------------------------------------------------------ | ----- |
| `X-Content-Type-Options`               | `nosniff`                                                                | Safe. |
| `Referrer-Policy`                      | `strict-origin-when-cross-origin`                                        | Safe; browser default anyway. |
| `Strict-Transport-Security`            | `max-age=63072000; includeSubDomains`                                    | All mail subdomains (`mail`, `webmail`, `cpanel`, `ftp`, `dysk`, `autodiscover`) serve valid HTTPS (checked 9.11.2026). Sent from `www`, it covers only `*.www.ccomplex.pl` anyway. **Don't add `preload`**: hard to undo. |
| `Content-Security-Policy: frame-ancestors` | `'self' https://complex.sanity.studio http://localhost:*`            | Clickjacking protection. **Must allow the Studio**, or Presentation (iframe) breaks. Prefer this over `X-Frame-Options`, which can't allowlist the Studio. |
| `Cross-Origin-Opener-Policy`           | `same-origin-allow-popups`                                               | Keeps `target="_blank"` links (WhatsApp, Google Maps directions) working. |
| `Content-Security-Policy` (full)       | **Report-Only first**                                                    | See below. |

**Full CSP:** the site loads GTM, Google Ads (`googletagmanager.com`, `google.com`,
`doubleclick.net`, `googleadservices.com`), Sanity (`cdn.sanity.io`, `*.api.sanity.io` for live
content, Visual Editing in draft mode), OSM tiles, `unpkg.com` (Leaflet icons), Vercel Speed
Insights and Google Fonts via `next/font` (self-hosted). A nonce-based strict CSP would force
dynamic rendering of the currently static pages, so start with an allowlist policy in
`Content-Security-Policy-Report-Only`, watch the console on all page types (including draft mode
and the forms), then enforce. The CookieYes banner (Round 13) will add its own domains. Trusted
Types: skip for now.

**Verify:** `curl -I` on `www` shows the headers; Presentation in the Studio still loads the page;
forms submit; GTM and the map load with no CSP errors.

---

## 5. Source maps for large first-party JS

Audit `valid-source-maps` fails (e.g. `/_next/static/chunks/1c1_xndz7yj53.js`) but has **weight 0**,
so it doesn't change the score. Enabling `productionBrowserSourceMaps: true` in `next.config.ts`
would pass it and help debugging production errors, at the cost of exposing the readable front-end
source and slower builds. Only the client-side bundle would be exposed: no secrets live there, since
all keys are server-only. **Recommendation:** optional; decide together with item 4.

---

## 6. `llms.txt` (agentic bonus)

Audit `llms-txt` is „not applicable” today (no file). An [llms.txt](https://llmstxt.org/) is a
Markdown file at `/llms.txt` with at least an H1, describing the site for language models. It fits
the client's interest in appearing in ChatGPT and Google's AI overviews (she was already shown as a
recommended company for „pergole opole”).

**Fix:** add a route handler `app/llms.txt/route.ts` that returns `text/markdown`, generated from
the existing CMS data where possible (company name, service area, links to the offer pages, the
quotation forms and `/realizacje`), with a static fallback. Keep it short and factual; it carries
no ranking guarantee. Add a small unit test only if the content is built by a helper in
`app/lib/`.

---

## 7. ARD manifest and WebMCP (not now)

- **ARD** (`/.well-known/ard.json`, „Agentic Resource Discovery”): a new specification for agents and
  registries to discover a site's resources. „Not applicable” today, no score impact. Revisit when
  it matures.
- **WebMCP** (`webmcp-*` audits): lets a page expose its forms as tools that browser agents can call.
  An experimental Chrome API. Interesting for the quotation forms later, but not production-ready
  for this site now.

---

## 8. Other accessibility findings (same audit run)

Not in the two requested categories, but cheap to fix together:

| Audit                 | Where                                                                                 | Fix |
| --------------------- | ------------------------------------------------------------------------------------- | --- |
| `heading-order`       | Footer column headings are `<h3>` ([Footer.tsx:66, 164](frontend/app/components/layout/Footer.tsx)); pages without an `<h2>` before them skip a level | Use a non-heading element (e.g. `<p>`) or `<h2>` styled the same. |
| `color-contrast`      | `text-silver/60` small text in [FormFileDropzone.tsx:32](frontend/app/components/forms/shared/FormFileDropzone.tsx) and [FormSuccessState.tsx:144](frontend/app/components/forms/shared/FormSuccessState.tsx) | Raise to `text-silver` (or a higher opacity) and recheck contrast. |
| `link-in-text-block`  | „Polityka prywatności” link in the RODO consent (ContactForm, TarasForm, SchodyForm, …) | Add an underline so it isn't distinguished by color alone. |

---

## Out of scope (observed)

- `/realizacje` performance is **73** (others 97–99). Worth a separate look (likely the image grid or
  animations), not part of this spec.

---

## Tests and verification

- Unit tests: only for an `llms.txt` helper, if one is added in `app/lib/` (coding-standards scope).
- Lint, type-check, `npm test`, `next build`.
- Lighthouse 13 on a local `next start` and after deploy, in a clean profile, for `/`, `/realizacje`,
  `/oferta/zadaszenia-tarasowe` and `/wycena/zadaszenie`. Targets: Agentic 100, Accessibility up,
  Best practices 100 in a clean profile.
- Manual: keyboard use of the project filter, the map popup, Studio Presentation (after item 4).

---

## Suggested split

1. **This round (code only, low risk):** items 1, 2, 8, and the safe headers from item 4
   (`nosniff`, `Referrer-Policy`, HSTS `includeSubDomains`, `frame-ancestors`, COOP).
2. **Next:** `llms.txt` (item 6).
3. **With the cookie banner work (Round 13):** CSP Report-Only → enforce; third-party cookies
   resolve through consent.
