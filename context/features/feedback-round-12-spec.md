# Client Feedback — Round 12 (`/wycena/zadaszenie` — korekty nazw)

> **Source:** client feedback message, 27.10.2026 (plus a screenshot of the „Wyposażenie
> dodatkowe” checkbox group).
> All visible copy is **Polish**; all identifiers stay **English**.

> _„wycena/zadaszenia: change „Markizy podachowe” → „poddachowe”. Change select input „Wybierz
> rodzaj dachu (Pergole ekonomiczne)” → „Materia (pergole ekonomiczne)”, „Roleta rzymska Deponti
> Verdeca” → „Roleta rzymska (Deponti Verdeca)”. Change checkbox label from „Zaznacz jeśli chcesz
> wycenić montaż wraz z zadaszeniem” to „Zaznacz, jeśli wycena ma obejmować montaż.” Additional
> checkboxes: „Zabudowa szklana przesuwna bezramowa / bok 1” → „Zabudowa przesuwna, bezramowa,
> szkło - bok 1” and „Zabudowa szklana przesuwna ramowa - bok 1” → „Zabudowa przesuwna, ramowa,
> szkło - bok 1”. Apply that logic to each matching checkbox.”_

---

## Status

Not started. This document reads the request against the current code. It is not the
implementation.

---

## Overview

| #   | Item                                                     | Where it lives                       | Needs deploy? | Difficulty |
| --- | -------------------------------------------------------- | ------------------------------------ | ------------- | ---------- |
| 1   | „Markizy podachowe” → „Markizy poddachowe” (typo)        | `zadaszenieForm.ts` (`EQUIPMENT_OPTIONS`) | yes      | trivial    |
| 2   | Opcje „Rodzaj dachu” — 2 zmiany nazw                     | `zadaszenieForm.ts` (`ROOF_TYPES`)   | yes           | trivial    |
| 3   | Tekst pod checkboxem „Usługa montażu”                    | `ZadaszenieForm.tsx`                 | yes           | trivial    |
| 4   | Nowy szyk nazw w „Wyposażenie dodatkowe”                 | `zadaszenieForm.ts` (`EQUIPMENT_OPTIONS`) | yes      | small      |

All four are fixed copy in code — **no schema change, no Studio redeploy**. Only the
`/wycena/zadaszenie` form is touched. Field `name`s (`roofType`, `equip*`) stay unchanged; only
the Polish labels/values change.

---

## 1. „Markizy podachowe” → „Markizy poddachowe”

Typo fix in [zadaszenieForm.ts](frontend/app/lib/validations/zadaszenieForm.ts):

```ts
{ name: 'equipUnderRoofAwning', label: 'Markizy poddachowe' },
```

---

## 2. Opcje selecta „Wybierz rodzaj dachu”

`ROOF_TYPES` in [zadaszenieForm.ts](frontend/app/lib/validations/zadaszenieForm.ts). The select
label itself („Wybierz rodzaj dachu”) stays — only two options change:

| Current                          | New                                  |
| -------------------------------- | ------------------------------------ |
| `Pergole ekonomiczne`            | `Materia (pergole ekonomiczne)`      |
| `Roleta rzymska Deponti Verdeca` | `Roleta rzymska (Deponti Verdeca)`   |

The option string **is** the submitted value and goes straight into the quote e-mail
(„Rodzaj dachu: …”), so the e-mail picks up the new wording automatically. Nothing else in the
repo references these strings except the test below.

---

## 3. Tekst pod checkboxem „Usługa montażu”

[ZadaszenieForm.tsx](frontend/app/components/forms/ZadaszenieForm.tsx) — `helperText` of the
`installationService` checkbox (the visible label „Usługa montażu” stays):

| Current                                                  | New                                           |
| -------------------------------------------------------- | --------------------------------------------- |
| `Zaznacz jeśli chcesz wycenić montaż wraz z zadaszeniem` | `Zaznacz, jeśli wycena ma obejmować montaż.`  |

This is the exact string `TarasForm.tsx` and `ZaluzjeForm.tsx` already use, so all three forms
now read the same.

---

