# Client Corrections & New FAQ Page Spec

## Overview

Three sets of changes requested by the client, combined into one spec:
1. `/o-nas` — copy corrections in `AboutHero` and hardcoded CTA section
2. `/kontakt` — consent field labeling, footnote punctuation, description text
3. `/faq` — new standalone subpage with Sanity-managed Q&A content

---

## 1. `/o-nas` Page — Copy Corrections

### 1.1 `AboutHero` — eyebrow and subheadline

**File:** `src/app/o-nas/page.tsx` → `<AboutHero />` component

- Change eyebrow text hardcoded default from whatever it currently is to `"CCOMPLEX SP. Z O.O."`
- In Sanity `aboutPage` document, update the `heroEyebrow` field seed value to `"CCOMPLEX SP. Z O.O."`
- Change right-side subheadline to less formal Polish — update Sanity `aboutPage.heroSubheadline` seed value to:
  ```
  Specjalizujemy się w kompleksowym wykonaniu zadaszeń tarasowych oraz tarasów. Realizacje wykonujemy na wybranych obszarach województwa opolskiego i śląskiego.
  ```
- Ensure the body/description text in `AboutHero` matches the homepage `HomeAboutSection` (the "O NAS" block on the home page) — pull the same Portable Text content from `siteSettings.aboutSection.body` or keep both pointing at the same Sanity field; do not duplicate the copy into two separate fields

### 1.2 Hardcoded "Masz pytania?" CTA section on `/o-nas`

**Context:** The client reported they cannot edit a "Masz pytania..." section on the about page via CMS. This section is currently hardcoded.

**Action:**
- Locate the hardcoded CTA block in the `AboutCta` component (or equivalent) in `src/components/about/`
- Extract it into a Sanity-managed schema field: add `aboutCta` object to `aboutPage` document:
  ```ts
  // in sanity/schemas/aboutPage.ts
  defineField({
    name: 'cta',
    title: 'Sekcja CTA',
    type: 'object',
    fields: [
      defineField({ name: 'eyebrow', type: 'string', title: 'Nadnapis' }),
      defineField({ name: 'headline', type: 'string', title: 'Nagłówek' }),
      defineField({ name: 'description', type: 'text', title: 'Opis' }),
      defineField({ name: 'primaryCta', type: 'string', title: 'Przycisk główny — etykieta' }),
      defineField({ name: 'primaryCtaHref', type: 'string', title: 'Przycisk główny — link' }),
      defineField({ name: 'secondaryCta', type: 'string', title: 'Przycisk drugi — etykieta' }),
      defineField({ name: 'secondaryCtaHref', type: 'string', title: 'Przycisk drugi — link' }),
    ],
  })
  ```
- Seed initial values in `sanity/lib/initialValues/aboutPage.ts`:
  ```ts
  cta: {
    eyebrow: 'KONTAKT',
    headline: 'Masz pytania?',
    description: 'Skontaktuj się z nami — odpowiemy i pomożemy dobrać odpowiednie rozwiązanie.',
    primaryCta: 'Napisz do nas',
    primaryCtaHref: '/kontakt',
    secondaryCta: 'Zadzwoń',
    secondaryCtaHref: 'tel:+48XXXXXXXXX', // replace with real number from siteSettings
  }
  ```
- Replace the hardcoded JSX in `AboutCta` with values fetched from `aboutPage.cta`; use `siteSettings.phone` for the phone number rather than duplicating it

---

## 2. `/kontakt` Page — Contact Form Corrections

**File:** `src/app/kontakt/page.tsx` + `src/components/forms/ContactForm.tsx`

### 2.1 Form description text

- Shorten the description copy above the form to:
  ```
  Masz pytanie, które nie dotyczy konkretnej wyceny? Napisz do nas — odpowiemy najszybciej, jak to możliwe.
  ```
- If this text comes from Sanity `contactPage.description`, update the seed value
- If it is hardcoded in the component, replace it directly

### 2.2 First consent — mark as required

