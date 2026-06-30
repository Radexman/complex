import { stegaClean } from 'next-sanity';

import type { GalleryProjectsByCategoryQueryResult, ServiceBySlugQueryResult } from '@/sanity.types';
import { categoryLabel } from '@/app/lib/categories';

import OfferBenefits from './OfferBenefits';
import OfferBrands from './OfferBrands';
import OfferFormCta from './OfferFormCta';
import OfferGallery from './OfferGallery';
import OfferHero from './OfferHero';
import OfferTechSpecs from './OfferTechSpecs';

export type Service = NonNullable<ServiceBySlugQueryResult>;

/**
 * Composition root for an offer subpage. Renders each section in order from the
 * shared `service` document. Spec 7 adds the remaining section below the form CTA:
 *   <OfferContact />
 */
export default function OfferPage({
  service,
  galleryProjects,
}: {
  service: Service;
  galleryProjects: GalleryProjectsByCategoryQueryResult;
}) {
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
        benefitsEyebrow={service.benefitsEyebrow}
        benefitsHeadline={service.benefitsHeadline}
        benefitsDescription={service.benefitsDescription}
        benefits={service.benefits}
      />
      <OfferGallery
        projects={galleryProjects}
        categoryLabel={categoryLabel(stegaClean(service.category))}
      />
      <OfferBrands
        brandsEyebrow={service.brandsEyebrow}
        brandsHeadline={service.brandsHeadline}
        brandsDescription={service.brandsDescription}
        brands={service.brands}
      />
      <OfferTechSpecs
        techSpecsHeadline={service.techSpecsHeadline}
        techSpecsDescription={service.techSpecsDescription}
        techSpecs={service.techSpecs}
      />
      {service.relatedFormSlug && (
        <OfferFormCta
          formCtaHeadline={service.formCtaHeadline}
          formCtaSubheadline={service.formCtaSubheadline}
          formCtaButtonLabel={service.formCtaButtonLabel}
          formCtaBullets={service.formCtaBullets}
          relatedFormSlug={service.relatedFormSlug}
        />
      )}
    </main>
  );
}
