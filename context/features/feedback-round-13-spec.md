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

Code part shipped and verified on production on 5.11.2026. Panel work is still open.
**Item 1 was corrected the same day** after we saw GTM and Google Ads; the first diagnosis (GTM is
why conversions don't count) was wrong for the primary conversions.

| Done and verified                                               | Still open                                                  |
| --------------------------------------------------------------- | ----------------------------------------------------------- |
| Old URL redirects, canonical, `metadataBase`                    | Google Ads policy messages (content unknown)                |
| `vercel.app` → `www`, Studio deployed, Presentation works       | Cookie banner + Consent Mode, GA4 tag                       |
| CMS: metadata base and banner link                              | Primary conversions: live test once a campaign runs         |
| Firewall allows AI bots; client's Sanity access                 | 5 unpublished GTM changes; logo; other questions at the end |

---

## Overview

| #   | Item                                              | Audit result                              | Who / where                  | Priority |
| --- | ------------------------------------------------- | ----------------------------------------- | ---------------------------- | -------- |
| 1   | Konwersje Google Ads                              | ❓ Set up correctly, not yet proven        | Google Ads, live test        | **P0**   |
| 1a  | Komunikaty Ads o naruszeniu zasad                 | ❓ Content not seen yet                    | Google Ads, maybe site       | **P0**   |
| 2   | GA4 lost in the migration                         | ❌ Not on the new site                     | GTM + GA4 settings           | **P0**   |
| 3   | Baner cookies / Consent Mode                      | ❌ Missing, the old site had CookieYes     | Decision, then GTM or code   | **P0**   |
| 4   | Przekierowania ze starych adresów                 | ✅ Shipped and verified                    | `next.config.ts`             | Done     |
| 5   | Canonical + duplicate on `vercel.app`             | ✅ Shipped and verified                    | Code + Vercel + Studio       | Done     |
| 6   | Indeksacja (Search Console)                       | ⚠️ Technically ready, GSC not checked      | Client / GSC                 | P1       |
| 7   | OAI-SearchBot                                     | ✅ Allowed; Firewall checked               | Vercel                       | Done     |
| 8   | Nowe logo                                         | ⚠️ File needs trimming, 2 CMS slots        | Sanity + favicon             | P1       |
| 9   | Dostęp klientki do strony                         | ✅ Confirmed by the developer              | sanity.io/manage             | Done     |
| 10  | Reszta nazwy „Complex” + link w banerze           | ⚠️ Small leftovers                         | Code + Studio                | P2       |

Order: read the policy messages (1a), then banner and GA4 (3, 2), then a new campaign and a live conversion test (1).

---

## 1. Konwersje Google Ads

> **Corrected 5.11.2026.** The first version of this section said the conversions fail because GTM
> still targets WordPress. That only applies to the old GTM tags, not to the conversions that matter.

### What actually counts

The client confirmed that three conversions matter. All three are page-load conversions on the
thank-you URL, so they don't depend on the old GTM tags:

| Google Ads conversion               | Rule (`Ktoś odwiedza stronę`)                       | Last conversion          | Goal category         | Value |
| ----------------------------------- | --------------------------------------------------- | ------------------------ | --------------------- | ----- |
| `A_Przesłany formularz ZADASZENIA`  | `ccomplex.pl/wycena/zadaszenie/przeslany-formularz` | 27.10.2026               | Prośby o wycenę       | none  |
| `A_Przesłany formularz TARAS`       | `ccomplex.pl/wycena/taras/przeslany-formularz`      | 25.10.2026               | Wyświetlenia strony   | none  |
| `A_Przesłany formularz_SCHODY`      | `ccomplex.pl/wycena/schody/przeslany-formularz`     | none (created 5.11.2026) | Przesłania formularzy | 1 zł  |

Żaluzje are secondary and not important to the client. The rest of the list is auto-created GA4
events, all secondary.

### Why Ads shows no conversions

**All campaigns are paused**, per the client: the old ones are stopped and she is building new ones.
So zero conversions since 27.10 proves nothing either way.

### Does the tag see the thank-you page? Yes

Tested on production on 5.11.2026 with the same client-side navigation a submission uses (no form
sent, all requests to Google intercepted and blocked). The Google tag prepared a `page_view` with
`dl=https://www.ccomplex.pl/wycena/zadaszenie/przeslany-formularz` and the right title, and
`generate_lead` with `form_type: zadaszenie` reached `dataLayer`.

This answers the question in the Google Ads note, but a simulation is not a counted conversion.

### Still unverified

- **A live conversion.** When a new campaign runs, the client clicks her own ad and sends a form
  marked „TEST”, then we check Ads after 1–2 days.
- **The rule's match condition.** The rule has no `www` and the site runs on `www`. Check under
  `Zarządzaj` only if the live test fails.

### Worth fixing in Google Ads (client's decision)

- **Three conversions sit in three goal categories, and only Schody has a value.** A campaign only
  optimises for the goals it uses, so Taras in „Wyświetlenia strony” may not influence it. Recommended:
  one category and one value setting, before the new campaign.
- **Enhanced conversions** are on for Zadaszenia, and Taras shows „Wykryto problemy z konfiguracją”.
  The tag also sent `ccm/form-data/850864161` requests, which may relate to this. Settle together
  with item 3, including the privacy policy.
- **False-positive path:** opening a thank-you URL directly sends a `page_view` before
  `FormThankYouPanel` redirects to the form. It could only count after an ad click, so the risk is
  small. Check this if conversions exceed the number of e-mails.

### GTM

Access granted. Container `GTM-NWZ9GM5`, live version 6:

- **4 old tags** (kontaktowy, taras, zadaszenia, żaluzje) on element-visibility triggers for
  `#wpcf7-...` selectors, once per page. These fire when a form **appears**, not when it is sent,
  which fits `A_Wczytany` rather than `A_Przesłany` (not confirmed by label). They can't fire on the
  new site and do no harm. Leave them unless the client needs the `A_Wczytany` data.
- **5 unpublished changes** added 5.11.2026 by `info@ccomplex.pl`: two `Google Ads AW-850864161` tags
  on Initialization – All Pages, which look redundant next to the existing Google tag, plus three
  settings: Universal Analytics event logging, automatic event detection, and user-provided data.
  **Don't publish them, and don't discard them without the client's consent.**

If GTM work starts before she answers, use a separate workspace. `generate_lead` remains available
if a tag-based conversion is ever needed. **The label table in the first version of this spec was
dropped as a plan.**

---

## 1a. Komunikaty Ads o naruszeniu zasad

The client says Ads sent „mnóstwo wiadomości o naruszeniu zasad” after the site change. **We haven't
seen them, so the cause is unknown.** Possible cause: ads pointing at old URLs that returned 404
until the redirects shipped on 5.11.2026. Get the policy names and affected ads before launching new
campaigns.

Site check from outside on 5.11.2026, which rules out only the basics:

| Check                                                                | Result |
| -------------------------------------------------------------------- | ------ |
| AdsBot desktop and mobile user agents on 3 pages: 200, under 0.3 s   | ✅     |
| All 18 sitemap pages and all internal links found on them return 200 | ✅     |
| Company name, address, phone and e-mail in the footer of each page   | ✅     |
| KRS number in the privacy policy                                     | ✅     |
| No „najlepszy/najtańszy/nr 1” claims on these pages                  | ✅     |
| Privacy policy mentions Google Ads, Analytics or Tag Manager         | ❌     |

New ads should use `https://www.ccomplex.pl/...` final URLs. This check is not an Ads policy review.

---

## 2. GA4 lost in the migration

The old site loaded GA4 (`G-2YVGGG5VH6`). It appears **neither in the new site's HTML nor in the
GTM container**, so the new site is not reporting to Analytics.

**Stream confirmed:** `ccomplex.pl` / `G-2YVGGG5VH6` is the active one. The second stream,
`G-695H6WP73F`, has no data; don't use it, and don't delete it without the client's consent.

**Fix, together with item 3:**

1. Add a Google tag `G-2YVGGG5VH6` in GTM on all pages.
2. **Turn on enhanced measurement** in that stream, with page changes based on browser history
   events. It is off today, and without it client-side navigation may count only the first page of
   a visit. (The first version of this spec wrongly assumed it was on.)
3. Optionally change the stream URL to `https://www.ccomplex.pl/`.
4. Verify in GA4 Realtime. Optionally add a GA4 event for `generate_lead`.

---

## 3. Baner cookies / Consent Mode

The old site had **CookieYes**. The new one has **no banner and no consent signals** (0 `consent`
entries in `dataLayer`), and it sets the advertising cookie `_gcl_au` on the first visit, before any
choice. This matters in two ways:

- **Legal:** advertising cookies need prior consent in Poland/EU.
- **Google Ads:** EEA traffic needs Consent Mode v2 for remarketing and modelled conversions.

The client has no CookieYes account, as far as she recalls. Free plan: 5,000 pageviews/month, and the
banner may be suspended past the limit; paid from $10/month. **Check its GTM template and Consent
Mode v2 before anyone pays:** this is not confirmed yet.

**Decision needed from the client, since this adds a visible feature:**

| Option                                           | Effort | Notes                                                |
| ------------------------------------------------ | ------ | ---------------------------------------------------- |
| **A. CMP through GTM** (CookieYes template, recommended) | Small  | She already knows it. Check her plan and account.     |
| B. Own Ark UI banner + Consent Mode in code      | Medium | No subscription, but the consent logic is ours to keep. |

Do the rest of the GTM work with this in mind: with a CMP, tags must respect consent. Also confirm
that `/polityka-prywatnosci` matches what is actually loaded. **Today it mentions cookies but not
Google Ads, Analytics or Tag Manager.** That text is for the client or her lawyer to approve.

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

> ✅ All steps done and verified on production on 5.11.2026.

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

**Vercel → Firewall checked on 5.11.2026:** AI Bots off, Bot Protection off, no custom or IP rules.

**Limit of this test:** it imitates the user agent, not OpenAI's real IPs. Allowing the bot makes
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
- ✅ **Banner CTA in the CMS:** fixed to `/oferta/zadaszenia-tarasowe`.
- **Banner „Promocja Jesienna”:** ends 1.12.2026 but is off (`isEnabled: false`). Ask if intended.
- ✅ `dziekujemy-kontakt` and `AboutStory` shipped.

---

## Tests

- `buildSeoMetadata.test.ts`: canonical output.
- Redirects are config, outside the unit-test scope: verify with `curl -L` as described in item 4.
- `npm run lint`, `npm run type-check`, `npm test`, `next build`.

---

## Questions for the client

**Next, and most important:**

1. Screenshots of the Ads policy messages, and the ads marked as disapproved or limited.
2. May we discard her 5 unpublished GTM changes?
3. Can the CookieYes account use `info@ccomplex.pl`?
4. One goal category and one value setting for the three primary conversions?

**Later:**

5. **Logo:** is the attached file final?
6. **Kierownik budowy:** still offered? If not, should the two old URLs go to `/oferta`?
7. **Company name:** „CComplex sp. z o.o.” appears in the footer, privacy policy, GTM and Analytics,
   but `o-nas/page.tsx` still says „Complex sp. z o.o.”. Confirm, then fix it.
8. **Banner „Promocja Jesienna”:** should it be on?
9. **„Materia (pergole ekonomiczne)”:** or „Materiał”? (Open from Round 12.)
