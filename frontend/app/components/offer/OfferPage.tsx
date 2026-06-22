import type { ServiceBySlugQueryResult } from '@/sanity.types';

import OfferHero from './OfferHero';

export type Service = NonNullable<ServiceBySlugQueryResult>;

/**
 * Composition root for an offer subpage. Renders each section in order from the
 * shared `service` document. Specs 2–7 add the remaining sections below the hero:
 *   <OfferBenefits />  <OfferGallery />  <OfferBrands />
 *   <OfferTechSpecs />  <OfferFormCta />  <OfferContact />
 */
export default function OfferPage({ service }: { service: Service }) {
  return (
    <main>
      <OfferHero
        heroImage={service.heroImage}
        heroHeadline={service.heroHeadline}
        heroSubheadline={service.heroSubheadline}
        title={service.title}
        relatedFormSlug={service.relatedFormSlug}
      />
    </main>
  );
}
