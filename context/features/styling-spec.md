# Styling

## Overview

Set up the global design system for the Complex website. Update `globals.css` with all design tokens — colors, typography, spacing, and base styles — derived from the project spec. This is the foundation that every component and page will build on.

## Requirements

- Import the three project fonts from Google Fonts in `globals.css` using `@import`: **Bebas Neue**, **Space Grotesk**, **Inter**
- Define CSS custom properties (variables) on `:root` for the full color palette:
  - `--color-bg-deep: #0B0B0C` — main page background
  - `--color-bg-mid: #111111` — alternate section backgrounds
  - `--color-bg-surface: #181818` — cards, panels, drawers
  - `--color-accent: #6FCF3A` — primary brand accent (CTAs, highlights, hover states)
  - `--color-accent-hover: #5BB82E` — darkened accent for hover states
  - `--color-graphite: #2A2A2A` — borders, dividers
  - `--color-silver: #9E9E9E` — secondary / muted text
  - `--color-white: #FFFFFF` — primary typography
- Define CSS custom properties for typography:
  - `--font-display: 'Bebas Neue', sans-serif` — hero headlines
  - `--font-heading: 'Space Grotesk', sans-serif` — section titles, card titles
  - `--font-body: 'Inter', sans-serif` — body text, descriptions
- Set base `body` styles: `background-color` to `--color-bg-deep`, `color` to `--color-white`, `font-family` to `--font-body`
- Set `html` to `scroll-behavior: smooth`
- Define Tailwind CSS v4 theme extension using `@theme` to expose all CSS variables as Tailwind utility classes (e.g. `bg-bg-deep`, `text-accent`, `font-display`)
- Add a base glassmorphism utility class `.glass` using `@layer utilities`:
  - `background: rgba(24, 24, 24, 0.6)`
  - `backdrop-filter: blur(12px)`
  - `border: 1px solid rgba(255, 255, 255, 0.08)`
- Add a `.section-padding` utility for consistent vertical section spacing: `padding-top: 6rem; padding-bottom: 6rem`
- Remove default margin/padding resets if not already handled by Tailwind preflight
- Dark mode only — no `prefers-color-scheme` media query needed, dark is the only theme

## References

- `@context/complex-project-spec.md` — Design System section (colors, typography, UI style)
- `src/app/globals.css` — file to update
