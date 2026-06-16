import { sanityFetch } from '@/sanity/lib/live';
import { navbarQuery } from '@/sanity/lib/queries';
import Navbar from '@/app/components/layout/Navbar';

/**
 * Site header. Fetches the CMS-managed navbar config (logo + CTA) and renders
 * the fixed <Navbar>, which is transparent over the hero and blurs on scroll.
 */
export default async function Header() {
  const { data: navbar } = await sanityFetch({ query: navbarQuery });

  return <Navbar navbar={navbar ?? undefined} />;
}
