# Feature: Multiple variants per board type (Tarasy / accordion)

**Status:** ready for implementation
**Area:** Tarasy page → board type accordion (`Deski kompozytowe komorowe`, `Deski pełne`, …)
**Type:** content model + UI change (not a bug fix)

---

## 1. Problem

The accordion currently assumes **1 board type = 1 panel = 1 photo + 1 spec list**.

The client's actual catalogue doesn't fit that shape. A single "type" (e.g. _deski komorowe_)
is a family of products that differ by manufacturer, colour, surface structure and dimensions.
Today she can only pick one representative photo and one set of specs, so the variety is
described in prose instead of shown:

> "Dostępne są w różnych kolorach, strukturach i wymiarach, zależnie od wybranego producenta."

That sentence is a workaround for missing UI. The spec list has the same defect — `Grubość 22 mm`
is only true for some of the boards that belong in that panel.

**Client request (WhatsApp, translated):** she considered (1) one accordion entry per board type —
rejected as too long a list — and prefers (2) more thumbnails inside a single panel. Her volumes:
~9 variants for _komorowe_, ~5 for _pełne_, plus a possible additional board type. So the
component must handle **1 to ~20 variants per panel** and be extended by content edits, not code
changes.

---

## 2. Decisions (already made — do not re-litigate)

| Question                          | Decision                                                                                                  |
| --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| Layout of variants inside a panel | **Flat responsive grid.** No sub-groups, no group headers.                                                |
| Thumbnail click behaviour         | **Expands inline** into a detail region within the same panel. No lightbox, no modal, no navigation away. |
| Data carried per variant          | **Image + caption (name) + its own spec list.**                                                           |

Note on the client's "(5 + 4)": she grouped the komorowe boards into two clusters (likely two
profiles or two manufacturers). With per-variant specs this distinction is carried **on each card's
own spec list** (e.g. `Grubość 22 mm` vs `Grubość 25 mm`), so no grouping UI is required. If she
later insists on visible group labels, that is a follow-up ticket.

---

## 3. Data model

Panel-level `image` and `specs` are removed and pushed down to the variant. Adapt naming to the
existing codebase conventions; the shape is what matters.

```ts
type BoardVariant = {
  id: string; // stable slug, e.g. "komorowa-22-antracyt"
  name: string; // REQUIRED caption, e.g. "Antracyt – struktura drewna"
  image: {
    src: string;
    alt: string; // REQUIRED, descriptive, Polish
  };
  specs: string[]; // REQUIRED, e.g. ["Grubość 22 mm", "Szerokość 140 mm", "Ukryty system montażu"]
  description?: string; // OPTIONAL short paragraph, shown only in the expanded detail
  manufacturer?: string; // OPTIONAL, shown as a small label in the detail
};

type BoardType = {
  // = one accordion panel
  id: string;
  title: string; // "Deski kompozytowe komorowe"
  subtitle: string; // "Ekonomiczne deski z komorową konstrukcją profilu."
  description: string[]; // paragraphs — must accept more than one
  variants: BoardVariant[];
};
```

### Migration

Existing content converts losslessly: each current panel becomes a `BoardType` with exactly
**one** variant holding today's image and today's three specs. Nothing regresses; the client then
appends variants to the array.

### Editing ergonomics

The client edits this content herself. Therefore:

- Keep it in **one obvious content file** (JSON / TS const / MDX frontmatter — match what the
  project already does), not spread across components.
- Adding a variant must be **copy the previous object, change 4 fields**. Nothing derived,
  nothing indexed by position, no parallel arrays to keep in sync.
- Optional fields must degrade silently — a missing `description` or `manufacturer` renders
  nothing, never an empty heading or a broken layout.
- Add a short `README`-style comment at the top of the content file showing how to add a new
  variant and a new board type.

---

## 4. UI specification

### 4.1 Panel layout change

The current expanded panel is a two-column layout: text on the left, one large image on the right.
Nine thumbnails will not fit in that right column. Restructure to:

```
┌ panel (expanded) ─────────────────────────────┐
│  description paragraphs   (max ~65ch, left)   │
│                                               │
│  variant grid   (FULL WIDTH)                  │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐                  │
│  │    │ │    │ │    │ │    │                  │
│  └────┘ └────┘ └────┘ └────┘                  │
│  ┌───────────────────────────────────────┐    │
│  │ detail region (full width, if open)   │    │
│  └───────────────────────────────────────┘    │
│  ┌────┐ ┌────┐ …                              │
└───────────────────────────────────────────────┘
```

This is a visible design change to a page the client has already approved — call it out in the PR
description so it isn't a surprise.

### 4.2 Variant card (thumbnail)

- Rendered as a `<button>`, not a `div` with onClick.
- Contents: image + `name` caption below it. **Specs are not shown on the card** — they live in the
  detail region.
- Fixed aspect ratio container (`aspect-ratio: 4 / 3`) with `object-fit: cover`, so mismatched
  manufacturer photos still line up. Light card background, matching the white rounded image card
  in the current design.
