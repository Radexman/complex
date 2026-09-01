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
import OfferRelatedLinks from './OfferRelatedLinks';
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
      <OfferGallery
        projects={galleryProjects}
        categoryLabel={categoryLabel(stegaClean(service.category))}
        footerText={service.galleryFooterText}
        facebookUrl={service.galleryFacebookUrl}
      />
      {/* Sits under the gallery, where the client asked for it („pod tekstem —
          zobacz wybrane realizacje”), but outside it so an offer with no
          projects still shows its cross-links. */}
      <OfferRelatedLinks relatedOffers={service.relatedOffers} />
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
          secondaryFormSlug={service.secondaryFormSlug}
          secondaryFormButtonLabel={service.secondaryFormButtonLabel}
        />
      )}
      {processTimeline && <ProcessTimeline data={processTimeline} />}
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
          showroomGallery={contact.showroomGallery}
        />
      )}
    </main>
  );
}
