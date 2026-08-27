# Client Feedback — Round 9 (polityka prywatności, WhatsApp, Facebook)

> **Source:** WhatsApp messages from the client, 26.08.2026 (+48 781 429 378), forwarded 27.08.2026.
> Seven numbered items in the first message plus three follow-up messages about RODO / polityka
> prywatności. All visible copy is **Polish**; all identifiers stay **English**.

**Branch used:** `feature/feedback-round-7` — numbered before Rounds 7 and 8 (from the 12.08
and 19.08 PDFs) were known here. Chronologically this is **Round 9**, from the 26.08 WhatsApp
messages.

---

## Status

Not started — this document is the comprehension pass, not the implementation.

---

## Overview

| #     | Item                                                     | Where it lives                | Needs deploy?               | Difficulty  |
| ----- | -------------------------------------------------------- | ----------------------------- | --------------------------- | ----------- |
| ~~1~~ | ~~Katalog schody — 2 sekcje (wew./zew.) + więcej zdjęć~~ | ~~CMS~~                       | ~~no~~                      | **DONE**    |
| 2     | Menu: „BEZPŁATNA WYCENA” zamiast „Darmowa wycena”        | CMS (`navbar` singleton)      | **no** — publish only       | trivial     |
| 3     | Facebook — pogrubiony + przekierowanie                   | Code (2 sections) + CMS (URL) | yes                         | small       |
| 4     | Stopka — zmiana tekstu (obszar działania)                | CMS (`footer.tagline`)        | **no** — CMS edit           | trivial     |
| 5     | Stopka — WhatsApp pod numerem telefonu                   | Code + CMS (new field)        | yes + **Studio redeploy**   | small       |
| 6     | Kody Google (Ads / Analytics / GTM)                      | Code (`layout.tsx`) + env     | yes                         | medium      |
| 7     | Polityka prywatności — strona + linki                    | Code (new route) + CMS?       | yes (+ Studio if CMS-owned) | **largest** |

Item 7 is the one that matters most technically: **six links on the live site already point at
`/polityka-prywatnosci`, and that page does not exist.** See below.

---

## ~~1. Katalog schody — dwie sekcje + więcej zdjęć~~

**Out of scope — already resolved** by adding the new items to the proper section in the CMS.
Listed here only so the round's numbering matches the client's message.

---

## 2. Menu: „BEZPŁATNA WYCENA” (nie „Darmowa”)

> _„wgrała sie Nie ta wersja – w menu u góry powinno być BEZPŁATNA WYCENA (a jest ''darmowa'')”_

### Root cause — not a code bug, and not a stale deployment