- The first consent checkbox (marketing/regulations acceptance) must be visually marked as required
- Add `*` asterisk to the label, styled in `text-accent` or `text-red-400`:
  ```tsx
  <label>
    Zapoznałem/am się z <a href="/polityka-prywatnosci">Polityką prywatności</a>
    {' '}<span className="text-accent">*</span>
  </label>
  ```
- Add `.min(true, 'To pole jest wymagane')` to the Zod schema for this field (or `z.literal(true)`)
- The second consent (optional marketing consent) remains optional — no asterisk, no Zod `.min(true)`

### 2.3 Footnote punctuation fix

- Find the footnote text below the submit button that reads: `"odpowiemy najszybciej jak to możliwe"`
- Replace with: `"odpowiemy najszybciej, jak to możliwe"` (add comma after `najszybciej`)
- This applies to both the inline form description and any footnote/disclaimer text block

---

## 3. `/faq` — New FAQ Subpage

### 3.1 Overview

- Create a new standalone page at `/faq`
- Content is fully managed via Sanity: questions and answers are editable in Studio
- Questions grouped by product/topic category
- Rendered with Ark UI `<Accordion>` (same pattern as `OfferBrands` component)
- SEO-optimised: `generateMetadata` with title and description from Sanity

### 3.2 Sanity schema — `faqPage` document

**File:** `sanity/schemas/faqPage.ts`

```ts
import { defineField, defineType } from 'sanity'

export const faqPage = defineType({
  name: 'faqPage',
  title: 'Strona FAQ',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'seoTitle', type: 'string', title: 'SEO — tytuł strony' }),
    defineField({ name: 'seoDescription', type: 'text', rows: 3, title: 'SEO — opis strony' }),
    defineField({ name: 'eyebrow', type: 'string', title: 'Nadnapis' }),
    defineField({ name: 'headline', type: 'string', title: 'Nagłówek' }),
    defineField({ name: 'subheadline', type: 'text', rows: 2, title: 'Podtytuł' }),
    defineField({
      name: 'categories',
      title: 'Kategorie pytań',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'faqCategory',
          title: 'Kategoria',
          fields: [
            defineField({ name: 'title', type: 'string', title: 'Nazwa kategorii' }),
            defineField({
              name: 'items',
              title: 'Pytania i odpowiedzi',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'faqItem',
                  title: 'Pytanie',
                  fields: [
                    defineField({ name: 'question', type: 'string', title: 'Pytanie' }),
                    defineField({ name: 'answer', type: 'text', rows: 5, title: 'Odpowiedź' }),
                  ],
                  preview: { select: { title: 'question' } },
                },
              ],
            }),
          ],
          preview: { select: { title: 'title', subtitle: 'items.length' } },
        },
      ],
    }),
  ],
})
```

- Register `faqPage` in `sanity/schemaTypes/index.ts`

### 3.3 Sanity seed — initial values

**File:** `sanity/lib/initialValues/faqPage.ts` (or seed script)

Seed all Q&A content from `odpowiedzi_na_pytania1.docx` — 5 categories, 10 questions each:

