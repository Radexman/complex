import { stegaClean } from 'next-sanity';

import type {
  BottomCtaQueryResult,
  GalleryProjectsByCategoryQueryResult,
  ProcessTimelineQueryResult,
  ServiceBySlugQueryResult,
  VatHighlightQueryResult,
} from '@/sanity.types';
import { categoryLabel } from '@/app/lib/categories';
import ContactShowroom from '@/app/components/sections/ContactShowroom';
import ProcessTimeline from '@/app/components/sections/ProcessTimeline';
import VatHighlight from '@/app/components/sections/VatHighlight';

import OfferBenefits from './OfferBenefits';
import OfferBrands from './OfferBrands';
import OfferFormCta from './OfferFormCta';
import OfferGallery from './OfferGallery';
import OfferHero from './OfferHero';
import OfferTechSpecs from './OfferTechSpecs';

export type Service = NonNullable<ServiceBySlugQueryResult>;

/**
 * Composition root for an offer subpage. Renders each section in order from the
 * shared `service` document. The final section (spec 7) is the shared
 * `ContactShowroom` block — the same contact/showroom block as the home page,
 * fed by the single `bottomCtaSection` source.
 */
export default function OfferPage({
  service,
  galleryProjects,
  processTimeline,
  vatHighlight,
  contact,
}: {
  service: Service;
  galleryProjects: GalleryProjectsByCategoryQueryResult;
  processTimeline: ProcessTimelineQueryResult;
  vatHighlight: VatHighlightQueryResult;
  contact: BottomCtaQueryResult;
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
      {processTimeline && <ProcessTimeline data={processTimeline} />}
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
      {/* Sits right before the quotation CTA — price is on the visitor's mind here. */}
      {vatHighlight && <VatHighlight data={vatHighlight} />}
      {service.relatedFormSlug && (
        <OfferFormCta
          formCtaHeadline={service.formCtaHeadline}
          formCtaSubheadline={service.formCtaSubheadline}
          formCtaButtonLabel={service.formCtaButtonLabel}
          formCtaBullets={service.formCtaBullets}
          relatedFormSlug={service.relatedFormSlug}
        />
      )}
      {contact && (
        <ContactShowroom
          contactEyebrow={contact.contactEyebrow}
          contactNote={contact.contactNote}
          contactPhone={contact.contactPhone}
          contactEmail={contact.contactEmail}
          showroomLabel={contact.showroomLabel}
          showroomDescription={contact.showroomDescription}
          showroomAddress={contact.showroomAddress}
          officeLabel={contact.officeLabel}
          officeDescription={contact.officeDescription}
          mapAddress={contact.mapAddress}
          serviceAreaLabel={contact.serviceAreaLabel}
          serviceAreaDescription={contact.serviceAreaDescription}
        />
      )}
    </main>
  );
}
