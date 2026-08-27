import type { AllProjectsQueryResult } from '@/sanity.types';

/** Project/service category value union (kept in sync with the generated Sanity types). */
export type ProjectCategory = AllProjectsQueryResult[number]['category'];

/** Polish labels keyed by category value. Order here drives the (static) tab order. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'zadaszenia-tarasowe': 'Zadaszenia tarasowe',
  'akcesoria-do-zadaszen': 'Akcesoria do zadaszeń',
  'tarasy-kompozytowe': 'Tarasy kompozytowe',
  'tarasy-gresowe': 'Tarasy gresowe',
  'tarasy-drewniane': 'Tarasy drewniane',
  'schody-modulowe': 'Schody modułowe',
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

/**
 * Categories shown as Realizacje filter tabs. Schody modułowe stays a real offer
 * (form, nav entry, offer page) — it's only excluded here because there are no
 * realizations to show under it yet.
 */
export const REALIZACJE_TAB_CATEGORIES = CATEGORY_ORDER.filter(
  (category) => category !== 'schody-modulowe',
);

export function categoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
