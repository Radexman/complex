import {
  Award,
  CheckCircle,
  Clock,
  Droplets,
  MapPin,
  Ruler,
  ShieldCheck,
  Star,
  Sun,
  Users,
  Wrench,
  Zap,
  type LucideIcon,
} from 'lucide-react';

/**
 * Shared lookup from a benefit-style `icon` value to its Lucide icon. The keys mirror
 * `BENEFIT_ICONS` in studio/src/schemaTypes/documents/service.ts, which drives the Studio
 * dropdown — keep the two in sync.
 *
 * Consumed by `OfferBenefits` (offer pages) and `AboutValues` (/o-nas). `OfferTechSpecs` still
 * carries its own copy plus four extras (`TECH_SPEC_ICONS`) — worth folding in here later.
 */
export const BENEFIT_ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  clock: Clock,
  award: Award,
  users: Users,
  star: Star,
  check: CheckCircle,
  tool: Wrench,
  map: MapPin,
  sun: Sun,
  droplets: Droplets,
  ruler: Ruler,
  zap: Zap,
};