```ts
export const faqPageInitialValues = {
  seoTitle: 'FAQ — Najczęstsze pytania | CComplex',
  seoDescription: 'Odpowiedzi na najczęściej zadawane pytania dotyczące zadaszeń tarasowych, tarasów kompozytowych, gresowych, drewnianych oraz akcesoriów.',
  eyebrow: 'PYTANIA I ODPOWIEDZI',
  headline: 'Najczęściej zadawane pytania',
  subheadline: 'Znajdź odpowiedź na swoje pytanie lub skontaktuj się z nami bezpośrednio.',
  categories: [
    {
      title: 'Zadaszenia tarasowe i pergole',
      items: [
        { question: 'Co wybrać na dach zadaszenia: szkło czy poliwęglan?', answer: 'Szkło zapewnia elegancki wygląd i bardzo dobre doświetlenie tarasu. Poliwęglan jest lżejszy i może być przejrzysty lub mleczny. Dostępność danego pokrycia zależy również od wybranego systemu zadaszenia.' },
        { question: 'Czy zadaszenie tarasu jest wykonywane na wymiar?', answer: 'Zadaszenia są dostępne w standardowych wymiarach, ale mogą być również dopasowane do miejsca montażu. Szerokość i głębokość konstrukcji dobieramy z uwzględnieniem wymiarów tarasu oraz możliwości wybranego systemu.' },
        { question: 'Jakie kolory konstrukcji są dostępne?', answer: 'Konstrukcje są standardowo dostępne w kilku kolorach, m.in. antracytowym, czarnym i białym. W zależności od wybranego modelu zadaszenie można również zamówić w szerszej gamie kolorów, w tym z palety RAL.' },
        { question: 'Na jakim obszarze montujecie zadaszenia tarasowe?', answer: 'Zadaszenia tarasowe montujemy na wybranych obszarach województw opolskiego i śląskiego. Możliwość realizacji w konkretnej miejscowości potwierdzamy podczas przygotowywania wstępnej wyceny.' },
        { question: 'Czy można zobaczyć zadaszenie?', answer: 'W Opolu na ul. Kępskiej 12 znajduje się ogólnodostępna ekspozycja zewnętrzna z pergolą wolnostojącą, szklanymi ścianami i żaluzjami tarasowymi. Na umówione spotkania przywozimy również przekroje profili, wzorniki kolorów konstrukcji oraz próbki poliwęglanu.' },
        { question: 'Czy wykonujecie zadaszenia przyścienne i wolnostojące?', answer: 'Tak. W ofercie znajdują się zadaszenia przyścienne montowane przy budynku oraz pergole wolnostojące, które można ustawić w wybranym miejscu w ogrodzie lub na tarasie.' },
        { question: 'Czy pergola wolnostojąca wymaga mocowania do budynku?', answer: 'Nie. Pergola wolnostojąca posiada własną konstrukcję opartą na słupach i może zostać ustawiona niezależnie od budynku, pod warunkiem odpowiedniego zakotwienia do podłoża.' },
        { question: 'Czy dach z poliwęglanu lub ze szkła należy czyścić?', answer: 'Tak, okresowe czyszczenie pozwala zachować estetyczny wygląd i dobrą przepuszczalność światła. Częstotliwość czyszczenia zależy m.in. od lokalizacji zadaszenia i stopnia jego zabrudzenia.' },
        { question: 'Jak długo trwa montaż zadaszenia?', answer: 'Czas montażu zależy od wielkości i rodzaju konstrukcji oraz warunków na miejscu. Standardowe zadaszenie tarasu zazwyczaj można zamontować w ciągu jednego dnia.' },
        { question: 'Ile kosztuje zadaszenie tarasu?', answer: 'Cena zadaszenia zależy m.in. od jego wymiarów, wybranego systemu, rodzaju pokrycia dachowego oraz dodatkowych zabudów i akcesoriów. Wstępną wycenę przygotowujemy na podstawie informacji przesłanych w formularzu.' },
      ],
    },
    {
      title: 'Zabudowy i akcesoria',
      items: [
        { question: 'Jakie zabudowy i akcesoria można zamontować w zadaszeniu?', answer: 'W zależności od wybranego systemu zadaszenie można uzupełnić o szklane ściany, zabudowy z poliwęglanu, żaluzje aluminiowe obrotowe, rolety pionowe, markizę, roletę rzymską dachową oraz oświetlenie LED.' },
        { question: 'Czy zadaszenie można później uzupełnić o ściany szklane?', answer: 'Tak, wiele konstrukcji można w późniejszym etapie rozbudować o przesuwne lub stałe ściany szklane. Warto już na etapie montażu zadaszenia uwzględnić możliwość jego przyszłej zabudowy.' },
        { question: 'Czym różnią się zabudowy tarasów ramowe od bezramowych?', answer: 'Zabudowy ramowe posiadają profile okalające szyby, natomiast w systemach bezramowych tafle szkła są połączone bez widocznych pionowych profili. Zabudowa bezramowa zapewnia bardziej minimalistyczny wygląd i większe przeszklenie.' },
        { question: 'Czy można zabudować trójkątną przestrzeń pod dachem?', answer: 'Tak, trójkątne przestrzenie można zabudować szkłem lub innymi rozwiązaniami dopasowanymi do konstrukcji. Zabudowa jest wykonywana indywidualnie na wymiar.' },
        { question: 'Czy żaluzje aluminiowe chronią przed słońcem i wiatrem?', answer: 'Tak. Regulowane żaluzje aluminiowe pozwalają ograniczyć dostęp promieni słonecznych, a po zamknięciu zapewniają również dodatkową osłonę przed wiatrem.' },
        { question: 'Jakie rolety można zamontować do pergoli?', answer: 'Do pergoli najczęściej stosuje się rolety screen, które chronią przed słońcem, wiatrem i zapewniają większą prywatność. Dostępne są w różnych kolorach i stopniach przepuszczalności światła.' },
        { question: 'Czy zabudowane zadaszenie jest ogrodem zimowym?', answer: 'Nie zawsze. Zabudowane zadaszenie tarasu i ogród zimowy to różne rozwiązania konstrukcyjne, a o kwalifikacji decydują m.in. sposób wykonania, przeznaczenie oraz parametry zabudowy.' },
        { question: 'Czy wykonujecie ogrody zimowe?', answer: 'Nie, wykonujemy tzw. ogrody letnie, czyli zadaszenia tarasowe zabudowane ścianami bocznymi i przednimi. Taka przestrzeń nie jest izolowana termicznie, dlatego nie jest przeznaczona do całorocznego użytkowania.' },
        { question: 'W jakich kolorach są dostępne żaluzje tarasowe?', answer: 'Dostępne kolory zależą od wybranego producenta. Żaluzje tarasowe występują m.in. w kolorze grafitowym, białym, czarnym oraz w odcieniach jasnego i ciemnego drewna. W przypadku wybranego modelu możliwe jest również zamówienie koloru z palety RAL.' },
        { question: 'Gdzie można zobaczyć żaluzje tarasowe?', answer: 'Żaluzje tarasowe można obejrzeć na naszej ogólnodostępnej ekspozycji zewnętrznej w Opolu na Kępskiej 12. Model żaluzji prezentujemy również w biurze lub podczas umówionego spotkania.' },
      ],
    },
    {
      title: 'Tarasy kompozytowe',
      items: [
        { question: 'Czym różnią się deski kompozytowe komorowe od pełnych?', answer: 'Deski komorowe są lżejsze i zazwyczaj bardziej ekonomiczne, natomiast deski pełne są cięższe, masywniejsze i charakteryzują się większą odpornością na uszkodzenia mechaniczne. Wybór zależy od miejsca zastosowania i oczekiwanego efektu.' },
        { question: 'Czy taras kompozytowy wymaga konserwacji?', answer: 'Taras kompozytowy nie wymaga regularnego olejowania, lakierowania ani impregnacji jak taras z drewna. Wystarczy jego okresowe czyszczenie, aby zachować estetyczny wygląd.' },
        { question: 'Czy deski kompozytowe blakną pod wpływem słońca?', answer: 'W pierwszym okresie użytkowania kolor może ulec niewielkiej zmianie pod wpływem promieni UV, szczególnie w przypadku nowych desek. Wysokiej jakości deski kompozytowe są jednak zabezpieczone przed promieniowaniem UV i zachowują kolor przez długi czas.' },
        { question: 'Czy na tarasie kompozytowym widać elementy montażowe?', answer: 'Przy zastosowaniu odpowiedniego systemu montażowego elementy mocujące są praktycznie niewidoczne. Deski montuje się najczęściej za pomocą specjalnych klipsów, dzięki czemu powierzchnia tarasu pozostaje estetyczna i jednolita.' },
        { question: 'Na jakim podłożu można wykonać taras kompozytowy?', answer: 'Taras kompozytowy można wykonać m.in. na płycie betonowej, kostce brukowej lub odpowiednio przygotowanym i stabilnym podłożu. Konstrukcję należy zawsze wykonać na właściwie wypoziomowanej i nośnej podbudowie.' },
        { question: 'Jak czyścić deski kompozytowe?', answer: 'Do bieżącego czyszczenia wystarczy woda, szczotka i łagodny detergent. Przy trudniejszych zabrudzeniach można zastosować preparaty przeznaczone do desek kompozytowych, zgodnie z zaleceniami producenta.' },
        { question: 'Czy deski kompozytowe nagrzewają się latem?', answer: 'Tak jak większość materiałów tarasowych, deski kompozytowe nagrzewają się pod wpływem słońca, szczególnie w ciemnych kolorach. Stopień nagrzewania zależy m.in. od koloru deski, nasłonecznienia i temperatury otoczenia.' },
        { question: 'Czy każda deska kompozytowa jest taka sama?', answer: 'Nie. Deski kompozytowe różnią się m.in. wymiarami, budową, składem, strukturą powierzchni, kolorystyką, technologią wykonania oraz sposobem montażu. Wybór odpowiedniej deski zależy od oczekiwanego wyglądu tarasu, miejsca zastosowania i indywidualnych potrzeb.' },
        { question: 'Czy deski kompozytowe zmieniają kolor?', answer: 'Tak. Po ułożeniu deski mogą przejściowo zmieniać odcień w wyniku naturalnego sezonowania. Z czasem ich kolor stabilizuje się, a przebieg tego procesu zależy od rodzaju deski oraz warunków atmosferycznych.' },
        { question: 'Gdzie można zobaczyć deski kompozytowe?', answer: 'Deski kompozytowe można obejrzeć na ogólnodostępnej wystawce zewnętrznej przy naszym biurze w Opolu przy ul. Kępskiej 12. Próbki i wzorniki prezentujemy również w biurze oraz podczas umówionych spotkań u klientów.' },
      ],
    },
    {
      title: 'Tarasy gresowe',
      items: [
        { question: 'Co to jest taras wentylowany?', answer: 'Taras wentylowany to system, w którym płyty gresowe układane są na specjalnych wspornikach, bez trwałego przyklejania do podłoża. Wolna przestrzeń pod płytami umożliwia swobodny odpływ wody i wentylację podłoża.' },
        { question: 'Na czym układa się płyty gresowe na tarasie?', answer: 'Płyty układamy na regulowanych wspornikach wykonanych ze wzmocnionego polipropylenu. Są one odporne na zmienne temperatury, promieniowanie UV, wilgoć oraz duże obciążenia. Wsporniki umożliwiają wypoziomowanie tarasu i równomierne rozłożenie nacisku.' },
        { question: 'Czy taras gresowy można wykonać bez klejenia płyt?', answer: 'Tak. W systemie tarasu wentylowanego płyty gresowe układa się na wspornikach bez użycia kleju, dzięki czemu w razie potrzeby można je łatwo zdemontować lub wymienić.' },
        { question: 'Jakie są zalety tarasu z płyt gresowych?', answer: 'Taras z gresu jest trwały, odporny na warunki atmosferyczne i łatwy w utrzymaniu czystości. Duży wybór kolorów, wzorów i formatów pozwala dopasować jego wygląd do budynku i otoczenia.' },
        { question: 'Czy płyty gresowe są odporne na mróz?', answer: 'Tak, odpowiednio dobrane płyty gresowe przeznaczone do zastosowań zewnętrznych charakteryzują się wysoką odpornością na mróz. Ważne jest zastosowanie gresu o właściwych parametrach, przeznaczonego na tarasy zewnętrzne.' },
        { question: 'Czy pod tarasem wentylowanym może odpływać woda?', answer: 'Tak. Otwarta przestrzeń pomiędzy płytami a podłożem umożliwia swobodny odpływ wody, dlatego taras wentylowany jest bardzo dobrym rozwiązaniem na powierzchniach narażonych na opady.' },
        { question: 'Jakie formaty płyt gresowych są dostępne?', answer: 'Na tarasach stosuje się wiele formatów, m.in. 60×60, 60×120, 90×90, 45×90, 40×120 cm.' },
        { question: 'Na jakich płytach gresowych pracujecie?', answer: 'Stosujemy wyłącznie płyty tarasowe Goliat 2.0. Dostępne wzory można zobaczyć na stronie goliatgres.pl. Nie wykonujemy tarasów z płyt powierzonych przez klienta.' },
        { question: 'Jakie właściwości mają płyty gresowe Goliat 2.0?', answer: 'Płyty są mrozoodporne, nienasiąkliwe, niepalne i odporne na ścieranie, uszkodzenia oraz zmienne warunki atmosferyczne. Mają powierzchnię antypoślizgową i są łatwe w utrzymaniu czystości. Dostępne są w wielu formatach, kolorach i wzorach.' },
        { question: 'Gdzie można zobaczyć płyty gresowe?', answer: 'Podczas spotkań prezentujemy wzornik GoliatGres obejmujący szeroki wybór płyt w kilku wymiarach. Próbki grafik i kolorów mają format 10 × 10 cm. Wybrane modele płyt można również zobaczyć na ogólnodostępnej wystawce zewnętrznej przy ul. Kępskiej 12 w Opolu.' },
      ],
    },
    {
      title: 'Tarasy drewniane',
      items: [
        { question: 'Czym jest Thermo Drewno?', answer: 'Thermo Drewno to drewno poddane modyfikacji termicznej z wykorzystaniem wysokiej temperatury i pary wodnej. Proces ten ogranicza wchłanianie wilgoci oraz zwiększa stabilność wymiarową i odporność drewna na działanie grzybów i pleśni. Nadaje mu również charakterystyczną, głębszą barwę.' },
        { question: 'Czy Thermo Drewno wymaga konserwacji?', answer: 'Konserwacja nie jest konieczna, jeśli akceptujemy naturalne szarzenie drewna. Pod wpływem słońca i warunków atmosferycznych deski stopniowo pokrywają się srebrzystoszarą patyną, co nie świadczy o uszkodzeniu materiału. Aby dłużej zachować pierwotną barwę, należy stosować odpowiedni olej do drewna, zwykle raz lub dwa razy w roku.' },
        { question: 'Czy różnice w wyglądzie desek drewnianych są naturalne?', answer: 'Tak. Drewno jest materiałem naturalnym, dlatego poszczególne deski mogą różnić się kolorem, usłojeniem, wzorem i kształtem. Mogą również występować sęki, drobne pęknięcia czy naturalne przebarwienia, które nie są wadą materiału.' },
        { question: 'Czy każdy rodzaj drewna z czasem szarzeje?', answer: 'Tak. Naturalne szarzenie dotyczy wszystkich gatunków drewna, również drewna egzotycznego i Thermo Drewna. Pod wpływem warunków atmosferycznych drewno stopniowo pokrywa się srebrzystoszarą patyną, zazwyczaj w ciągu kilku miesięcy do roku. Aby dłużej zachować jego pierwotną barwę, należy regularnie stosować odpowiedni olej do drewna, najlepiej dwa razy w roku.' },
        { question: 'Czy wszystkie deski drewniane wyglądają tak samo?', answer: 'Nie. Drewno jest materiałem naturalnym, dlatego poszczególne deski mogą różnić się strukturą, usłojeniem i odcieniem. Z czasem ich powierzchnia może również pokryć się naturalną srebrzystoszarą patyną, która nie obniża właściwości technicznych drewna.' },
        { question: 'Czy Thermo Jesion nadaje się na taras przy basenie?', answer: 'Tak. Thermo Jesion dobrze sprawdza się jako materiał na tarasy przy basenach. Dzięki modyfikacji termicznej ma ograniczoną chłonność wilgoci i wysoką stabilność wymiarową.' },
        { question: 'W jaki sposób montowane są deski drewniane?', answer: 'Thermo Jesion i Thermo Sosna mogą być montowane za pomocą wkrętów ze stali nierdzewnej lub w systemie niewidocznym. Deski świerkowe montujemy wyłącznie przy użyciu widocznych wkrętów.' },
        { question: 'Czy taras drewniany można wykonać na istniejącej nawierzchni?', answer: 'Tak, pod warunkiem że podłoże jest stabilne, odpowiednio przygotowane i zapewnia prawidłowe odprowadzenie wody. Konstrukcję tarasu można wykonać na legarach ustawionych na odpowiednich podporach.' },
        { question: 'Czy drewno na tarasie robi się śliskie po deszczu?', answer: 'Każda zewnętrzna nawierzchnia może być śliska, jednak prawidłowo wykonany taras drewniany z odpowiednio dobranymi deskami zapewnia dobrą przyczepność. Istotne jest również właściwe odprowadzanie wody z powierzchni tarasu.' },
        { question: 'Jak długo może służyć drewniany taras?', answer: 'Żywotność tarasu zależy od gatunku drewna, jakości konstrukcji oraz sposobu pielęgnacji. Przy prawidłowym wykonaniu i regularnej konserwacji może służyć przez kilkanaście lat.' },
      ],
    },
  ],
}
```