- Responsive columns: `grid-template-columns: repeat(auto-fill, minmax(160px, 1fr))` — roughly
  2 columns on mobile, 3 on tablet, 4 on desktop.
- Active (expanded) card gets a clear visual state — accent border/ring in the existing green,
  not colour alone.
- Hover/focus: subtle lift or ring. Focus ring must be visible against the dark background.

### 4.3 Detail region (inline expansion)

- Inserted as a **full-width row of the grid** (`grid-column: 1 / -1`), positioned **after the last
  card of the row containing the clicked card** — the pattern used by image search results. This
  keeps the clicked card visually connected to its detail and avoids reflowing the grid.
  - _Implementation note:_ the column count must be read at runtime (e.g. compare
    `offsetTop` of cards, or a `ResizeObserver` on the grid) to know where the row ends.
  - **Acceptable fallback** if that proves fragile: render the detail region directly below the
    entire grid, with the active card highlighted. Do not ship a version that pushes cards around
    mid-row.
- Contents: larger image, `name` as a heading, `SPECYFIKACJA` list from `variant.specs`,
  optional `description`, optional `manufacturer`, and a close button.
- **One open at a time.** Clicking the active card closes it; clicking another swaps content.
- Opening/closing animates height. Respect `prefers-reduced-motion`.
- If the detail region opens off-screen, scroll it into view gently (`block: "nearest"`), never a
  hard jump.

### 4.4 Interaction with the outer accordion

⚠️ **Known breakage point.** The outer accordion likely animates with a fixed `max-height`. When the
inner detail expands, the panel will clip its own content. Fix by measuring content height
dynamically (`scrollHeight` / `ResizeObserver`) or by using a grid-rows `0fr → 1fr` transition.
Test explicitly: open a panel → open a variant near the bottom → confirm nothing is cut off.

Closing the outer accordion should reset the inner expansion state.

### 4.5 Edge cases

- **1 variant:** render the grid normally. A single card in a 4-column grid looks wrong — either
  cap the card's max-width or, preferably, render a single variant as the old-style large image
  with its specs beside it and no expand interaction.
- **2–3 variants:** grid must not stretch cards to absurd widths — `minmax` handles this if
  `justify-content: start` is set.
- **0 variants:** panel renders description only, no empty grid container.
- **Long `name`:** captions must wrap to 2 lines without changing card height (reserve the space).

---

## 5. Accessibility

- Cards: `<button type="button">` with `aria-expanded` and `aria-controls` pointing at the detail
  region id.
- Detail region: `role="region"` with `aria-labelledby` referencing the variant name heading.
- `Esc` closes the open detail and returns focus to the triggering card.
- Focus stays on the trigger on open (do not steal focus into the detail region).
- All images require meaningful Polish `alt` text — colour and structure, not "zdjęcie deski".
- Keyboard: `Tab` order follows DOM order; arrow-key roving focus within the grid is optional
  and can be skipped for v1.

---

## 6. Images & performance

Fourteen-plus photos on one page is the main performance risk here.

- `loading="lazy"` + `decoding="async"` on all thumbnails.
- Explicit `width`/`height` (or `aspect-ratio`) on every image to prevent layout shift.
- Two rendered sizes per variant: thumbnail (~400 w) and detail (~1000 w), via `srcset` or the
  framework's image component. Do not ship one 2000 px JPEG used at 180 px.
- Prefer WebP/AVIF. Target < 80 KB per thumbnail.
- Variant images should share a consistent treatment (same background, similar crop/angle).
  Inconsistent manufacturer stock photos will make the grid look messy — flag to the client if
  the supplied assets vary wildly.
- Store variant images in a predictable folder per board type so the client can drop new files in.

---

## 7. Acceptance criteria

- [ ] A board type can define 1..20+ variants purely by editing the content file.
- [ ] Each variant has its own caption, image and spec list; the panel no longer holds a single
      global image or spec list.
- [ ] Existing content is migrated with no visible regression for single-variant panels.
- [ ] Clicking a thumbnail expands an inline detail region inside the same panel; only one is open
      at a time; clicking it again closes it.
- [ ] The outer accordion grows correctly when an inner detail opens — no clipped content at any
      viewport width.
- [ ] Grid is responsive from 360 px to ≥1440 px with no overflow and no stretched cards.
- [ ] Cards are keyboard operable, `Esc` closes, focus is visible, `aria-expanded`/`aria-controls`
      are correct.
- [ ] Lighthouse: no CLS regression; thumbnails lazy-loaded.
- [ ] Optional fields (`description`, `manufacturer`) can be omitted without visual artefacts.
- [ ] Content file carries a comment explaining how to add a variant and a board type.

---

## 8. Out of scope

Filtering or search across variants · side-by-side comparison · per-variant pricing or stock ·
"add to enquiry" / cart · lightbox or full-screen gallery · visible sub-group headers within a
panel · changes to the zadaszenia section.

---
