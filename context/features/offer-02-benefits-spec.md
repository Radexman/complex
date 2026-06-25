# Offer Pages — Part 2 of 7: Benefits Section

## Overview

This spec covers the `OfferBenefits` component — the second section on every offer page. It sits directly below the hero and communicates the core value of the product through a short description and a grid of feature highlight cards. No bullet walls — clean icon + text blocks styled consistently with the rest of the project. All content managed via Sanity. All visible text in Polish.

---

## Sanity Schema — additions to `service` document

Append the following fields to `sanity/schemas/service.ts`:

- `benefitsHeadline` — string — section headline, e.g. "Dlaczego warto wybrać zadaszenie aluminiowe?"
- `benefitsDescription` — text — 2–3 sentence paragraph elaborating on the product's value proposition, shown below the headline
- `benefits` — array of objects (min 2, max 6), each with:
  - `icon` — string — icon identifier, same `options.list` lookup pattern as `TrustSection`. Allowed values: `"shield"`, `"clock"`, `"award"`, `"users"`, `"star"`, `"check"`, `"tool"`, `"map"`, `"sun"`, `"droplets"`, `"ruler"`, `"zap"`
  - `title` — string — short bold label, e.g. "Odporność na warunki atmosferyczne"
  - `description` — string — one sentence elaborating on the benefit

### Additional icon values to add to the icon lookup map in the component (extend from TrustSection pattern):

| Value | Lucide Icon | Suggested use |
|---|---|---|
| `"sun"` | `Sun` | Weather resistance / outdoor use |
| `"droplets"` | `Droplets` | Waterproofing |
| `"ruler"` | `Ruler` | Custom dimensions |
| `"zap"` | `Zap` | Quick installation / smart features |

---

## Component Requirements

- File: `src/components/offer/OfferBenefits.tsx`
- Props: `benefitsHeadline`, `benefitsDescription`, `benefits[]`
- Background: `bg-bg-mid` (`#111111`)
- Apply `.section-padding`

### Header Block (left-aligned, not centered)

- Eyebrow: `text-accent text-xs font-semibold tracking-widest uppercase mb-3` — hardcoded: "Zalety produktu"
- Headline: `font-heading text-4xl md:text-5xl font-bold text-white`
- Description: `font-body text-base text-silver max-w-2xl mt-4 leading-relaxed`

### Benefits Grid

- `grid grid-cols-3 gap-4 mt-12` on desktop, `md:grid-cols-2`, `sm:grid-cols-1`
- Each benefit card:
  - Background: `bg-bg-surface rounded-xl p-6 border border-graphite`
  - Hover: `hover:border-accent/40 transition-colors duration-300`
  - Icon container: `w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center mb-4`
  - Icon: resolved from `icon` string via lookup map (same pattern as `TrustSection.tsx`), `text-accent`, size `20`
  - Title: `font-heading text-base font-semibold text-white mt-2`
  - Description: `font-body text-sm text-silver mt-1 leading-relaxed`

---

## Seed Initial Content

Add the following `benefits` defaults to each `service` document in Sanity. Add `benefitsHeadline` and `benefitsDescription` per service.

### Zadaszenia aluminiowe

- `benefitsHeadline`: "Dlaczego warto wybrać zadaszenie aluminiowe?"
- `benefitsDescription`: "Zadaszenia aluminiowe łączą estetykę z funkcjonalnością. Trwała konstrukcja z aluminium zapewnia ochronę przed deszczem i słońcem przez cały rok, a szeroki wybór modeli i kolorów pozwala dopasować zadaszenie do każdego stylu architektury."
- Benefits:
  - `shield` / "Trwała konstrukcja" / "Aluminium odporne na korozję i warunki atmosferyczne przez dziesiątki lat."
  - `droplets` / "Ochrona przed deszczem" / "Szczelna konstrukcja chroni taras przez cały rok, niezależnie od pogody."
  - `sun` / "Ochrona przed słońcem" / "Regulowane systemy pozwalają kontrolować nasłonecznienie tarasu."
  - `ruler` / "Wymiary na zamówienie" / "Każde zadaszenie projektujemy indywidualnie pod wymiary Twojego tarasu."
  - `tool` / "Profesjonalny montaż" / "Realizujemy montaż na terenie Śląska i Opolszczyzny z pełną gwarancją."
  - `check` / "10 lat gwarancji" / "Długa gwarancja producenta na konstrukcję i mechanizmy."