### 3.4 Page component

**File:** `src/app/faq/page.tsx`

```tsx
import { sanityFetch } from '@/sanity/lib/fetch'
import { faqPageQuery } from '@/sanity/lib/queries'
import { FaqHero } from '@/components/faq/FaqHero'
import { FaqAccordion } from '@/components/faq/FaqAccordion'
import { FaqCta } from '@/components/faq/FaqCta'
import type { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  const data = await sanityFetch({ query: faqPageQuery })
  return {
    title: data.seoTitle ?? 'FAQ | CComplex',
    description: data.seoDescription ?? '',
  }
}

export default async function FaqPage() {
  const data = await sanityFetch({ query: faqPageQuery })
  return (
    <main>
      <FaqHero eyebrow={data.eyebrow} headline={data.headline} subheadline={data.subheadline} />
      <FaqAccordion categories={data.categories} />
      <FaqCta />
    </main>
  )
}
```

### 3.5 GROQ query

**File:** `src/sanity/lib/queries.ts` — add:

```ts
export const faqPageQuery = groq`*[_type == "faqPage"][0]{
  seoTitle,
  seoDescription,
  eyebrow,
  headline,
  subheadline,
  categories[]{
    title,
    items[]{
      question,
      answer,
    }
  }
}`
```

### 3.6 `FaqHero` component

