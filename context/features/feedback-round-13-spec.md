# Client Feedback — Round 13 (po wdrożeniu: konwersje Google Ads, indeksacja, przekierowania, logo)

> **Source:** client WhatsApp messages, 5.11.2026, plus two attachments:
> [the note from her Google Ads assistant](assets/round-13-google-ads-note.jpg) and
> [the new logo](assets/ccomplex-logo-2026-11.png).
> All visible copy is **Polish**; all identifiers stay **English**.

> _„ADS wariuje po zmianie strony. Walczę o konwersje […]”_
> Google Ads note: _„Przekaż Radosławowi adres strony potwierdzenia i poproś, żeby sprawdził, czy
> po skutecznym wysłaniu formularza tag `AW-850864161` przez `GTM-NWZ9GM5` rejestruje odsłonę tej
> strony. To właśnie na tę odsłonę czeka obecna reguła konwersji w Google Ads.”_
> Page she named: `https://www.ccomplex.pl/wycena/zadaszenie/przeslany-formularz`

> _„Sprawdź indeksację nowej strony. W Google Search Console użyj funkcji »Sprawdzenie adresu URL«
> dla strony zadaszeń tarasowych, akcesoriów i realizacji. Po migracji warto też sprawdzić, czy
> stare adresy mają przekierowania do odpowiadających im nowych podstron. W przypadku ChatGPT
> poproś Radosława o sprawdzenie, czy robots.txt i hosting dopuszczają robota OAI-SearchBot.”_

> _„Jeszcze wyślę nowe LOGO (ja mam jeszcze dostęp do strony?). Ja muszę jeszcze sprawdzić wszystkie
> KONWERSJE.”_

---

## Status

Not started. Audited against production on 5.11.2026. This document is not the implementation.

---

## Overview

| #   | Item                                              | Audit result                              | Who / where                  | Priority |
| --- | ------------------------------------------------- | ----------------------------------------- | ---------------------------- | -------- |
| 1   | Konwersje Google Ads                              | ❌ **Broken: tags cannot fire**            | GTM + Google Ads, no code    | **P0**   |
| 2   | GA4 lost in the migration                         | ❌ Not on the new site                     | GTM                          | **P0**   |
| 3   | Baner cookies / Consent Mode                      | ❌ Missing, the old site had CookieYes     | Decision, then GTM or code   | **P0**   |
| 4   | Przekierowania ze starych adresów                 | ❌ All old URLs end in 404                 | `next.config.ts`             | **P0**   |
| 5   | Canonical + duplicate on `vercel.app`             | ❌ No canonical tags, duplicate is public  | Code + Vercel + Studio       | P1       |
| 6   | Indeksacja (Search Console)                       | ⚠️ Technically ready, GSC not checked      | Client / GSC                 | P1       |
| 7   | OAI-SearchBot                                     | ✅ Allowed; one Vercel setting to confirm  | Vercel                       | Done     |
| 8   | Nowe logo                                         | ⚠️ File needs trimming, 2 CMS slots        | Sanity + favicon             | P1       |
| 9   | Dostęp klientki do strony                         | ❓ Not checkable from the repo             | sanity.io/manage             | P2       |
| 10  | Reszta nazwy „Complex” + link w banerze           | ⚠️ Small leftovers                         | Code + Studio                | P2       |

Order matters: 3 decides how 1 and 2 are configured, so settle it first.

---

## 1. Konwersje Google Ads

### Root cause

The live GTM container (`GTM-NWZ9GM5`, version 6) **was never migrated**. Its conversion tags still
wait for Contact Form 7 elements from the old WordPress site. On the new site these elements do not
exist (0 `wpcf7` elements in the browser), so the tags cannot fire. No GTM trigger listens for the
`generate_lead` event that our forms already send.

Container contents, decoded from the public `gtm.js`:

| Old trigger (element visibility)  | Old WordPress form      | Conversion label       | New `form_type` |
| --------------------------------- | ----------------------- | ---------------------- | --------------- |
| `#wpcf7-f1341-p4117-o1 > form > div`  | Formularz kontaktowy    | `CxZTCOf-g5sbEKHQ3JUD` | `kontakt`       |
| `#wpcf7-f1327-p10690-o1 > form > div` | Wycena zadaszenia       | `aVfaCOr-g5sbEKHQ3JUD` | `zadaszenie`    |
| `#wpcf7-f1263-p2670-o1 > form > div`  | Wycena tarasu           | `pJE4CO3-g5sbEKHQ3JUD` | `taras`         |
| `#wpcf7-f1338-p14920-o1 > form > div` | Wycena żaluzji          | `N0qICPD-g5sbEKHQ3JUD` | `zaluzje`       |
| none                              | Wycena schodów          | none                   | `schody`        |

