# Offer Pages — Part 5 of 7: Technical Specs Section

## Overview

This spec covers the `OfferTechSpecs` component — the fifth section on every offer page. It presents practical installation and product specification information in a clean two-column layout of glass info cards. This replaces the "Niezbędnik informacji" block from the old page, redesigned to match the dark architectural aesthetic of the rebrand. All content managed via Sanity. All visible text in Polish.

---

## Sanity Schema — additions to `service` document

Append the following fields to `sanity/schemas/service.ts`:

- `techSpecsHeadline` — string — section headline, default: "Informacje techniczne i montaż"
- `techSpecsDescription` — string — optional short paragraph below the headline, max 2 sentences
- `techSpecs` — array of objects (min 1, max 8), each with:
  - `icon` — string — icon identifier, same `options.list` lookup pattern as benefits. Uses the same allowed icon values from specs 1–2 (`"shield"`, `"clock"`, `"award"`, `"users"`, `"star"`, `"check"`, `"tool"`, `"map"`, `"sun"`, `"droplets"`, `"ruler"`, `"zap"`), plus the following new values:
    - `"home"` → `Home` Lucide icon
    - `"euro"` → `Euro` Lucide icon
    - `"file"` → `FileText` Lucide icon
    - `"phone"` → `Phone` Lucide icon
  - `title` — string — card heading, e.g. "Montaż zadaszeń"
  - `content` — text — main card body, 2–4 sentences or a short list rendered as plain text

---

## Component Requirements

- File: `src/components/offer/OfferTechSpecs.tsx`
- Props: `techSpecsHeadline`, `techSpecsDescription`, `techSpecs[]`
- If `techSpecs` array is empty or undefined, render nothing (`return null`)
- Background: `bg-bg-deep` (`#0B0B0C`)
- Apply `.section-padding`

### Header Block (left-aligned)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Specyfikacja"
- Headline: `font-heading text-4xl font-bold text-white`
- Description (if present): `font-body text-base text-silver max-w-2xl mt-3`

### Specs Grid

- `grid grid-cols-2 gap-4 mt-10` on desktop, `grid-cols-1` on mobile
- Each spec card:
  - `glass` utility class + `rounded-xl p-6 border border-graphite`
  - Hover: `hover:border-accent/30 transition-colors duration-300`
  - Top row: icon container + title on the same line, `flex items-center gap-3 mb-4`
    - Icon container: `w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0`
    - Icon: resolved from `icon` string via lookup map (extend existing map with new icons listed above), `text-accent`, size `20`
    - Title: `font-heading text-lg font-semibold text-white`
  - Content: `font-body text-sm text-silver leading-relaxed`
  - Thin top accent line: `border-t-2 border-t-accent/30 rounded-t-xl` — subtle green top border to differentiate from benefit cards which have a full border hover

---

## Seed Initial Content

### Zadaszenia aluminiowe

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- `techSpecsDescription`: "Realizujemy kompleksowy montaż zadaszeń — od pomiaru przez projekt po odbiór. Poniżej znajdziesz kluczowe informacje przed podjęciem decyzji."
- Specs:
  - `tool` / "Montaż zadaszeń" / "Montaż realizujemy na terenie województw śląskiego i opolskiego. Czas realizacji od zamówienia wynosi zazwyczaj 3–6 tygodni. Ekipa montażowa pracuje sprawnie, minimalizując uciążliwości dla domowników."
  - `file` / "Umowa i gwarancja" / "Każda realizacja objęta jest umową pisemną z określonym zakresem prac i terminem. Udzielamy gwarancji na wykonanie montażu oraz przekazujemy gwarancję producenta na materiały i konstrukcję."
  - `euro` / "Podatek VAT" / "Przy montażu zadaszeń na budynkach mieszkalnych zastosowanie może mieć obniżona stawka VAT 8%. Szczegóły ustalamy indywidualnie na etapie wyceny."
  - `home` / "Realizacje" / "Zrealizowaliśmy setki zadaszeń na terenie Śląska i Opolszczyzny. Chętnie pokażemy przykłady podobnych realizacji w Twojej okolicy przed podjęciem decyzji."
  - `ruler` / "Wymiary i konfiguracja" / "Zadaszenia wykonujemy na wymiar — szerokość do 8 m, wysięg do 4 m w zależności od systemu. Możliwość montażu do ściany lub jako konstrukcja wolnostojąca."
  - `phone` / "Bezpłatna konsultacja" / "Oferujemy bezpłatną wizytę pomiarową i konsultację na miejscu inwestycji. Skontaktuj się z nami, aby umówić termin."

