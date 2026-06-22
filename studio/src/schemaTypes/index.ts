import { settings } from './singletons/settings';
import { heroSection } from './objects/heroSection';
import { heroStat } from './objects/heroStat';
import { navbar } from './objects/navbar';
import { trustSection } from './objects/trustSection';
import { trustStat } from './objects/trustStat';
import { offerSection } from './objects/offerSection';
import { offerCard } from './objects/offerCard';
import { aboutSection } from './objects/aboutSection';
import { aboutBadge } from './objects/aboutBadge';
import { featuredProjectsSection } from './objects/featuredProjectsSection';
import { realizacjePage } from './objects/realizacjePage';
import { bottomCtaSection } from './objects/bottomCtaSection';
import { footer } from './objects/footer';
import { project } from './documents/project';
import { service } from './documents/service';

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons (one fixed-id document each)
  settings,
  navbar,
  heroSection,
  trustSection,
  offerSection,
  aboutSection,
  featuredProjectsSection,
  realizacjePage,
  bottomCtaSection,
  footer,
  // Collections (multiple documents)
  project,
  service,
  // Objects (embedded in the singletons above)
  heroStat,
  trustStat,
  offerCard,
  aboutBadge,
];
