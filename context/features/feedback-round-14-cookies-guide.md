# Baner cookies (Cookiebot + Google Consent Mode v2) — instrukcja krok po kroku

> Część B rundy 14 ([feedback-round-14-spec.md](feedback-round-14-spec.md)).
> **Bez zmian w kodzie strony.** Wszystko robisz w panelach Cookiebot i Google Tag Manager
> (`GTM-NWZ9GM5`), który już działa na stronie.
>
> Nazwy przycisków w panelach Cookiebot i Google mogą się trochę różnić od tych w instrukcji, bo oba
> serwisy zmieniają interfejs. Jeśli czegoś nie widzisz, zrób zrzut ekranu i sprawdzimy razem.

---

## Co osiągniemy

1. Przy pierwszej wizycie pojawi się baner z trzema opcjami: **Akceptuj wszystkie**, **Odrzuć
   wszystkie**, **Ustawienia**.
2. **Przed wyborem** tagi Google nie zapisują ciasteczek reklamowych ani analitycznych (zgody
   „denied”).
3. **Po akceptacji** zgody zmieniają się na „granted” i Google Ads mierzy ruch normalnie. **Po
   odrzuceniu** zostają „denied”, a Google tylko szacuje (modeluje) konwersje.

---

## 0. Zanim zaczniesz (ważne)

### 0.1. Pięć nieopublikowanych zmian klientki w GTM

W obszarze roboczym GTM wiszą zmiany dodane 5.11.2026 z konta `info@ccomplex.pl`: dwa tagi
„Google Ads AW-850864161” i trzy ustawienia (m.in. „Zezwalaj na wykorzystywanie danych
przekazywanych przez użytkowników”). **Kliknięcie „Prześlij” opublikuje je razem z banerem.**

Wybierz jedną z dróg, zanim zaczniesz krok 2:

- **A (zalecana): zapytaj klientkę, czy możesz je odrzucić.** Wyglądają na kliknięcia z podpowiedzi
  Google; dwa dodatkowe tagi Google Ads dublowałyby istniejący „Tag Google AW-850864161”. Po jej
  zgodzie: GTM → **Przegląd** → przy każdej z 5 pozycji **⋮ → Porzuć zmiany**.
- **B: osobny obszar roboczy.** GTM → górny pasek, nazwa obszaru roboczego (np. „Default
  Workspace”) → **+** → nowy obszar roboczy, np. „Baner cookies”. Publikacja z niego obejmie tylko
  Twoje zmiany. Zmiany klientki zostaną w starym obszarze; przy następnej publikacji z tamtego GTM
  poprosi o rozwiązanie konfliktów.

Odrzucenia zmian nie da się cofnąć, więc nie rób tego bez zgody klientki.

### 0.2. Konto Cookiebot

Najlepiej, żeby konto należało do firmy, czyli było założone na **`info@ccomplex.pl`** (albo
klientka zakłada je i dodaje Cię jako użytkownika). Plan **Free** wystarcza: obejmuje jedną domenę
i do 50 podstron, a strona ma ok. 25 adresów. Na bezpłatnym planie na banerze widać logo Cookiebot.
Limity sprawdź w cenniku przy zakładaniu konta, bo Cookiebot je zmienia.

---

## 1. Cookiebot: konto, domena, wygląd banera

1. Załóż konto na **cookiebot.com** i wybierz plan **Free**.
2. **Domena:** dodaj `ccomplex.pl`. Jeśli panel pyta osobno o `www`, dodaj też `www.ccomplex.pl`.
   Strona działa na `www.ccomplex.pl`, a baner pokaże się tylko na zarejestrowanych domenach.
3. **Język:** polski, jako domyślny.
4. **Wygląd i treść banera** (sekcja zwykle „Banner” / „Content” / „Teksty”):
   - Układ z trzema przyciskami: **Odrzuć wszystkie**, **Ustawienia**, **Akceptuj wszystkie**.
     Odrzucenie musi być tak samo łatwe jak akceptacja.
   - Tekst (poprawiona wersja tekstu klientki, bez „sklepu internetowego”):

     > Używamy plików cookie, aby strona działała prawidłowo, analizować ruch i wspierać nasze
     > działania marketingowe. Klikając „Akceptuj wszystkie”, zgadzasz się na ich zapisywanie na
     > Twoim urządzeniu. Swój wybór możesz w każdej chwili zmienić w ustawieniach cookie.

   - Kolory: przycisk akceptacji w zielonym kolorze marki `#4CAF50`, tło ciemne (`#181818`), żeby
     pasowało do strony. Opcjonalne.