## 4. „Wyposażenie dodatkowe” — nowy szyk nazw

The client's rule, from the two examples:

- reorder to **`Zabudowa <rodzaj>, <rama>, <materiał>`** — „szklana” moves to the end as „szkło”;
- the side separator changes from **` / `** to **` - `**.

„Apply that logic to each matching checkbox” → the separator change applies to **every** option
with a side suffix (bok 1 / bok 2 / front), so the whole group is consistent. The wording of
options that already follow the comma pattern („Zabudowa stała, poliwęglan”) and of „Pionowa
roleta (pergole ekonomiczne)” is otherwise unchanged.

| `name`                     | Current                                          | New                                              |
| -------------------------- | ------------------------------------------------ | ------------------------------------------------ |
| `equipPolyWallSide1`       | Zabudowa stała, poliwęglan / bok 1               | Zabudowa stała, poliwęglan - bok 1               |
| `equipPolyWallSide2`       | Zabudowa stała, poliwęglan / bok 2               | Zabudowa stała, poliwęglan - bok 2               |
| `equipPolyWallFront`       | Zabudowa stała, poliwęglan / front               | Zabudowa stała, poliwęglan - front               |
| `equipFramelessDoorsSide1` | Zabudowa szklana przesuwna bezramowa / bok 1     | Zabudowa przesuwna, bezramowa, szkło - bok 1     |
| `equipFramelessDoorsSide2` | Zabudowa szklana przesuwna bezramowa / bok 2     | Zabudowa przesuwna, bezramowa, szkło - bok 2     |
| `equipFramelessDoorsFront` | Zabudowa szklana przesuwna bezramowa / front     | Zabudowa przesuwna, bezramowa, szkło - front     |
| `equipFramedDoorsSide1`    | Zabudowa szklana przesuwna ramowa / bok 1        | Zabudowa przesuwna, ramowa, szkło - bok 1        |
| `equipFramedDoorsSide2`    | Zabudowa szklana przesuwna ramowa / bok 2        | Zabudowa przesuwna, ramowa, szkło - bok 2        |
| `equipFramedDoorsFront`    | Zabudowa szklana przesuwna ramowa / front        | Zabudowa przesuwna, ramowa, szkło - front        |
| `equipVerticalBlindSide1`  | Pionowa roleta (pergole ekonomiczne) / bok 1     | Pionowa roleta (pergole ekonomiczne) - bok 1     |
| `equipVerticalBlindSide2`  | Pionowa roleta (pergole ekonomiczne) / bok 2     | Pionowa roleta (pergole ekonomiczne) - bok 2     |
| `equipVerticalBlindFront`  | Pionowa roleta (pergole ekonomiczne) / front     | Pionowa roleta (pergole ekonomiczne) - front     |

Unchanged (no side suffix): both „Klin boczny …” options, „Oświetlenie punktowe LED + pilot”,
„Markizy poddachowe” (item 1).

The labels are also what the server action
([submitZadaszenieForm.ts](frontend/app/lib/actions/submitZadaszenieForm.ts)) lists in the quote
e-mail, so the e-mail follows automatically. Order of the group stays the same.

---

## Tests to update

- [zadaszenieForm.test.ts](frontend/app/lib/validations/zadaszenieForm.test.ts) — the hardcoded
  `ROOF_TYPES` list (`'Pergole ekonomiczne'`, `'Roleta rzymska Deponti Verdeca'`).
- [submitZadaszenieForm.test.ts](frontend/app/lib/actions/submitZadaszenieForm.test.ts) — e-mail
  assertions for `'Zabudowa szklana przesuwna ramowa / front'` and `'Markizy podachowe'`.

---

## Verification

- `/wycena/zadaszenie` in the browser: select options, helper text, checkbox group render with
  the new copy.
- Submit a test quote with a changed roof type + a few add-ons → e-mail shows the new labels.
- `npm run lint`, `npm run type-check`, `npm test`, `next build` clean.

---

## Open question for the client

- **„Materia (pergole ekonomiczne)”** — applied as written. If it should be **„Materiał”**
  (fabric) rather than „Materia”, it's a one-word change.