The form ↔ label mapping comes from matching each selector to the form ID on the old pages. Confirm
the conversion names in Google Ads. **Schody never had a conversion**, on the old site either.

### The question the Google Ads note asks

**Does the tag register a view of the thank-you page?** Not proven yet:

- The Google tag (`AW-850864161`) loads on every page.
- The form reaches the thank-you page by `router.push`, with no full page load. In the browser the
  tag did send a hit on a history change (`gtm.historyChange-v2` → `google.com/ccm/collect`), so a
  URL rule **may** see the page, but this was not tested with a real submission.
- **A URL rule also has a false-positive path.** Opening the thank-you URL directly sends a hit with
  the thank-you page title **before** `FormThankYouPanel` redirects to the form (confirmed in the
  browser). The on-screen guard does not stop that hit. Only visits attributed to an ad click would
  count, but this is why the event is the better signal.

The code comment in `FormThankYouPanel.tsx` says there is no page load for a pageview trigger. That
is still accurate, and `generate_lead` remains the intended signal.

### Fix (in GTM, no code change)

1. **GTM → Variables:** add Data Layer Variable `form_type`.
2. **GTM → Triggers:** add 4 Custom Event triggers, event name `generate_lead`, with `form_type`
   equal to `kontakt`, `zadaszenie`, `taras`, `zaluzje`.
3. **GTM → Tags:** attach each trigger to the matching conversion tag from the table above. Remove
   the old element-visibility triggers.
4. **Google Ads → Goals → Conversions:** check each action's source. **Each form must count once.**
   If an action uses a URL rule (as the note suggests) and a tag also fires, make one of them
   secondary or remove it, otherwise leads are counted twice.
5. **Test:** GTM Preview + Tag Assistant, **one real submission per form**, marked „TEST”. Each one
   sends real e-mails, so tell the client first. Check that the right tag fires exactly once, then
   publish the container.
6. **Google Ads:** check the status after about 24 h. Consider a **data exclusion** for the period
   since the switch, because Smart Bidding sees a false drop in conversions. No conversions were
   recorded by these tags in that period, and they cannot be recovered.

**Access needed:** GTM and Google Ads, from the client or her agency.

---

## 2. GA4 lost in the migration

The old site loaded GA4 (`G-2YVGGG5VH6`). It appears **neither in the new site's HTML nor in the
GTM container**, so the new site is not reporting to Analytics.

**Fix:** add a Google tag `G-2YVGGG5VH6` in GTM on all pages, and optionally a GA4 event for
`generate_lead`. Confirm with the client that this property is still the one she uses. Enhanced
measurement should cover the client-side page changes; verify in GA4 Realtime.

---

## 3. Baner cookies / Consent Mode

The old site had **CookieYes**. The new one has **no banner and no consent signals** (0 `consent`
entries in `dataLayer`), and it sets the advertising cookie `_gcl_au` on the first visit, before any
choice. This matters in two ways:

- **Legal:** advertising cookies need prior consent in Poland/EU.
- **Google Ads:** EEA traffic needs Consent Mode v2 for remarketing and modelled conversions.

**Decision needed from the client, since this adds a visible feature:**

| Option                                           | Effort | Notes                                                |
| ------------------------------------------------ | ------ | ---------------------------------------------------- |
| **A. CMP through GTM** (CookieYes template, recommended) | Small  | She already knows it. Check her plan and account.     |
| B. Own Ark UI banner + Consent Mode in code      | Medium | No subscription, but the consent logic is ours to keep. |

Do the rest of the GTM work with this in mind: with a CMP, tags must respect consent. Also confirm
that `/polityka-prywatnosci` matches what is actually loaded (Google Ads, GA4, CMP). That text is
for the client or her lawyer to approve.

---

## 4. Przekierowania ze starych adresów

Only `/oferta/zadaszenia-aluminiowe`, `/oferta/zaluzje-tarasowe` and `/oferta/elewacje-kompozytowe`
redirect today. All old WordPress addresses tested end in **404** after the slash-removal redirect.
Google has these URLs indexed, and they may also be used by ads and external links.

The old sitemap was read from the old host (`194.181.228.10`), which is still online. Add to
`redirects()` in [next.config.ts](frontend/next.config.ts), specific rules before wildcards,
`permanent: true`:

| Old path                                     | New path                         |
| -------------------------------------------- | -------------------------------- |
| `/formularze-wycen`                          | `/wycena`                        |
| `/formularze-wycen/formularz-wyceny-tarasu`  | `/wycena/taras`                  |
| `/formularze-wycen/formularz-wyceny-zadaszenia` | `/wycena/zadaszenie`          |
| `/formularze-wycen/formularz-wyceny-zaluzji` | `/wycena/zaluzje`                |
| `/formularze-wycen/formularz-wyceny-schodow` | `/wycena/schody`                 |
| `/formularze-wycen/formularz-kontaktowy`     | `/#kontakt`                      |
| `/kontakt`                                   | `/#kontakt`                      |
| `/wyslij-zapytanie`                          | `/wycena`                        |
| `/realizacje/:path+`                         | `/realizacje`                    |

Offer pages, with `P` = `/oferta-zadaszenia-aluminiowe-tarasy-uslugi-kierownik-budowy`:

| Old path                              | New path                         |
| ------------------------------------- | -------------------------------- |
| `P`                                   | `/oferta`                        |
| `P/zadaszenia-aluminiowe/:path*`      | `/oferta/zadaszenia-tarasowe`    |
| `P/zaluzje-tarasowe`                  | `/oferta/akcesoria-do-zadaszen`  |
| `P/tarasy-kompozytowe/:path*`         | `/oferta/tarasy-kompozytowe`     |
| `P/tarasy-z-plyt-gresowych`           | `/oferta/tarasy-gresowe`         |
| `P/tarasy-drewniane`                  | `/oferta/tarasy-drewniane`       |
| `P/schody-modulowe`                   | `/oferta/schody-modulowe`        |
| `P/elewacje-kompozytowe`              | `/oferta`                        |

`/realizacje` and `/polityka-prywatnosci` keep their paths. `:path*` covers the brand subpages
(`deponti`, `noble`, `verasol`, `merlot`, `ekonomiczne`, `silvadec`, `hartika`, etc.).

**Intentionally left as 404:** old news and fairs posts, the test post `/aktualnosc-probna`, old
thank-you pages (`/formularz-wyslany-z-powodzeniem`, `/wiadomosc-zostala-przeslana`), and
`/category/*`, `/tag/*`, `/author/*`. They have no equivalent, and sending them to the home page
would only produce soft 404s.

**Open:** `/kierownik-budowy` and `/kierownik-budowy/realizacje-uslugi`. The new site has no such
page. See the questions at the end.

**Verify** on a local `next start` and after deploy, following redirects to a final 200, including
the full chain from `https://ccomplex.pl/...old-path.../`. `next.config.ts` currently shows only a
line-ending diff, so don't let it mix into the commit.

---

## 5. Canonical + duplicate on `vercel.app`

- **No page has `<link rel="canonical">`** (checked `/`, `/oferta/zadaszenia-tarasowe`,
  `/realizacje`, `/oferta/akcesoria-do-zadaszen`).
- **`https://complex-puce.vercel.app` serves the whole site with 200** and allows crawling, so it
  is a public duplicate.
- **`metadataBase` in the CMS is `https://ccomplex.pl`**, the redirecting address, not `www`.

**Fix:**

1. Resolve `metadataBase` in [layout.tsx](frontend/app/layout.tsx) from `NEXT_PUBLIC_SITE_URL` first
   (via `resolveSiteUrl`), then the CMS value. Also change the CMS field to `https://www.ccomplex.pl`.
2. Add a `path` to [buildSeoMetadata](frontend/app/lib/buildSeoMetadata.ts) and return
   `alternates: { canonical: path }`, updating its tests. **Don't set a canonical in the root
   layout:** child pages would inherit it and all would point at the home page. The home page sets
   its own. Thank-you pages stay `noindex` and need none.
3. **Vercel → Domains:** redirect `complex-puce.vercel.app` to `www.ccomplex.pl`.