5. **Google Consent Mode:** jeśli w ustawieniach Cookiebot jest przełącznik Google Consent Mode,
   zostaw go **włączonego**.
6. Uruchom **skanowanie** strony (zwykle robi się samo po dodaniu domeny). Wynik skanu zasila listę
   ciasteczek w ustawieniach banera.
7. Skopiuj **Cookiebot ID** (czasem „Domain Group ID” / „CBID”). To ciąg w rodzaju
   `1a2b3c4d-....`, w sekcji „Implementation” / „Your scripts”.

**Nie wklejaj** skryptu Cookiebot do kodu strony. Ładujemy go przez GTM w kroku 2.

---

## 2. GTM: tag Cookiebot z Consent Mode

Wejdź na **tagmanager.google.com** → kontener `ccomplex.pl` (`GTM-NWZ9GM5`) → obszar roboczy z
kroku 0.1.

1. **Włącz przegląd zgód:** **Administracja → Ustawienia kontenera** → zaznacz **„Włącz przegląd
   zgody”** → Zapisz. Dzięki temu na liście tagów pojawi się ikona tarczy z podsumowaniem zgód.
2. **Dodaj szablon:** **Szablony → Szablony tagów → Wyszukaj w galerii** → wpisz „Cookiebot” →
   wybierz oficjalny **Cookiebot CMP** (autor: Cybot / Usercentrics) → **Dodaj do obszaru roboczego**.
3. **Utwórz tag:** **Tagi → Nowy → Konfiguracja tagu** → **Cookiebot CMP**.
   - **Cookiebot ID:** wklej ID z kroku 1.7.
   - **Domyślny stan zgód (Default consent state):** dla wszystkich typów („ad_storage”,
     „analytics_storage”, „ad_user_data”, „ad_personalization”, „functionality_storage”,
     „personalization_storage”) ustaw **Denied**. „security_storage” może zostać **Granted**.
   - **Region:** zostaw pusty (wszyscy odwiedzający) albo dodaj ustawienie dla EOG. Prościej
     zostawić dla wszystkich.
   - **Wait for update / Czekaj na aktualizację:** `500` ms.
   - Jeśli są opcje **„URL passthrough”** i **„Ads data redaction”**, włącz obie. Pomagają mierzyć
     kliknięcia reklam, gdy ktoś odrzuci cookies.
4. **Reguła uruchamiania:** **Inicjowanie zgody – Wszystkie strony** („Consent Initialization – All
   Pages”). **Nie „All Pages”** — ta reguła uruchamia się przed wszystkimi innymi tagami, więc zgody
   domyślne są ustawione, zanim cokolwiek się załaduje.
5. Nazwij tag, np. „Cookiebot CMP — baner i Consent Mode”, i **Zapisz**.

---

## 3. GTM: sprawdź istniejące tagi

Tagi Google mają **wbudowane sprawdzanie zgody**. Same dostosowują się do zgód z banera, więc
**nie dodajesz im żadnych dodatkowych warunków**.

1. W **Tagi** kliknij ikonę **tarczy** (przegląd zgody).
2. Przy tagach Google (Tag Google AW-850864161, tag łączący konwersje, 4 tagi „Google Ads –
   formularz …”) powinno być widać **wbudowane sprawdzanie zgody**. Zostaw „Dodatkowe sprawdzanie
   zgody” na **„Nie wymaga dodatkowej zgody”**.
3. Nie dodawaj drugiego tagu `AW-850864161` i nie zmieniaj konwersji w Google Ads.

---

## 4. (Opcjonalnie, przy okazji) Google Analytics 4

Po zmianie strony Analytics przestał dostawać dane (runda 13). Skoro i tak publikujesz kontener,
możesz dodać go teraz:

1. **Tagi → Nowy → Tag Google** → identyfikator **`G-2YVGGG5VH6`** (strumień „ccomplex.pl”,
   potwierdzony 5.11.2026). Reguła: **Inicjowanie – Wszystkie strony**. Zapisz.
2. W **Google Analytics → Administracja → Strumienie danych → ccomplex.pl**:
   - włącz **Pomiar zaawansowany**,
   - w jego ustawieniach **Wyświetlenia strony** zaznacz zmiany strony na podstawie zdarzeń historii
     przeglądarki (strona przechodzi między podstronami bez przeładowania).
3. Drugiego strumienia (`G-695H6WP73F`, bez danych) nie używaj i nie usuwaj bez zgody klientki.

---

## 5. Test w podglądzie (przed publikacją)