### Żaluzje tarasowe

- `benefitsHeadline`: "Komfort i prywatność przez cały rok"
- `benefitsDescription`: "Żaluzje tarasowe to idealne rozwiązanie dla osób ceniących prywatność i swobodę regulacji nasłonecznienia. Dostępne w wielu kolorach i wymiarach, pasują zarówno do nowoczesnych, jak i klasycznych budynków."
- Benefits:
  - `sun` / "Regulacja nasłonecznienia" / "Precyzyjna kontrola ilości światła wpadającego na taras."
  - `shield` / "Ochrona przed wiatrem" / "Żaluzje zewnętrzne skutecznie chronią przed podmuchami wiatru."
  - `ruler` / "Wymiary na zamówienie" / "Produkowane dokładnie pod wymiary okna lub drzwi tarasowych."
  - `zap` / "Sterowanie elektryczne" / "Opcja automatycznego sterowania pilotem lub aplikacją mobilną."
  - `check` / "Trwałe materiały" / "Aluminium i tkaniny wysokiej jakości odporne na UV i warunki atmosferyczne."

### Tarasy kompozytowe

- `benefitsHeadline`: "Estetyka drewna, trwałość kompozytu"
- `benefitsDescription`: "Deski kompozytowe to połączenie naturalnego wyglądu drewna z wyjątkową odpornością na warunki atmosferyczne. Nie wymagają malowania ani impregnacji, zachowując piękny wygląd przez lata."
- Benefits:
  - `droplets` / "Odporność na wilgoć" / "Nie wchłania wody, nie gnije i nie pleśnieje."
  - `sun` / "Odporność na UV" / "Kolor nie blaknie pod wpływem słońca przez wiele sezonów."
  - `tool` / "Bezobsługowość" / "Nie wymaga malowania, impregnowania ani corocznej konserwacji."
  - `shield` / "Wytrzymałość mechaniczna" / "Odporna na zarysowania, uderzenia i intensywne użytkowanie."
  - `ruler` / "Szeroki wybór kolorów" / "Dostępna w wielu odcieniach drewna i kolorach jednolitych."
  - `check` / "Ekologiczny materiał" / "Produkowane z recyklingowanego drewna i tworzyw sztucznych."

### Tarasy z płyt gresowych

- `benefitsHeadline`: "Premium pod stopami — trwałość bez kompromisów"
- `benefitsDescription`: "Płyty gresowe o grubości 2 cm to rozwiązanie dla wymagających klientów. Niezwykła odporność na ścieranie, mróz i intensywne użytkowanie, połączona z eleganckim wyglądem kamienia."
- Benefits:
  - `shield` / "Mrozoodporność" / "Płyty 2 cm wytrzymują ekstremalne wahania temperatur bez uszkodzeń."
  - `droplets` / "Antypoślizgowość" / "Specjalna faktura powierzchni zapewnia bezpieczeństwo nawet przy mokrej nawierzchni."
  - `sun` / "Odporność na UV" / "Kolor i struktura pozostają niezmienione przez lata ekspozycji na słońce."
  - `ruler` / "Duże formaty" / "Dostępne w dużych formatach do 120x120 cm dla efektu premium."
  - `tool` / "Łatwa konserwacja" / "Wystarczy zwykłe mycie — bez impregnowania i specjalnych środków."

### Tarasy drewniane