### Żaluzje tarasowe

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `tool` / "Montaż żaluzji" / "Montaż żaluzji zewnętrznych realizujemy na terenie Śląska i Opolszczyzny. Czas realizacji od zamówienia to zazwyczaj 2–4 tygodnie."
  - `ruler` / "Wymiary na zamówienie" / "Każda żaluzja produkowana jest na wymiar okna lub drzwi. Mierzymy i wyceniamy bezpłatnie podczas wizyty pomiarowej."
  - `zap` / "Opcja elektryczna" / "Dostępne napędy elektryczne 240V oraz solarne. Możliwość integracji z systemem smart home i automatycznym czujnikiem wiatru."
  - `file` / "Gwarancja i serwis" / "Udzielamy gwarancji na montaż i materiały. Zapewniamy serwis pogwarancyjny i dostępność części zamiennych."
  - `euro` / "Podatek VAT" / "Przy montażu żaluzji na budynkach mieszkalnych może obowiązywać obniżona stawka VAT 8%. Szczegóły ustalamy na etapie wyceny."
  - `phone` / "Bezpłatna wycena" / "Skontaktuj się z nami, aby umówić bezpłatną wizytę pomiarową i otrzymać indywidualną wycenę."

### Tarasy kompozytowe

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `tool` / "Montaż tarasu" / "Realizujemy kompleksowy montaż tarasów kompozytowych wraz z podkonstrukcją. Czas realizacji zależy od powierzchni i wynosi zazwyczaj 1–5 dni roboczych."
  - `droplets` / "Odwodnienie i wentylacja" / "Prawidłowy montaż zapewnia właściwe odwodnienie i wentylację przestrzeni pod deską, co wydłuża żywotność tarasu."
  - `ruler` / "Minimalna powierzchnia" / "Realizujemy tarasy od 10 m² wzwyż. Wycena obejmuje deski, podkonstrukcję aluminiową i wszystkie elementy montażowe."
  - `file` / "Gwarancja" / "Udzielamy gwarancji na montaż oraz przekazujemy gwarancję producenta desek — zazwyczaj 10–25 lat w zależności od systemu."
  - `euro` / "Podatek VAT" / "Przy budowie tarasu przy budynku mieszkalnym może obowiązywać obniżona stawka VAT 8%. Szczegóły ustalamy indywidualnie."
  - `phone` / "Bezpłatna wycena" / "Przyjedziemy na miejsce, zmierzymy powierzchnię i przedstawimy szczegółową wycenę bez zobowiązań."

### Tarasy z płyt gresowych

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `tool` / "Montaż płyt gresowych" / "Płyty gresowe 2 cm montujemy na systemach podwyższonych — regulowanych wspornikach lub w zaprawie. Czas realizacji zależy od powierzchni."
  - `ruler` / "Grubość i formaty" / "Stosujemy wyłącznie płyty o grubości 2 cm. Dostępne formaty od 60x60 cm do 120x120 cm. Duże formaty wymagają użycia specjalistycznych narzędzi montażowych."
  - `droplets` / "System odwodnienia" / "Montaż na regulowanych wspornikach zapewnia naturalny odpływ wody i wentylację. Możliwość instalacji na istniejącej wylewce."
  - `file` / "Gwarancja" / "Gwarancja producenta na płyty gresowe oraz gwarancja na wykonanie montażu."
  - `euro` / "Podatek VAT" / "Przy inwestycjach przy budynku mieszkalnym może obowiązywać obniżona stawka VAT 8%."
  - `phone` / "Bezpłatna wycena" / "Zapraszamy do kontaktu w celu umówienia wizyty pomiarowej i bezpłatnej wyceny."

