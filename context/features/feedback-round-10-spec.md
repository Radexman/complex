# Client Feedback — Round 10 (przekierowania między ofertami, drugi formularz, adresy „dziękuję”)

> **Source:** WhatsApp message from the client + 3 screenshots of her feedback document, 01.09.2026.
> All visible copy is **Polish**; all identifiers stay **English**.

> _„Generalnie — przekierowania ze stron oferta (oprócz schodów) na inne powiązane strony +
> formularz zadaszeń — dodatkowy na stronie akcesoria (tam są pozostałe zabudowy do zadaszeń) +
> ''nasze realizacje'' — zamiana na ''nasze wybrane realizacje''. Piszę przykładowo jakie powinny
> być adresy po przesłaniu formularza. Adresy z nowej strony — można przesłać teraz czy potem?
> Na pewno będę potrzebować adresów do ADS — konwersje.”_

---

## Status

Not started — this document is the comprehension pass, not the implementation.

---

## Overview

| #   | Item                                                           | Where it lives                           | Needs deploy?             | Difficulty  |
| --- | -------------------------------------------------------------- | ---------------------------------------- | ------------------------- | ----------- |
| 1   | Przekierowania między podstronami oferty (oprócz schodów)      | Schema + komponent + CMS                 | yes + **Studio redeploy** | **largest** |
| 2   | Drugi formularz (zadaszenia) na stronie „Akcesoria”            | Schema + `OfferFormCta` + CMS            | yes + **Studio redeploy** | medium      |
| 3   | „Nasze realizacje” → „Nasze wybrane realizacje”                | Kod (1 miejsce) + CMS (1–3)              | częściowo — patrz niżej   | trivial     |
| 4   | Konwersje Google Ads na stronach „dziękuję” (adresy bez zmian) | `layout.tsx` + `FormThankYouPanel` + env | yes                       | medium      |

Item 4: **adresy zostają bez zmian** (decyzja podjęta) — konwersje wpinamy zdarzeniem, nie regułą na URL.

---

## 1. Przekierowania między podstronami oferty

> _„przekierowania ze stron oferta (oprócz schodów) na inne powiązane strony”_

### Co już jest

