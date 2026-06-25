import type { ServiceBySlugQueryResult } from '@/sanity.types';

import OfferBenefits from './OfferBenefits';
import OfferHero from './OfferHero';

export type Service = NonNullable<ServiceBySlugQueryResult>;

/**
 * Composition root for an offer subpage. Renders each section in order from the
 * shared `service` document. Specs 3–7 add the remaining sections below benefits:
 *   <OfferGallery />  <OfferBrands />  <OfferTechSpecs />
 *   <OfferFormCta />  <OfferContact />
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
      <OfferBenefits
        benefitsHeadline={service.benefitsHeadline}
        benefitsDescription={service.benefitsDescription}
        benefits={service.benefits}
      />
    </main>
  );
}