**⚠️ Do this together with step 3, or Presentation breaks.** The Studio previews that address today
([sanity.config.ts:32](studio/sanity.config.ts#L32) and `studio/.env.production`). First add
`https://www.ccomplex.pl` to `PREVIEW_ALLOW_ORIGINS`, change `SANITY_STUDIO_PREVIEW_URL`, run
`npm run deploy` from `studio/`, and add the origin to Sanity CORS if it isn't there yet. Only then
add the Vercel redirect.

---

## 6. Indeksacja (Search Console)

Checked from outside; GSC itself needs the client's account.

| Check                                                           | Result |
| --------------------------------------------------------------- | ------ |
| `ccomplex.pl` and `http://` → `https://www.ccomplex.pl` (308)   | ✅     |
| `robots.txt` allows crawling and points to the `www` sitemap    | ✅     |
| `sitemap.xml`: 18 URLs on `www`, no thank-you pages             | ✅     |
| Thank-you pages are `noindex, nofollow`                         | ✅     |
| Pages have server-rendered `<h1>`, title and description        | ✅     |
| Unknown URL returns a real 404                                  | ✅     |

**To do in GSC, after items 4 and 5 are deployed:**

1. Confirm the domain property `ccomplex.pl` is verified. The TXT verification record must have
   survived the DNS move.
2. Submit `https://www.ccomplex.pl/sitemap.xml`.
3. URL Inspection → Request indexing for:
   - `https://www.ccomplex.pl/oferta/zadaszenia-tarasowe`
   - `https://www.ccomplex.pl/oferta/akcesoria-do-zadaszen`
   - `https://www.ccomplex.pl/realizacje`
4. Watch the Pages report for 2–4 weeks: 404 entries should fall as redirects get recrawled.

Rankings can fluctuate after a migration, and new URLs take days to weeks to appear.

---

## 7. OAI-SearchBot

✅ Already covered:

- `robots.txt` has an explicit `User-Agent: OAI-SearchBot / Allow: /`.
- Requests with the OAI-SearchBot, GPTBot and ChatGPT-User user agents all return 200, and the
  content is in the server-rendered HTML.

**Limit of this test:** it imitates the user agent, not OpenAI's real IPs. To finish, confirm that
**Vercel → Firewall** has no rule or bot protection blocking AI crawlers. Allowing the bot makes
inclusion possible; it doesn't guarantee that the site appears for a given query.

---

## 8. Nowe logo

The client says she will still send the logo, and [this file](assets/ccomplex-logo-2026-11.png) was
attached. **Confirm it is the final version.**

- PNG, 1000×452, transparent background, but with wide empty margins: the visible logo is 789×306.
- The current logo renders at 117×60 in the navbar (`h-15`). Uploaded untrimmed, the margins would
  make it visibly smaller, so **trim the transparent margins first**. Trimmed, it renders at about
  155×60 in the navbar and 124×48 in the footer (`h-12`).
- The green on transparent should work on the dark background. The small line „Zadaszenia i tarasy”
  may be hard to read at this size, so **check it on desktop and mobile**. If it is, ask for a
  version without that line for the navbar.

**Where it goes (no code change):**

- Studio → Navbar → logo image.
- Studio → Footer → logo image. The Organization JSON-LD reads this one too.

**Also check:** `frontend/app/favicon.ico` and the OG images in `settings`/`seo`, which may still
show the old „COMPLEX” logo. Neither CMS document has a pending draft now; check again before
publishing.

---

## 9. Dostęp klientki do strony

„Ja mam jeszcze dostęp do strony?” most likely means the CMS. Check that she is a member of the
project at **sanity.io/manage** with an editor role, and send her `https://complex.sanity.studio`.
Tell her the old WordPress admin no longer controls the public site.

---

## 10. Drobne pozostałości

- `dziekujemy-kontakt/page.tsx`: title „Wiadomość wysłana — **Complex**”; change to „CComplex”.
- `AboutStory.tsx:99`: image alt fallback `'Complex'`; change to „CComplex”.
- `o-nas/page.tsx:21`: „**Complex sp. z o.o.**” in the description. **Depends on the registered
  company name**, which is still open from Round 11.
- **Banner CTA in the CMS:** `ctaHref` is still `oferta/zadaszenia-tarasowe`, with no leading `/`,
  so it breaks from subpages. The banner is currently off (`isEnabled: false`). Fix it to
  `/oferta/zadaszenia-tarasowe` before it is turned on again.

---

## Tests

- `buildSeoMetadata.test.ts`: canonical output.
- Redirects are config, outside the unit-test scope: verify with `curl -L` as described in item 4.
- `npm run lint`, `npm run type-check`, `npm test`, `next build`.

---

## Questions for the client

1. **Cookie banner:** continue with CookieYes through GTM (recommended)?
2. **Access:** who has GTM, Google Ads and Search Console? We need access or a person to do it.
3. **GA4:** is `G-2YVGGG5VH6` still the right property?
4. **Schody:** should this form get its own conversion? It never had one.
5. **Kierownik budowy:** is this service still offered? If yes, it needs a page; if not, should the
   old URLs go to `/oferta`?
6. **Logo:** is the attached file final?
7. **Company name:** is „CComplex sp. z o.o.” the registered name? (Open from Round 11.)
