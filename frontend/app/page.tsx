import {
  aboutQuery,
  beforeAfterQuery,
  bottomCtaQuery,
  featuredProjectsQuery,
  featuredProjectsSectionQuery,
  heroQuery,
  offerQuery,
  processTimelineQuery,
  trustQuery,
  vatHighlightQuery,
} from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import HeroSection from '@/app/components/sections/HeroSection';
import TrustSection from '@/app/components/sections/TrustSection';
import OfferSection from './components/sections/OfferSection';
import AboutSection from './components/sections/AboutSection';
import FeaturedProjectsSection from './components/sections/FeaturedProjectsSection';
import BeforeAfterSection from './components/sections/BeforeAfterSection';
import VatHighlight from './components/sections/VatHighlight';
import ProcessTimeline from './components/sections/ProcessTimeline';
import BottomCtaSection from './components/sections/BottomCtaSection';

export default async function Page() {
  const [
    { data: hero },
    { data: trust },
    { data: offer },
    { data: about },
    { data: featuredSection },
    { data: featuredProjects },
    { data: beforeAfter },
    { data: vatHighlight },
    { data: processTimeline },
    { data: bottomCta },
  ] = await Promise.all([
    sanityFetch({ query: heroQuery }),
    sanityFetch({ query: trustQuery }),
    sanityFetch({ query: offerQuery }),
    sanityFetch({ query: aboutQuery }),
    sanityFetch({ query: featuredProjectsSectionQuery }),
    sanityFetch({ query: featuredProjectsQuery }),
    sanityFetch({ query: beforeAfterQuery }),
    sanityFetch({ query: vatHighlightQuery }),
    sanityFetch({ query: processTimelineQuery }),
    sanityFetch({ query: bottomCtaQuery }),
  ]);

  return (
    <>
      {hero && <HeroSection data={hero} />}
      <TrustSection data={trust ?? undefined} />
      <OfferSection data={offer ?? undefined} />
      {about && <AboutSection data={about} />}
      {featuredSection && (
        <FeaturedProjectsSection data={featuredSection} projects={featuredProjects} />
      )}
      {beforeAfter && <BeforeAfterSection data={beforeAfter} />}
      {vatHighlight && <VatHighlight data={vatHighlight} />}
      {processTimeline && <ProcessTimeline data={processTimeline} />}
      {bottomCta && <BottomCtaSection data={bottomCta} />}
    </>
  );
}