- `benefitsHeadline`: "Naturalne piękno, ciepło drewna"
- `benefitsDescription`: "Tarasy drewniane to klasyka, która nigdy nie wychodzi z mody. Naturalne drewno egzotyczne lub krajowe nadaje przestrzeni wyjątkowy charakter i ciepło, którego żaden inny materiał nie jest w stanie zastąpić."
- Benefits:
  - `sun` / "Naturalny wygląd" / "Unikalne słoje i faktura drewna tworzą niepowtarzalną przestrzeń."
  - `tool` / "Możliwość renowacji" / "Drewno można szlifować i olejować, przywracając mu pierwotny wygląd."
  - `shield` / "Trwałość przy właściwej pielęgnacji" / "Regularnie impregnowane drewno służy przez dziesiątki lat."
  - `ruler` / "Dowolne kształty" / "Drewno łatwo formować w niestandardowe układy i wzory."
  - `check` / "Naturalny materiał" / "Ekologiczny wybór dla osób ceniących naturalne surowce."

### Elewacje kompozytowe

- `benefitsHeadline`: "Nowoczesna elewacja bez kompromisów"
- `benefitsDescription`: "Elewacje z desek kompozytowych nadają budynkom nowoczesny, architektoniczny charakter. Materiał odporny na warunki atmosferyczne nie wymaga malowania ani corocznej konserwacji."
- Benefits:
  - `droplets` / "Odporność na wilgoć" / "Nie nasiąka wodą i nie odkształca się pod wpływem zmian temperatury."
  - `sun` / "Stabilność koloru" / "Pigmenty odporne na UV — kolor nie blaknie przez lata."
  - `tool` / "Bezobsługowość" / "Nie wymaga malowania ani impregnowania."
  - `shield` / "Odporność na szkodniki" / "Skład kompozytu nie jest atrakcyjny dla owadów ani grzybów."
  - `ruler` / "Dowolne kolory i faktury" / "Szeroka paleta barw i imitacje drewna egzotycznego."

### Schody modułowe

- `benefitsHeadline`: "Schody modułowe — szybko, estetycznie, funkcjonalnie"
- `benefitsDescription`: "Schody modułowe to innowacyjne rozwiązanie łączące szybkość montażu z wyjątkową estetyką. Idealnie komponują się z tarasami kompozytowymi i zadaszonymi przestrzeniami zewnętrznymi."
- Benefits:
  - `zap` / "Szybki montaż" / "Kompletny system modułowy montujemy w ciągu jednego dnia."
  - `ruler` / "Dowolna konfiguracja" / "Możliwość ustawienia pod różnym kątem i w różnych kierunkach."
  - `shield` / "Trwała konstrukcja" / "Stalowy stelaż i stopnie kompozytowe odporne na warunki zewnętrzne."
  - `tool` / "Kompatybilność z tarasem" / "Stopnie w kolorze i materiale tarasu dla spójnego wykończenia."
  - `check` / "Bezpieczeństwo użytkowania" / "Antypoślizgowe stopnie i solidna balustrada w zestawie."

---

## GSAP Animations

- Register `ScrollTrigger`
- Animate header block on scroll entry (`start: "top 80%"`): `y: 30` → `y: 0`, `opacity: 0` → `1`, `duration: 0.7`, `ease: "power3.out"`
- Animate benefit cards with stagger: `y: 40` → `y: 0`, `opacity: 0` → `1`, `stagger: 0.08`, `duration: 0.6`, `ease: "power3.out"`
- Use `gsap.context()` for cleanup

---

## References

- `@context/complex-project-spec.md` — Offer Pages, Design System
- `@src/components/sections/TrustSection.tsx` — reference for icon lookup map pattern and card style
- `@sanity/schemas/service.ts` — append fields here
- `@src/components/offer/OfferPage.tsx` — add `<OfferBenefits />` as second child
- `@src/app/globals.css` — CSS variables and utility classes
- `src/components/offer/OfferBenefits.tsx` — file to create
