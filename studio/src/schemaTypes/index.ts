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

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons (one fixed-id document each)
  settings,
  navbar,
  heroSection,
  trustSection,
  offerSection,
  aboutSection,
  // Objects (embedded in the singletons above)
  heroStat,
  trustStat,
  offerCard,
  aboutBadge,
];
