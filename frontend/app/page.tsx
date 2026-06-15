import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import HeroSection from '@/app/components/sections/HeroSection'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  if (!settings?.hero) {
    return null
  }

  return <HeroSection data={settings.hero} />
}