The label is CMS-driven (`navbar.ctaButton.label`, read at
[Navbar.tsx:263](frontend/app/components/layout/Navbar.tsx#L263)). Queried the dataset:

| Document        | `ctaButton.label`    | `_updatedAt`         |
| --------------- | -------------------- | -------------------- |
| `drafts.navbar` | **Bezpłatna wycena** | 2026-08-06T08:17:08Z |
| `navbar`        | **Darmowa wycena**   | 2026-08-03T15:31:32Z |

**The client already made the change — she just never hit Publish.** The draft has been sitting
unpublished since 6 August.

### Fix

**Publish the `navbar` draft.** Verified the draft differs from published by **the CTA label only**
(logo, href and brand text are byte-identical), so publishing pushes nothing unintended live. No
code change, no `next build`, no Studio redeploy — the site picks it up through the Live Content API.

### Decision needed

The client wrote it in caps („BEZPŁATNA WYCENA”). The button is **not** CSS-uppercased, so it will
render exactly as typed: „Bezpłatna wycena”. Ask whether she wants:

- **(a)** the label as currently drafted — sentence case „Bezpłatna wycena” _(recommended: matches
  the hero CTA, the home CTA block and `/wycena`, all of which already say „Bezpłatna wycena”)_, or
- **(b)** literal caps — either retype the CMS value or add `uppercase` to the button class.

Do **not** silently type it in caps: three other buttons on the site read „Bezpłatna wycena” in
sentence case, and caps in one of them would look like a mistake.

### Also worth telling her

There is a general lesson here worth one sentence back to her: **edits in the Studio go live only
after „Publish”.** Worth checking whether other drafts are waiting — a quick audit of unpublished
drafts should be part of this round.

---

## 3. Facebook — pogrubiony + przekierowanie

> _„Facebook = pogrubiony + przekierowanie (nasze realizacje - strona STRAT+strona REALIZACJE)”_

⚠️ **This is the most ambiguous item in the round.** Reading „STRAT” as a typo for „START”, the
intent appears to be:

> _Add a prominent (bold) Facebook link that redirects to the company profile, in the „nasze
> realizacje” area of **both** the home page and the Realizacje page._

### Proposed implementation (confirm before building)

1. **Home page — `FeaturedProjectsSection`.** The header row already carries a „Zobacz wszystkie
   realizacje” accent link
   ([FeaturedProjectsSection.tsx:153-163](frontend/app/components/sections/FeaturedProjectsSection.tsx#L153-L163)).
   Add a second, **bold** link beside it — e.g. „Więcej realizacji na Facebooku” with the
   `FaFacebookF` glyph — opening the profile in a new tab (`target="_blank" rel="noopener noreferrer"`).
2. **`/realizacje` — `ProjectsGrid`.** The same link under the page header, so the „see more of our
   work” route exists on the standalone listing page too.
3. **Footer social icon — „pogrubiony”.** The Facebook button is currently a `text-silver` outline
   tile that only turns accent on hover ([Footer.tsx](frontend/app/components/layout/Footer.tsx)).
   Make it read as a real call to action at rest: accent border + brighter glyph, or a labelled
   button („Facebook”) rather than a bare icon.

### One thing to fix regardless of the above

The stored Facebook URL is a **copy-pasted notification link**:

```
https://www.facebook.com/ccomplex.plTarasy/?notif_id=1782353683768851&notif_t=page_user_activity&ref=notif
```

Those `notif_*` / `ref=notif` parameters belong to one notification in her own account and have no
business in a public link. Clean the CMS value to `https://www.facebook.com/ccomplex.plTarasy/`
(and confirm that is the canonical profile URL).

### Question to put to the client

Whether „pogrubiony” means (a) the footer icon should be visually stronger, (b) the new links in the
realizacje sections should be bold, or (c) both. Build (c) unless she says otherwise — it is the
reading that satisfies every part of the sentence.

---

## 4. Stopka — zmiana tekstu

> _„stopka - zmiana tekstu: .........fachowe doradztwo na wybranych obszarach woj. śląskiego i
> opolskiego”_

Pure CMS content — `footer.tagline`, no draft pending.

**Current (published):**

> Nowoczesne zadaszenia tarasowe, pergole aluminiowe i tarasy. Profesjonalny montaż oraz fachowe
> doradztwo **na terenie województwa śląskiego i opolskiego**.

**Target:**

> Nowoczesne zadaszenia tarasowe, pergole aluminiowe i tarasy. Profesjonalny montaż oraz fachowe
> doradztwo **na wybranych obszarach woj. śląskiego i opolskiego**.

The leading „.........” in her message is an ellipsis for the unchanged opening, not literal text.

This continues the „na wybranych obszarach” wording standardised across the four quotation forms in
Round 5. **Note the site is still not fully consistent:** `bottomCtaSection.serviceAreaDescription`
(shown on the home page **and all 8 offer pages**) says „na wybranych obszarach **województwa
opolskiego i śląskiego**” — right phrase, opposite voivodeship order. Worth aligning to one wording
while we are in here; both fields are hers to edit in the Studio.

---

## 5. Stopka — WhatsApp pod numerem telefonu

> _„a da sie w stopce jeszcze dopisać WhadsApp/ stopka -kontakt - pod nr telefonu”_

Yes. Add a WhatsApp row to the footer's Kontakt column, directly under the existing phone link.

### Implementation

- **Schema:** new optional `contactWhatsApp` field on the `footer` singleton
  (`studio/src/schemaTypes/objects/footer.ts`), in the „Kontakt” group, described in Polish for the
  client.
- **Frontend:** an `<a href="https://wa.me/48XXXXXXXXX">` row in `Footer.tsx` matching the existing
  phone/e-mail rows (icon + text, `hover:text-white`). Icon: `FaWhatsapp` from `react-icons/fa6` —
  lucide has no brand glyphs (the Round-1 footer lesson). Sanitise the number the way the `tel:`
  href already is; `wa.me` needs digits with the country code and **no** `+` or spaces.
- ⚠️ **Requires a Studio redeploy** (`npm run deploy` from `studio/`) before she can edit the field
  herself — it is a schema change.

### Decision needed — which number?

The privacy-policy text lists **two**: `661 242 507` (the one in the footer today) and
`781 429 378` (the number she messages from, and the likelier WhatsApp Business line). **Ask.**
Guessing here means putting a wrong number in front of customers.

Optionally add a pre-filled message (`?text=Dzień%20dobry…`) — nice touch, but ask first.

---

## 6. Kody Google (Ads / Analytics) — „MEGA WAŻNE”

> _„jak ci przesle kody + instrukcje google - to zainstalujesz je na stronie - to jest niezbedne do
> reklam”_

**Answer: yes.** Confirmed the repo currently has **no** analytics of any kind — zero hits for
`gtag`, `dataLayer`, `googletagmanager` or `GoogleAnalytics` anywhere in `frontend/`. Nothing is
being measured today.

### What to ask her to send

1. **Which product(s):** Google Ads conversion tracking, GA4, Google Tag Manager, or Search Console
   verification. Each is a different snippet and they are routinely confused for one another.
2. **The IDs**, not screenshots: `G-XXXXXXXXXX` (GA4), `AW-XXXXXXXXX` + the conversion label (Ads),
   `GTM-XXXXXXX` (Tag Manager), or the `google-site-verification` string.
3. **What counts as a conversion** — almost certainly a submitted quotation form.

### How it will be installed

- Tags go in `frontend/app/layout.tsx` via `next/script` or `@next/third-parties/google`, with IDs in
  env vars (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_GOOGLE_ADS_ID`) so they can change without a code edit.
  These are public by nature — unlike the Resend/Sanity secrets, they belong in `NEXT_PUBLIC_*`.
- **Conversions are already trackable by URL.** The thank-you routes built in July
  (`/wycena/{taras,zadaszenie,zaluzje,schody}/przeslany-formularz`) give a **distinct URL per form**,
  reachable only after a real submission — exactly what Google Ads wants as a conversion page. That
  groundwork is done; only the tag is missing.
- ⚠️ **The contact form is a modal with no URL,** so it cannot be counted the same way. It needs an
  explicit event push instead, if she wants it measured.

### Two things to raise with her before the tags go live

1. ⚠️ **A cookie-consent banner does not exist on this site.** Under EU/Polish law, advertising and
   analytics cookies require prior consent, and Google requires **Consent Mode v2** for EEA traffic
   in Ads. The privacy policy she sent already promises visitors information about cookies. So
   installing ad tags realistically means adding a consent banner too — a feature of its own, worth
   scoping and pricing separately.
2. ⚠️ **There is still no `robots.ts`,** so nothing points crawlers at the sitemap (flagged in
   Round 5 and still open). Cheap to add while we are doing SEO/ads plumbing.

---

## 7. Polityka prywatności / RODO — strona + linki

> _„jeszcze RODO do wstawienia” / „polityka prywatności - chyba w stopce + przekierowania ze
> wszystkich formularzy”_

### ⚠️ This fixes a live bug, not just a missing page

`/polityka-prywatnosci` **does not exist** — there is no route and no redirect. Six places on the
live site already link to it, so every one of them is a **404 today**:

| Where                                                                                    | Link text            |
| ---------------------------------------------------------------------------------------- | -------------------- |
| [Footer.tsx:59](frontend/app/components/layout/Footer.tsx#L59) — legal bar               | Polityka prywatności |
| [ContactForm.tsx:120](frontend/app/components/forms/ContactForm.tsx#L120) — RODO consent | Polityki prywatności |
| [TarasForm.tsx:293](frontend/app/components/forms/TarasForm.tsx#L293) — RODO consent     | Polityką prywatności |
| [ZadaszenieForm.tsx:256](frontend/app/components/forms/ZadaszenieForm.tsx#L256)          | Polityką prywatności |
| [ZaluzjeForm.tsx:181](frontend/app/components/forms/ZaluzjeForm.tsx#L181)                | Polityką prywatności |
| [SchodyForm.tsx:212](frontend/app/components/forms/SchodyForm.tsx#L212)                  | Polityką prywatności |

So the client's „przekierowania ze wszystkich formularzy” **already exist as links** — they simply
have nothing to land on. Creating the page fixes all six at once; no form edits needed.

⚠️ **The footer's other two legal links are 404s as well:** `/regulamin` and `/polityka-cookies`
([Footer.tsx:58-62](frontend/app/components/layout/Footer.tsx#L58-L62)). The client sent only the
privacy policy. **Decide with her:** supply that text too, or remove the two links until she has it.
Leaving visible 404s in the footer is the worst of the three options.

### Implementation

**New route `frontend/app/polityka-prywatnosci/page.tsx`** — a static, readable legal page: page
title „Polityka prywatności” (the layout's `%s | <site>` template appends the brand — do not repeat
it), prose styling consistent with `/o-nas`, and the `/o-nas` metadata pattern. Add it to
`app/sitemap.ts` (currently 17 URLs → 18).

**Decision needed — where does the text live?**

- **(a) Hardcoded in the page component.** Fastest; matches how the forms' fine print is handled.
  Any wording change is then a developer job — and she has said before that she wants to edit copy
  herself („w formularzach nie mogę sama zmieniać”).
- **(b) A `legalPage` CMS singleton** (fixed id, `title` + body), the `aboutPage` precedent.
  _Recommended._ Legal text changes (new address, new consent purpose, a lawyer's revision) then
  cost her nothing. Costs one schema type and a Studio redeploy.
  Note `/o-nas` renders long copy from a plain `text` field split on `\n{2,}` and deliberately
  avoids Portable Text — but this document has **numbered clauses and bullet lists**, which that
  splitter cannot express. Either accept Portable Text here (a first for this repo) or model the
  page as an array of `{heading, paragraphs[], bullets[]}` sections.

### ⚠️ Problems in the supplied text — flag to the client, do not silently fix

The text is reproduced verbatim in the appendix. Four things need her (or her lawyer's) decision:

1. **It opens mid-word:** „**iniejsza** polityka prywatności…” — the „N” was lost in the paste.
2. **Legal-form contradiction.** It says the owners are two named people „prowadzący działalność
   gospodarczą pod nazwą CCOMPLEX sp. z o.o. … wpisany do **Centralnej Ewidencji i Informacji
   Działalności Gospodarczej**” while simultaneously giving a **KRS 0001031202**. A sp. z o.o. is
   registered in the **KRS**, not CEIDG, and a limited company is not a sole trader. This is a real
   defect in a legal document — it must be corrected by her, not by us.
3. **No retention period and no list of recipients.** Clause 7 covers profiling, but the standard
   RODO items „okres przechowywania danych” and „odbiorcy danych” are missing — and the site really
   does pass personal data to third parties: **Resend** (form e-mails), **Vercel** (hosting),
   **Sanity** (CMS), and — once item 6 lands — **Google**. A lawyer should look at that.
4. **The cookies section describes storing „hasło czy login”**, which this site has no accounts for,
   and it will need to describe the advertising cookies from item 6 once those are installed.

### Also: a name inconsistency worth one edit

The company is **„CCOMPLEX sp. z o.o.”** in the supplied policy and **„CComplex sp. z o.o.”** in the
footer contact block, but the five forms' RODO consents say **„Complex sp. z o.o.”** (one C). On a
consent checkbox the controller's name should match the policy exactly. One string in each of the
five form components.

---

## Open questions for the client

1. **#2** — „BEZPŁATNA WYCENA” in literal caps, or sentence case to match the site's three other
   „Bezpłatna wycena” buttons?
2. **#3** — Does „pogrubiony” mean the footer Facebook icon, the new realizacje links, or both?
   And is `facebook.com/ccomplex.plTarasy` the canonical profile URL?
3. **#5** — Which number is the WhatsApp line: **661 242 507** or **781 429 378**? Pre-filled
   message text?
4. **#6** — Which Google products, and does she accept that a cookie-consent banner is needed
   alongside the ad tags (separate feature)?
5. **#7** — CMS-editable legal page or hardcoded? Corrected text for the CEIDG/KRS contradiction and
   the missing „N”? And: supply `/regulamin` + `/polityka-cookies`, or remove those two footer links?
6. **General** — are there other unpublished drafts sitting in the Studio, like the navbar one?

---

## Explicitly out of scope this round

- Item 1 (schody catalogue) — already resolved in the CMS.
- The cookie-consent banner — flagged under #6, scoped separately.
- `robots.ts` — offered in Round 5, still not taken.
- The pre-existing uncommitted working-tree noise: `.mcp.json`, `OfferTechSpecs.tsx`,
  `ProjectsGrid.tsx`, `.claude/settings.local.json`, `.playwright-mcp/`, and the content-identical
  CRLF drift in `sanity.schema.json` / `frontend/sanity.types.ts` / `studio/sanity.types.ts`.
  Same precedent as every prior round: leave them alone.

---

## Verification checklist

- [ ] `navbar` published; header CTA reads the agreed label on the live site.
- [ ] Footer tagline says „na wybranych obszarach woj. śląskiego i opolskiego”.
- [ ] Facebook link present and bold in **both** realizacje contexts; `target="_blank"` +
      `rel="noopener noreferrer"`; URL free of `notif_*` parameters.
- [ ] WhatsApp row under the phone in the footer; the `wa.me` link opens the right number on a phone.
- [ ] `/polityka-prywatnosci` returns **200**; all six links reach it (footer + 5 forms).
- [ ] `/regulamin` and `/polityka-cookies` either resolve or are removed from the footer.
- [ ] `/polityka-prywatnosci` added to `sitemap.ts` (17 → 18 URLs).
- [ ] Google tags fire on the live domain and register a conversion from a
      `/wycena/*/przeslany-formularz` pageview (test with Google Tag Assistant).
- [ ] `npm test`, `npm run type-check`, `npm run lint`, clean `next build` after `rm -rf .next`.
- [ ] In-browser (Playwright/Chromium): 0 console errors, 0 warnings; no horizontal overflow at
      390 px on the new legal page and the footer.
- [ ] Studio redeployed (`npm run deploy` from `studio/`) **if** #5 or a CMS-owned #7 lands — she
      cannot see new fields until then.

---

## Appendix — polityka prywatności, tekst od klientki (verbatim)

> Reproduced exactly as received, including the truncated first word. **Do not publish as-is** —
> see the four issues flagged in item 7.

```
iniejsza polityka prywatności określa zasady przetwarzania danych osobowych przez witrynę pod nazwą
www.ccomplex.pl, której właścicielem jest Agnieszka Jaszczyk-Kożuch i Sebastian Kożuch, prowadzący
działalność gospodarczą pod nazwą CCOMPLEX sp. z o.o. pod adresem Opole 45-130, ul. Kępska 12,
wpisany do Centralnej Ewidencji i Informacji Działalności Gospodarczej prowadzonej przez Ministra
ds. Gospodarki pod numerem NIP: 7543359039, REGON: 525049847, KRS 0001031202, adres poczty
elektronicznej e-mail: info@ccomplex.pl i biuro@ccomplex.pl oraz numery telefonu 661 242 507 i
781 429 378 (zwaną dalej „Administratorem”).

Ochrona danych osobowych

Szanowni Państwo,

Ochrona danych osobowych Klientów firmy CCOMPLEX sp. z o.o. to jeden z najważniejszych aspektów
naszej pracy. Szanujemy Państwa prywatność i dokładamy wszelkich starań, aby Państwa dane osobowe
były bezpieczne. W związku z tym przekazujemy Państwu informacje o najważniejszych kwestiach
związanych z przetwarzaniem Państwa danych osobowych.

Firma CCOMPLEX sp. z o.o. informuje, że zgodnie z art. 13 ust. 1 i 2 ogólnego Rozporządzenia
o Ochronie Danych Osobowych z dnia 27 kwietnia 2016 r. (dalej RODO):

1. Administratorem Pani/Pana danych osobowych jest firma CCOMPLEX sp. z o.o., Opole 45-130,
   ul. Kępska 12.

2. Pani/Pana dane osobowe przetwarzane będą w celu przesłania:
   * formularza wyceny tarasu,
   * formularza wyceny zadaszenia,
   * formularza wyceny żaluzji,
   * formularza wyceny schodów,
   * formularza kontaktowego.

3. Osobie, której dane są przetwarzane przez Administratora, przysługuje:
   * prawo dostępu do treści danych, na podstawie art. 15 RODO;
   * prawo do sprostowania danych, na podstawie art. 16 RODO;
   * prawo do usunięcia danych, na podstawie art. 17 RODO;
   * prawo do ograniczenia przetwarzania danych, na podstawie art. 18 RODO;
   * prawo do przenoszenia danych, na podstawie art. 20 RODO;
   * prawo wniesienia sprzeciwu wobec przetwarzania danych, na podstawie art. 21 RODO.

(Uwaga: realizacja powyższych praw musi być zgodna z przepisami prawa, na podstawie których odbywa
się przetwarzanie danych).

4. W przypadku, w którym przetwarzanie Pani/Pana danych odbywa się na podstawie zgody (tj. art. 6
   ust. 1 lit. a RODO), przysługuje Pani/Panu prawo do wycofania zgody w dowolnym momencie, przy
   czym cofnięcie zgody nie ma wpływu na zgodność przetwarzania, którego dokonano na jej podstawie
   przed cofnięciem zgody.

5. Ma Pani/Pan prawo wniesienia skargi do organu nadzorczego, tj. Prezesa Urzędu Ochrony Danych
   Osobowych, gdy Pani/Pan uzna, że przetwarzanie danych osobowych narusza przepisy RODO.

6. Podanie przez Panią/Pana danych osobowych jest warunkiem kontaktu, w tym w sprawie wycen i innych
   zapytań związanych z prowadzoną przez nas działalnością.

7. Pani/Pana dane osobowe nie podlegają zautomatyzowanemu podejmowaniu decyzji, w tym profilowaniu.

Pliki cookies

Witryna internetowa nie zbiera w sposób automatyczny żadnych danych, z wyjątkiem danych zawartych
w plikach cookies podczas samego korzystania z witryny. Pliki cookies to małe pliki tekstowe
wysyłane przez Witrynę internetową i przechowywane na Państwa komputerze, zawierające pewne
informacje związane z korzystaniem przez Państwa z Witryny internetowej. Wykorzystywane przez
Witrynę internetową pliki cookies mogą mieć charakter tymczasowy lub trwały. Tymczasowe pliki
cookies są usuwane z chwilą zamknięcia przeglądarki, natomiast stałe pliki cookies są przechowywane
także po zakończeniu korzystania przez Państwa z witryny i służą do przechowywania informacji takich
jak Państwa hasło czy login, co przyspiesza i ułatwia korzystanie z Witryny.

W każdym wypadku mogą Państwo zablokować instalowanie plików cookies lub usunąć stałe pliki cookies,
wykorzystując stosowne opcje Państwa przeglądarki internetowej. W razie problemów doradzamy
skorzystać z pliku pomocy przeglądarki lub skontaktować się z producentem przeglądarki, z której
Państwo korzystacie.

Dane są przechowywane przez okres niezbędny do świadczenia usługi żądanej przez Użytkownika lub też
przez okres określony przez cele opisane w niniejszym dokumencie. Użytkownik może zawsze poprosić
Administratora Danych o zawieszenie lub usunięcie danych.
```