Każda podstrona oferty ma już pod galerią link **„Zobacz wybrane realizacje” → `/realizacje`**
([OfferGallery.tsx:150-162](frontend/app/components/offer/OfferGallery.tsx#L150-L162), dodany
w Rundzie 7). Klientka pisze „**Pod tekstem** — zobacz wybrane realizacje + przekierowanie na …”,
więc nowy blok ma trafić **bezpośrednio pod ten link**, nie zamiast niego.

Istnieją też nieużywane pola `galleryFooterText` i `galleryFacebookUrl` (Runda 7) — na wszystkich
6 usługach są `null`. To **osobne** pole (stopka galerii); nie należy go przeciążać nową funkcją.

### Mapa przekierowań z dokumentu klientki

| Strona (slug)           | Tekst pogrubiony                                                                                                               | Etykieta przycisku            | Cel                               |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ----------------------------- | --------------------------------- |
| `zadaszenia-tarasowe`   | „Zobacz dostępne zabudowy, rolety, oświetlenie LED i pozostałe akcesoria do zadaszeń tarasowych”                               | **Zobacz akcesoria**          | `/oferta/akcesoria-do-zadaszen`   |
| `akcesoria-do-zadaszen` | „Zobacz dostępne modele zadaszeń tarasowych, do których można dobrać zabudowy, rolety, oświetlenie LED i pozostałe akcesoria.” | **Zobacz zadaszenia**         | `/oferta/zadaszenia-tarasowe`     |
| `tarasy-kompozytowe`    | ⚠️ **brak w dokumencie**                                                                                                       | **Zobacz tarasy gresowe**     | `/oferta/tarasy-gresowe`          |
| `tarasy-drewniane`      | ⚠️ **brak w dokumencie**                                                                                                       | **Zobacz tarasy kompozytowe** | `/oferta/tarasy-kompozytowe`      |
| `tarasy-gresowe`        | ⚠️ **brak w dokumencie**                                                                                                       | **Zobacz tarasy kompozytowe** | `/oferta/tarasy-kompozytowe`      |
| `schody-modulowe`       | —                                                                                                                              | —                             | **wykluczone** („oprócz schodów”) |

### Rozbieżności do potwierdzenia z klientką

1. **Trzy strony tarasowe nie mają tekstu wprowadzającego** — w dokumencie kolumna z tekstem jest
   pusta („Pod tekstem — zobacz wybrane realizacje ….”), podana jest tylko etykieta przycisku.
   Do zdecydowania: czy sam przycisk wystarczy, czy dopisze zdania jak dla zadaszeń/akcesoriów.
   **Nie wymyślamy jej copy** — precedens z Rundy 8 (marki drewna zostawione puste).
2. **`tarasy-kompozytowe` → tylko gresowe?** Kompozytowe wskazują na gresowe, ale gresowe
   i drewniane wskazują z powrotem na kompozytowe. Drewniane nie są linkowane znikąd, a kompozytowe
   nie linkują do drewnianych. Prawdopodobnie chce po jednym linku na stronę — warto zapytać, czy
   każda strona tarasowa nie powinna linkować do **obu** pozostałych.
3. ⚠️ **Trzeci screenshot jest ucięty** na wierszu „Strona schody…” — możliwe, że dokument zawiera
   dalsze wiersze, których nie widzimy. Poprosić o pełny plik.

### Propozycja implementacji (CMS-driven, nie hardcode)

Nowa grupa pól **„Powiązane oferty”** na dokumencie `service`
([studio/src/schemaTypes/documents/service.ts](studio/src/schemaTypes/documents/service.ts)):

```ts
relatedOffers: array of {
  text?: string,                // zdanie wprowadzające (opcjonalne)
  label: string,                // etykieta przycisku, np. „Zobacz akcesoria”
  target: reference -> service, // NIE surowy href
}
```

- **Tablica, nie pojedynczy obiekt** — dzięki temu punkt 2 wyżej („linkuj do obu”) nie wymaga
  migracji schematu, jeśli klientka zmieni zdanie.
- **`reference → service`, nie pole tekstowe z URL-em** — slug rozwiązywany w GROQ
  (`target->{title, "slug": slug.current}`), więc zmiana sluga w CMS nie zostawia martwego linku.
  To dokładnie ten problem, który wygenerował trzy wpisy w `redirects()` w `next.config.ts`.
- Przycisk w stylu strony głównej — zielony wypełniony `bg-accent` (screenshot pokazuje wyraźny
  przycisk, nie tekstowy link jak „Zobacz wybrane realizacje”).
- Sekcja renderuje się tylko gdy `relatedOffers` niepuste → `schody-modulowe` po prostu nie dostaje
  wpisu i nic się tam nie zmienia.

**Do decyzji — gdzie to renderować.** Rekomendacja: **osobny komponent `OfferRelatedLinks`**
renderowany w `OfferPage` zaraz po `OfferGallery`, a nie wewnątrz galerii. Powód: `OfferGallery`
zwraca `null`, gdy nie ma zdjęć ([OfferGallery.tsx:98](frontend/app/components/offer/OfferGallery.tsx#L98)),
więc oferta bez realizacji straciłaby razem z galerią również przekierowanie.

⚠️ **Pułapka GSAP (lekcja z Rundy 7):** blok dołożony do grupy `data-gallery-header` animuje się
**przed** kafelkami, mimo że leży wizualnie pod nimi. Nowy blok musi mieć własną grupę reveal.

---

## 2. Drugi formularz na stronie „Akcesoria do zadaszeń”

> _„Strona akcesoria (czyli 2 formularze) — przecież pozostałe akcesoria są właśnie w form. zadaszeń.
> Pod przyciskiem ''wypełnij formularz wyceny żaluzji'' powinien być 2 formularz ''wypełnij formularz
> zadaszeń''”_

### Stan obecny

`akcesoria-do-zadaszen` ma `relatedFormSlug: "zaluzje"`, więc `OfferFormCta` renderuje **jeden**
przycisk → `/wycena/zaluzje`, z podpisem „Prowadzi do: **Formularz wyceny żaluzji**”
([OfferFormCta.tsx:111-127](frontend/app/components/offer/OfferFormCta.tsx#L111-L127)).

Klientka ma rację merytorycznie: zabudowy, rolety i oświetlenie LED to pola **formularza zadaszeń**,
nie żaluzji — więc kto trafi na „Akcesoria” szukając zabudowy, dziś nie ma dokąd pójść.

### Propozycja implementacji

Nowe **opcjonalne** pole `secondaryFormSlug` na `service` (ta sama lista `RELATED_FORM_SLUGS`,
grupa „CTA formularza”) + opcjonalne `secondaryFormButtonLabel`.

- `OfferFormCta` renderuje drugi przycisk pod pierwszym, gdy pole jest ustawione — w stylu
  **secondary** (ghost/outline), żeby hierarchia była czytelna: formularz żaluzji zostaje głównym
  formularzem tej strony.
- Każdy przycisk zachowuje własny podpis „Prowadzi do: …” z istniejącej mapy `FORM_LABELS`
  ([OfferFormCta.tsx:15-20](frontend/app/components/offer/OfferFormCta.tsx#L15-L20)).
- Generyczne, nie hack pod jedną stronę — puste na pozostałych 5 usługach, więc nic się tam nie
  zmienia. Ten sam wzorzec co `benefit.linkText`/`linkUrl` z Rundy 8.
- ⚠️ Zmiana **nie** dotyczy hero ani navbara: `OfferHero` bierze `relatedFormSlug` do przycisku
  „Bezpłatna wycena”, a navbar ma hardcodowaną mapę `OFFER_FORM_HREFS`. Tam ma zostać jeden,
  główny CTA — drugi formularz celowo nie trafia do żadnego z tych dwóch miejsc.

---

## 3. „Nasze realizacje” → „Nasze wybrane realizacje”

> _(screenshot 2)_ „Nasze realizacje — chcę zmienić na **NASZE WYBRANE REALIZACJE**”

Ciąg występuje w **czterech** miejscach widocznych dla użytkownika. Nie wszystkie to nagłówki:

| Miejsce                                                     | Wartość                   | Typ     | Zmienić?                                             |
| ----------------------------------------------------------- | ------------------------- | ------- | ---------------------------------------------------- |
| `OfferGallery.tsx:112` — etykieta nad „Galeria — …”         | „Nasze realizacje”        | **kod** | **tak** — to ten ze screenshota                      |
| `featuredProjectsSection.eyebrow` (strona główna)           | „Nasze realizacje”        | **CMS** | tak — sama publikacja, bez deploya                   |
| `bottomCtaSection.secondaryCtaLabel`                        | „Nasze realizacje”        | **CMS** | ⚠️ to **etykieta przycisku**, nie nagłówek — zapytać |
| `FormSuccessState.tsx:166` — przycisk na stronie „dziękuję” | „Zobacz nasze realizacje” | **kod** | ⚠️ przycisk — zapytać                                |

Nagłówek sekcji na stronie głównej to już **„Wybrane realizacje”** (`featuredProjectsSection.headline`),
więc etykieta „Nasze realizacje” tuż nad nim faktycznie się z nim kłóci — to najpewniej to, co ją uwiera.

**Do decyzji:** wersaliki czy zwykły zapis? Napisała „NASZE WYBRANE REALIZACJE” z pogrubionym
„WYBRANE”, ale etykieta w `OfferGallery` ma już `uppercase` w CSS, a nagłówek na stronie głównej nie.
Ta sama pułapka co „BEZPŁATNA WYCENA” w Rundzie 9 — **nie wpisywać kapitalików do treści**, sterować
tym stylem.

---

## 4. Adresy stron „dziękuję” — konwersje Google Ads

> _„piszę przykładowo jakie powinny być adresy po przesłaniu formularza. Adresy z nowej strony —
> można przesłać teraz czy potem? Na pewno będę potrzebować adresów do ADS — konwersje.”_

### Stan obecny — te adresy **już istnieją i działają**

Podstrony potwierdzenia powstały 28.07.2026 dokładnie po to, żeby każde wysłanie formularza miało
**własny URL** do policzenia w Ads/GA. Dziś jest ich pięć:

| Formularz                    | Adres po wysłaniu                        |
| ---------------------------- | ---------------------------------------- |
| Wycena tarasu                | `/wycena/taras/przeslany-formularz`      |
| Wycena zadaszenia            | `/wycena/zadaszenie/przeslany-formularz` |
| Wycena żaluzji (akcesoria)   | `/wycena/zaluzje/przeslany-formularz`    |
| Wycena schodów               | `/wycena/schody/przeslany-formularz`     |
| Formularz kontaktowy (modal) | `/dziekujemy-kontakt`                    |

Wszystkie są `robots: noindex` i wpuszczają wyłącznie po realnym wysłaniu (wejście z linku
przekierowuje z powrotem na formularz) — czyli nie da się nabić konwersji botem ani zakładką.

### Rozbieżność: jej lista ≠ liczba formularzy

Jej propozycja to 5 adresów, ale **nie mapują się 1:1** na formularze:

| Jej adres                       | Odpowiednik dziś                         | Uwaga                                         |
| ------------------------------- | ---------------------------------------- | --------------------------------------------- |
| `/dziekuje/zadaszenia/`         | `/wycena/zadaszenie/przeslany-formularz` | ✅ 1:1                                        |
| `/dziekuje/tarasy-kompozytowe/` | `/wycena/taras/przeslany-formularz`      | ⚠️ **jeden formularz na wszystkie tarasy**    |
| `/dziekuje/tarasy-gresowe/`     | `/wycena/taras/przeslany-formularz`      | ⚠️ ten sam formularz co wyżej                 |
| `/dziekuje/schody-modulowe/`    | `/wycena/schody/przeslany-formularz`     | ✅ 1:1                                        |
| `/dziekuje/kontakt/`            | `/dziekujemy-kontakt`                    | ✅ 1:1                                        |
| —                               | `/wycena/zaluzje/przeslany-formularz`    | ⚠️ **brak na jej liście** (żaluzje/akcesoria) |
| —                               | (brak)                                   | ⚠️ **brak `tarasy-drewniane`**                |

**Sedno:** jest **jeden** „Formularz Wyceny Tarasu” obsługujący wszystkie materiały — kompozyt, gres
i drewno wybiera się w nim polem „Materiał” (`Kompozyt` / `Płyty Gresowe gr. 2 cm` / `Thermo Jesion` /
`Thermo Sosna` / `Świerk`). Trzy podstrony oferty (kompozytowe, drewniane, gresowe) prowadzą do tego
samego `/wycena/taras`. Osobne adresy per materiał wymagają rozgałęzienia po tym polu.

### ✅ DECYZJA: adresów **nie zmieniamy**

Zostają dzisiejsze pięć. Uzasadnienie: działają, są `noindex`, mają blokadę przed wejściem z linku,
a rename oznaczałby przekonfigurowanie konwersji w Ads bez zysku funkcjonalnego. Jej lista i tak
nie mapuje się 1:1 na formularze (patrz tabela wyżej), więc „poprawa” nazw i tak nie dałaby jej
rozbicia kompozyt/gres, o które prawdopodobnie chodziło.

Wariant z rozbiciem tarasu po materiale (`/dziekuje/tarasy-kompozytowe` itd.) zostaje **odłożony**
— gdyby kiedyś chciała licytować osobno na te trzy grupy, materiał jest polem pojedynczego wyboru,
więc mapowanie jest jednoznaczne i wykonalne bez zmiany formularza.

**Do przekazania klientce (adresy pełne, bez ukośnika na końcu):**

```
/wycena/zadaszenie/przeslany-formularz
/wycena/taras/przeslany-formularz        ← kompozyt, gres i drewno w jednym formularzu
/wycena/zaluzje/przeslany-formularz      ← akcesoria do zadaszeń
/wycena/schody/przeslany-formularz
/dziekujemy-kontakt
```

---

### 4a. Podpięcie konwersji Google Ads

**Stan wyjściowy: na stronie nie ma ŻADNEGO taga Google** — ani Ads, ani GA4, ani GTM (potwierdzone
w Rundzie 9: zero trafień na `gtag`, `dataLayer`, `googletagmanager`). Same adresy niczego nie liczą.

#### ⚠️ Kluczowe: konwersja „po adresie URL” tu **nie zadziała** sama z siebie

Strony potwierdzeń są osiągane **nawigacją po stronie klienta** (`router.push` w każdym z pięciu
formularzy), a panel montuje się przez `dynamic(..., { ssr: false })`. Nie ma pełnego przeładowania
strony, więc:

- **czysty gtag.js Google Ads** (bez GTM) odpala `config` raz, przy pierwszym załadowaniu — przy
  zmianie trasy w Next.js **nic więcej nie wyśle**, więc konwersja „wyświetlenie strony
  /…/przeslany-formularz” nie odpali się nigdy;
- w GTM da się to obejść wyzwalaczem _History Change_, ale to kruche — zależy od konfiguracji
  po jej stronie, a my o niej nie decydujemy.

**Dlatego robimy konwersję zdarzeniową (event-based), nie adresową.** To jest deterministyczne
i niezależne od domeny — istotne, bo strona najpewniej przeniesie się z `complex-puce.vercel.app`
na `ccomplex.pl`, co unieważniłoby regułę opartą na URL-u.

#### Jedno miejsce podpięcia obsługuje wszystkie pięć konwersji

Wszystkie pięć podstron („dziękuję” × 4 formularze wyceny + kontakt) przechodzi przez ten sam
łańcuch: `ThankYouPageContent` → `FormThankYou` → **`FormThankYouPanel`**
([FormThankYouPanel.tsx](frontend/app/components/forms/shared/FormThankYouPanel.tsx)). Panel ma już
`formType` (`taras` / `zadaszenie` / `zaluzje` / `schody` / `kontakt`) **oraz** blokadę
„czy ten użytkownik faktycznie wysłał formularz” (`submittedEmail !== null`).

To jest idealny hook: zdarzenie odpalamy dokładnie tam, gdzie panel uznaje wysyłkę za prawdziwą,
więc **konwersja ma dokładnie tę samą definicję co potwierdzenie na ekranie** — bot, zakładka
i udostępniony link są odfiltrowane tą samą blokadą, która już działa.

#### Plan implementacji

1. **Zainstalować `@next/third-parties`** (oficjalny pakiet Vercela, nie ma go jeszcze w repo).
2. **Kontener GTM w root layoucie** —
   `<GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GTM_ID} />` w
   [layout.tsx](frontend/app/layout.tsx), renderowany warunkowo (brak zmiennej → brak taga, więc
   `next build` i środowisko lokalne działają bez konfiguracji).
   **GTM, nie same tagi Ads/GA4 w kodzie** — dzięki temu ona albo jej agencja dokłada kolejne tagi
   w panelu GTM, bez naszego deploya za każdym razem.
3. **Zdarzenie w `FormThankYouPanel`**, gdy `submittedEmail !== null`:
   `sendGTMEvent({ event: 'generate_lead', form_type: formType })`.
4. **Zabezpieczenie przed podwójnym liczeniem.** ⚠️ Rekord wysyłki **nie jest kasowany po odczycie**
   (świadomy kompromis z 28.07 — dzięki temu odświeżenie strony nadal pokazuje potwierdzenie).
   Znaczy to, że odświeżenie zliczyłoby konwersję **drugi raz**. Do tego React w trybie deweloperskim
   wywołuje efekty dwukrotnie. Rozwiązanie: osobny klucz w `sessionStorage`
   (`complex:conversion-sent:<formType>`) ustawiany przy pierwszym wysłaniu zdarzenia — zdarzenie
   leci **raz na wysyłkę, na sesję**. Opcjonalnie dorzucić `transaction_id`, żeby Google
   deduplikował też po swojej stronie.
5. **Bez CSP/nonce** — repo nie ma middleware ani nagłówka Content-Security-Policy, więc wariant
   z `nonce` z dokumentacji Next.js nie jest potrzebny.

#### Co ona (lub jej agencja) musi ustawić po stronie Google

- W **GTM**: wyzwalacz _Custom Event_ na `generate_lead` → tag _Google Ads Conversion Tracking_
  z jej ID konwersji i etykietą. Jeśli chce rozróżniać formularze, dokłada warunek na zmienną
  `form_type` (przekazujemy ją w zdarzeniu) — **to daje jej rozbicie per formularz bez zmiany
  adresów**, czyli dokładnie to, o co jej chodziło.
- W **Google Ads**: akcja konwersji typu „Witryna”, podpięta pod ten tag.

#### Czego potrzebujemy od niej

- **GTM container ID** (`GTM-XXXXXXX`) — wariant rekomendowany;
- **albo**, jeśli nie używa GTM: **Google Ads Conversion ID + Label** (`AW-XXXXXXXXX` /
  `AW-XXXXXXXXX/abcDEF…`) oraz **GA4 Measurement ID** (`G-XXXXXXXXXX`) — wtedy tagi wchodzą
  na sztywno w kod i każda zmiana wymaga deploya.

Zmienne trafiają do Vercela jako `NEXT_PUBLIC_*` (ID kontenera GTM jest publiczny z natury —
widać go w źródle każdej strony, która go używa).

#### ⚠️ Zgody i polityka prywatności — do załatwienia **przed** wpięciem tagów

- **Nie ma baneru zgody na cookies.** Tagi reklamowe w EOG wymagają **Consent Mode v2**; bez tego
  jest to problem zgodności z RODO, a nie tylko jakości danych.
- **Polityka prywatności (Runda 9) nie wymienia odbiorców danych ani okresu przechowywania.**
  Dołożenie Google Ads/Analytics powiększa tę lukę — Google staje się kolejnym odbiorcą, obok
  Resend, Vercel i Sanity. To poprawka po stronie jej prawnika, ale trzeba ją o tym uprzedzić.

---

## Pytania do klientki (zebrane)

1. Czy do trzech stron tarasowych dopisze zdania wprowadzające, czy zostawiamy sam przycisk?
2. Czy każda strona tarasowa ma linkować do **obu** pozostałych, czy tylko do tej jednej z tabeli?
3. Pełny dokument — trzeci screenshot jest ucięty na wierszu „Strona schody…”.
4. „Nasze wybrane realizacje”: czy zmieniamy też **etykiety przycisków** („Nasze realizacje”
   w bloku CTA, „Zobacz nasze realizacje” na stronie po wysłaniu), czy tylko nagłówki sekcji?
5. ~~Adresy „dziękuję”: wariant (a)/(b)/(c)?~~ — **rozstrzygnięte: adresy zostają bez zmian.**
   Zamiast tego przekazujemy jej listę dzisiejszych pięciu adresów (sekcja 4).
6. **GTM container ID** (`GTM-XXXXXXX`) — albo, jeśli nie używa GTM: ID konwersji Google Ads
   - etykieta oraz GA4 Measurement ID.

---

## Zakres testów

- `type-check` (oba workspace'y), `lint`, **Vitest** (baseline 172/172 — punkty 1–3 nie dodają nic
  testowalnego; punkt 4 w wariancie (b) dodaje mapowanie materiał → trasa, które **testujemy**),
  czysty `next build` po `rm -rf .next`.
- Na realnym serwerze produkcyjnym: przekierowania z każdej z 5 podstron oferty prowadzą pod właściwy
  adres (200, nie 404); `schody-modulowe` **nie** ma bloku przekierowań; strona akcesoriów renderuje
  **dwa** przyciski formularzy; nowe adresy „dziękuję” zwracają 200 po wysłaniu i przekierowują przy
  wejściu z linku.
- W przeglądarce: 0 błędów i ostrzeżeń w konsoli, brak przewijania w poziomie przy 390 px,
  0 zagnieżdżonych `<a>` w nowym bloku, animacja GSAP dochodzi do `opacity: 1` (uwaga na stagger —
  lekcja z Rundy 9: jeden pomiar nie wystarczy, trzeba 6–7 s na ustabilizowanie).

## Poza zakresem

- ✅ `/oferta/elewacje-kompozytowe` — **ostrzeżenie z Rundy 9 jest już nieaktualne.** Sprawdzone
  w tej sesji: w kodzie nie ma **ani jednego** odwołania do `elewacje`, a `next.config.ts` ma stały
  redirect `/oferta/elewacje-kompozytowe` → `/oferta` (308). Draftu tej usługi też już nie ma
  w datasecie. Nic do naprawy.
- Baner zgody na cookies / Consent Mode v2.
- Zaległe nieopublikowane drafty (`aboutPage`, `siteSettings`, 2 × `project`, `service`).
