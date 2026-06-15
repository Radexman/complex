import {settings} from './singletons/settings'
import {heroSection} from './objects/heroSection'
import {heroStat} from './objects/heroStat'
import {navbar} from './objects/navbar'

// Export an array of all the schema types.  This is used in the Sanity Studio configuration. https://www.sanity.io/docs/studio/schema-types

export const schemaTypes = [
  // Singletons
  settings,
  // Objects
  heroSection,
  heroStat,
  navbar,
]