**File:** `src/components/faq/FaqHero.tsx`

- Full-width section, `section-padding` top/bottom
- Eyebrow: small caps, `text-accent`, `tracking-widest`, `text-xs`
- Headline: `font-bebas text-5xl md:text-7xl text-white`
- Subheadline: `text-white/60 max-w-xl mt-4`
- No background image — dark background (`bg-[#111111]`) with a subtle horizontal gradient divider at bottom (`bg-gradient-to-r from-transparent via-accent/30 to-transparent h-px`)
- GSAP stagger entrance: eyebrow → headline → subheadline, `y: 30 → 0`, `opacity: 0 → 1`

### 3.7 `FaqAccordion` component

**File:** `src/components/faq/FaqAccordion.tsx`

```tsx
'use client'
import { Accordion } from '@ark-ui/react'

type FaqItem = { question: string; answer: string }
type FaqCategory = { title: string; items: FaqItem[] }

export function FaqAccordion({ categories }: { categories: FaqCategory[] }) {
  return (
    <section className="section-padding bg-[#0B0B0C]">
      <div className="container mx-auto max-w-3xl">
        {categories.map((cat) => (
          <div key={cat.title} className="mb-12">
            <h2 className="font-space-grotesk text-xl font-semibold text-white mb-6 pb-3 border-b border-white/10">
              {cat.title}
            </h2>
            <Accordion.Root collapsible multiple={false}>
              {cat.items.map((item, i) => (
                <Accordion.Item
                  key={i}
                  value={String(i)}
                  className="border-b border-white/10 py-4"
                >
                  <Accordion.ItemTrigger className="flex w-full items-center justify-between text-left text-white hover:text-accent transition-colors duration-200 font-medium">
                    {item.question}
                    <Accordion.ItemIndicator className="ml-4 shrink-0 text-accent transition-transform duration-200 data-[state=open]:rotate-45">
                      <PlusIcon className="w-5 h-5" />
                    </Accordion.ItemIndicator>
                  </Accordion.ItemTrigger>
                  <Accordion.ItemContent className="pt-3 pb-1 text-white/60 leading-relaxed text-sm">
                    {item.answer}
                  </Accordion.ItemContent>
                </Accordion.Item>
              ))}
            </Accordion.Root>
          </div>
        ))}
      </div>
    </section>
  )
}
```

