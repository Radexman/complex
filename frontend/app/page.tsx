import {
  aboutQuery,
  featuredProjectsQuery,
  featuredProjectsSectionQuery,
  heroQuery,
  offerQuery,
  trustQuery,
} from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import HeroSection from '@/app/components/sections/HeroSection';
import TrustSection from '@/app/components/sections/TrustSection';
import OfferSection from './components/sections/OfferSection';
import AboutSection from './components/sections/AboutSection';
import FeaturedProjectsSection from './components/sections/FeaturedProjectsSection';

export default async function Page() {
  const [
    { data: hero },
    { data: trust },
    { data: offer },
    { data: about },
    { data: featuredSection },
    { data: featuredProjects },
  ] = await Promise.all([
    sanityFetch({ query: heroQuery }),
    sanityFetch({ query: trustQuery }),
    sanityFetch({ query: offerQuery }),
    sanityFetch({ query: aboutQuery }),
    sanityFetch({ query: featuredProjectsSectionQuery }),
    sanityFetch({ query: featuredProjectsQuery }),
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
    </>
  );
}
