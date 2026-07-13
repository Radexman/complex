import type { AllProjectsQueryResult } from '@/sanity.types';

/** Project/service category value union (kept in sync with the generated Sanity types). */
export type ProjectCategory = AllProjectsQueryResult[number]['category'];

/** Polish labels keyed by category value. Order here drives the (static) tab order. */
export const CATEGORY_LABELS: Record<ProjectCategory, string> = {
  'zadaszenia-tarasowe': 'Zadaszenia tarasowe',
  'zaluzje-tarasowe': 'Żaluzje tarasowe',
  'tarasy-kompozytowe': 'Tarasy kompozytowe',
  'tarasy-gresowe': 'Tarasy gresowe',
  'tarasy-drewniane': 'Tarasy drewniane',
  'elewacje-kompozytowe': 'Elewacje kompozytowe',
  'schody-modulowe': 'Schody modułowe',
};

export const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as ProjectCategory[];

export function categoryLabel(category: ProjectCategory): string {
  return CATEGORY_LABELS[category] ?? category;
}