- Use `PlusIcon` from `lucide-react`; rotate to ✕ when open via `data-[state=open]:rotate-45`
- `collapsible` — clicking open item closes it; only one item open at a time per category

### 3.8 `FaqCta` component

**File:** `src/components/faq/FaqCta.tsx`

- Reuse the same gradient-bars CTA pattern from `OfferFormCta`
- Headline: `"Nie znalazłeś odpowiedzi na swoje pytanie?"`
- Subheadline: `"Napisz do nas bezpośrednio — odpowiemy szybko i bez zbędnych formalności."`
- Two buttons: `"Napisz do nas"` → `/kontakt`, `"Formularz wyceny"` → `/#wycena` (or link to main quotation forms landing)
- Same `bg-gradient-to-r from-transparent via-accent/50 to-transparent h-px` accent bars top and bottom

### 3.9 Navigation — add FAQ link

- In `src/components/layout/Navbar.tsx`, add `"FAQ"` to the main nav links array:
  ```ts
  { label: 'FAQ', href: '/faq' }
  ```
- Position: after `"Realizacje"`, before `"Kontakt"`
- Also add to `Footer.tsx` under the `"Firma"` column:
  ```ts
  { label: 'FAQ', href: '/faq' }
  ```

---

## 4. SEO Note from Client (rad2.docx) — Implementation Hints

