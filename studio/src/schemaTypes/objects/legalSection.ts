import { defineField, defineType } from 'sanity';

/**
 * One block of a legal document. Deliberately more structured than the plain
 * `text` field `aboutPage.storyBody` uses: a privacy policy has numbered clauses
 * with bulleted lists inside them, which a blank-line split cannot express.
 *
 * Render order is always: heading → body paragraphs → bullets → footnote.
 */
export const legalSection = defineType({
  name: 'legalSection',
  title: 'Sekcja',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Nagłówek',
      description: 'Opcjonalny tytuł sekcji, np. „Pliki cookies". Zostaw pusty dla samego tekstu.',
      type: 'string',
    }),
    defineField({
      name: 'body',
      title: 'Treść',
      description:
        'Akapity sekcji. Oddziel je pustą linią (Enter dwa razy) — każdy blok będzie osobnym akapitem.',
      type: 'text',
      rows: 8,
    }),
    defineField({
      name: 'bullets',
      title: 'Lista punktowana',
      description: 'Punkty wyświetlane pod treścią. Zostaw puste, jeśli sekcja ich nie ma.',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'footnote',
      title: 'Uwaga pod listą',
      description: 'Tekst pod listą punktowaną, np. „(Uwaga: …)". Opcjonalny.',
      type: 'text',
      rows: 3,
    }),
  ],
  preview: {
    select: { heading: 'heading', body: 'body' },
    prepare({ heading, body }: { heading?: string; body?: string }) {
      return {
        title: heading || body?.slice(0, 60) || 'Sekcja',
        subtitle: heading ? body?.slice(0, 60) : undefined,
      };
    },
  },
});
