import {
  Calculator,
  FileCheck,
  FileSignature,
  Hammer,
  Mail,
  Ruler,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

/**
 * Shared lookup from a `processStep.icon` value to its Lucide icon. Consumed by
 * both `ProcessTimeline` (the full home/offer timeline) and `FormSuccessState`
 * (the inline "Co dalej?" recap) so the icon set stays in one place.
 */
export const PROCESS_STEP_ICON_MAP: Record<string, LucideIcon> = {
  'mail': Mail,
  'calculator': Calculator,
  'ruler': Ruler,
  'file-check': FileCheck,
  'file-signature': FileSignature,
  'hammer': Hammer,
  'shield-check': ShieldCheck,
};