The client provided additional context on AI-visibility SEO. Relevant technical items for the developer:

- Ensure `robots.txt` does **not** block `OAI-SearchBot` (OpenAI's crawler); allow it explicitly:
  ```
  User-agent: OAI-SearchBot
  Allow: /
  ```
- Add `LocalBusiness` and `Organization` JSON-LD structured data to the root layout (`src/app/layout.tsx`):
  ```ts
  // src/lib/structuredData.ts
  export const localBusinessJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'CComplex sp. z o.o.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Kępska 12',
      addressLocality: 'Opole',
      postalCode: '46-020',
      addressCountry: 'PL',
    },
    telephone: '+48XXXXXXXXX', // replace with real number
    url: 'https://ccomplex.pl',
    areaServed: ['województwo opolskie', 'województwo śląskie'],
    '@type2': 'Organization',
  }
  ```
- Inject into `<head>` via `<Script type="application/ld+json">` in `layout.tsx`
- Ensure all project images in Sanity have meaningful `alt` text fields — already specced, but make sure `alt` is required in Studio validation
- The `/faq` page content (especially the Q&A with specific service mentions and location names like Opole, Racibórz, Ruda Śląska) directly improves AI-model discoverability per client's research
- `sitemap.xml` should include the new `/faq` route — if using `next-sitemap` or Next.js App Router sitemap, add `/faq` to the static routes list

---

## References

- `src/app/o-nas/page.tsx`
- `src/components/about/AboutHero.tsx`
- `src/components/about/AboutCta.tsx`
- `src/app/kontakt/page.tsx`
- `src/components/forms/ContactForm.tsx`
- `sanity/schemas/aboutPage.ts`
- `sanity/schemas/contactPage.ts` (if exists)
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `@context/features/about-us-spec.md`
- `@context/features/kontakt-page-spec.md`
- `@context/features/offer-04-brands-spec.md` (Accordion pattern reference)
