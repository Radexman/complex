import { heroQuery, offerQuery, trustQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import HeroSection from '@/app/components/sections/HeroSection';
import TrustSection from '@/app/components/sections/TrustSection';
import OfferSection from './components/sections/OfferSection';

export default async function Page() {
  const [{ data: hero }, { data: trust }, { data: offer }] = await Promise.all([
    sanityFetch({ query: heroQuery }),
    sanityFetch({ query: trustQuery }),
    sanityFetch({ query: offerQuery }),
  ]);

  return (
    <>
      {hero && <HeroSection data={hero} />}
      <TrustSection data={trust ?? undefined} />
      <OfferSection data={offer ?? undefined} />
    </>
  );
}