1. W GTM kliknij **Podgląd** → wpisz `https://www.ccomplex.pl` → otworzy się strona z Tag Assistant.
   Najlepiej w **oknie incognito**, żeby nie było zapisanych zgód.
2. **Baner się pojawia**, z trzema przyciskami i polskim tekstem.
3. W **Tag Assistant**, przy pierwszym zdarzeniu („Consent Initialization”), zakładka **Zgoda**
   (Consent): wszystkie typy **Denied** jako domyślne.
4. **Przed kliknięciem w baner:** w narzędziach deweloperskich (F12) → **Application → Cookies →
   https://www.ccomplex.pl** nie powinno być `_gcl_au` ani `_ga`.
5. Kliknij **Odrzuć wszystkie** → w Tag Assistant zgody zostają **Denied**, `_gcl_au` dalej nie ma.
6. W nowym oknie incognito powtórz i kliknij **Akceptuj wszystkie** → `ad_storage`,
   `analytics_storage`, `ad_user_data`, `ad_personalization` zmieniają się na **Granted**, a tag
   Google uruchamia się z pełnymi danymi.
7. Sprawdź też na telefonie (lub w trybie mobilnym przeglądarki), czy baner nie zasłania przycisków
   formularzy i czy da się go zamknąć.

Jeśli wszystkie punkty się zgadzają, przejdź do publikacji. Jeśli nie, zrób zrzut Tag Assistant
(zakładka Zgoda) i baneru.

---

## 6. Publikacja

1. GTM → **Prześlij**.
2. **Nazwa wersji:** „Baner cookies — Cookiebot + Consent Mode v2” (+ „GA4”, jeśli robiłeś krok 4).
3. **Opis:** co zostało dodane, np. „Tag Cookiebot CMP (Consent Initialization), domyślne zgody
   denied, GA4 G-2YVGGG5VH6”.
4. **Opublikuj.**

**Wycofanie, gdyby coś poszło nie tak:** GTM → **Wersje** → poprzednia wersja (dziś „6”) → **⋮ →
Opublikuj**. Strona wraca do stanu sprzed banera w kilka minut.

---

## 7. Po publikacji

1. Otwórz `https://www.ccomplex.pl` w incognito: baner się pojawia, a wybór jest zapamiętany przy
   przechodzeniu między podstronami.
2. Sprawdź formularz wyceny i kontaktowy: baner nie blokuje wysyłki.
3. Sprawdź **Presentation** w Studio: podgląd strony nadal działa (baner może się pokazać w
   podglądzie, to normalne).
4. **Polityka prywatności** (`/polityka-prywatnosci`, edycja w Studio): powinna wymieniać Cookiebot,
   Google Tag Manager, Google Ads i Google Analytics. Tekst zatwierdza klientka lub jej prawnik.
5. Po kilku dniach w **Google Ads → Cele → Konwersje → Diagnostyka** może pojawić się status trybu
   zgody. Brak statusu w pierwszych dniach jest normalny.
6. Daj znać, a sprawdzę z zewnątrz: baner, brak ciasteczek reklamowych przed zgodą i Lighthouse.

---

## Najczęstsze problemy

| Objaw | Prawdopodobna przyczyna | Co zrobić |
| ----- | ----------------------- | --------- |
| Baner się nie pokazuje | Zły Cookiebot ID albo domena nie pasuje (np. dodane tylko `ccomplex.pl`, a strona działa na `www`) | Sprawdź ID w tagu i domeny w Cookiebot |
| Baner jest, ale zgody w Tag Assistant są puste | Tag Cookiebot ma regułę „All Pages” zamiast „Consent Initialization” | Zmień regułę (krok 2.4) |
| `_gcl_au` pojawia się przed kliknięciem | Brak domyślnych „Denied” w tagu Cookiebot | Ustaw domyślne zgody (krok 2.3) |
| Baner po angielsku | Język domyślny w Cookiebot | Ustaw polski (krok 1.3) |
| Po publikacji pojawiły się dziwne tagi Google Ads | Opublikowano 5 zmian klientki | Wycofaj do poprzedniej wersji (krok 6) i wróć do kroku 0.1 |

---

## Czego ta instrukcja nie obejmuje

- Pełnej polityki bezpieczeństwa treści (CSP): na razie strona ma tylko `frame-ancestors`, który
  nie blokuje Cookiebot. Pełna CSP to osobny krok po wdrożeniu banera.
- Osadzenia listy ciasteczek Cookiebot („cookie declaration”) w polityce prywatności: wymaga zmiany
  w kodzie, możemy to zrobić później.
