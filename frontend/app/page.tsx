import {settingsQuery} from '@/sanity/lib/queries'
import {sanityFetch} from '@/sanity/lib/live'
import {dataAttr} from '@/sanity/lib/utils'

export default async function Page() {
  const {data: settings} = await sanityFetch({
    query: settingsQuery,
  })

  return (
    <h1
      data-sanity={
        settings?._id
          ? dataAttr({id: settings._id, type: 'settings', path: 'heading'}).toString()
          : undefined
      }
    >
      {settings?.heading ?? 'Complex'}
    </h1>
  )
}