### Tarasy drewniane

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `tool` / "Montaż tarasu drewnianego" / "Realizujemy tarasy drewniane na podkonstrukcji drewnianej lub aluminiowej. Doradzimy w wyborze gatunku drewna dopasowanego do warunków użytkowania."
  - `sun` / "Pielęgnacja drewna" / "Drewno wymaga regularnego olejowania lub impregnowania — zazwyczaj raz w roku. Prawidłowa pielęgnacja znacznie wydłuża żywotność tarasu."
  - `ruler` / "Dostępne gatunki" / "Realizujemy tarasy z drewna egzotycznego (bangkirai, teak, garapa) oraz krajowego (modrzew, dąb). Każdy gatunek ma inne właściwości i cenę."
  - `file` / "Gwarancja" / "Udzielamy gwarancji na wykonanie montażu. Żywotność tarasu zależy od regularności konserwacji."
  - `euro` / "Podatek VAT" / "Przy budowie tarasu przy budynku mieszkalnym może obowiązywać obniżona stawka VAT 8%."
  - `phone` / "Bezpłatna wycena" / "Skontaktuj się z nami — przyjedziemy, zmierzymy i doradzimy w wyborze najlepszego rozwiązania."

### Elewacje kompozytowe

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `tool` / "Montaż elewacji" / "Elewacje kompozytowe montujemy na ruszcie aluminiowym lub drewnianym. Prace elewacyjne realizujemy na terenie Śląska i Opolszczyzny."
  - `shield` / "Odporność materiału" / "Deski kompozytowe do elewacji są odporne na warunki atmosferyczne, UV i szkodniki. Nie wymagają malowania ani impregnowania przez cały okres użytkowania."
  - `ruler` / "Wymiary i kolory" / "Deski elewacyjne dostępne w szerokiej gamie kolorów i faktur. Cięte na wymiar, co minimalizuje odpad."
  - `file` / "Gwarancja" / "Gwarancja producenta na materiał oraz gwarancja na wykonanie montażu."
  - `phone` / "Bezpłatna konsultacja" / "Zapraszamy do kontaktu — doradzimy w wyborze koloru i faktury oraz wycenimy realizację."

### Schody modułowe

- `techSpecsHeadline`: "Montaż i specyfikacja techniczna"
- Specs:
  - `zap` / "Szybki montaż" / "Schody modułowe montujemy zazwyczaj w ciągu jednego dnia roboczego. Nie są potrzebne prace budowlane ani wylewki."
  - `ruler` / "Konfiguracja schodów" / "System modułowy pozwala na dowolną konfigurację — liczba stopni, kierunek, kąt nachylenia. Stopnie dostępne w materiałach i kolorach dopasowanych do tarasu."
  - `shield` / "Materiały i trwałość" / "Stelaż ze stali ocynkowanej lub aluminium. Stopnie kompozytowe lub drewniane. Odporność na warunki zewnętrzne przez cały rok."
  - `tool` / "Kompatybilność z tarasem" / "Realizujemy schody modułowe jako uzupełnienie tarasu kompozytowego lub drewnianego — w tym samym materiale i kolorze stopni."
  - `file` / "Gwarancja" / "Gwarancja na konstrukcję schodów i montaż."
  - `phone` / "Bezpłatna wycena" / "Skontaktuj się z nami, podaj liczbę stopni i różnicę poziomów — szybko wycenimy i zaproponujemy rozwiązanie."

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 85%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate spec cards with stagger: `y: 30` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.1`, `duration: 0.6`, `ease: "power3.out"`
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Offer Pages, Design System
- `@context/screenshots/screencapture-ccomplex-pl-oferta-zadaszenia-aluminiowe-...png` — original "Niezbędnik informacji" section reference
- `@src/components/offer/OfferBenefits.tsx` — reference for icon lookup map pattern (extend it, do not duplicate)
- `@sanity/schemas/service.ts` — append fields here
- `@src/components/offer/OfferPage.tsx` — add `<OfferTechSpecs />` as fifth child
- `@src/app/globals.css` — CSS variables and utility classes (`glass` utility, CSS vars)
- `src/components/offer/OfferTechSpecs.tsx` — file to create
