import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import HeroSection from '@/app/components/sections/HeroSection'
import TrustSection from '@/app/components/sections/TrustSection'
import OfferSection from './components/sections/OfferSection'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  if (!settings) {
    return null
  }

  return (
    <>
      {settings.hero && <HeroSection data={settings.hero} />}
      <TrustSection data={settings.trust} />
      <OfferSection data={settings.offer} />
    </>
  )
}
