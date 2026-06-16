'use client'

import Link from 'next/link'

import type {OfferSection as OfferSectionType} from '@/sanity.types'

const DEFAULT_CTA_HREF = '/oferta'

export default function OfferSection({data}: {data?: OfferSectionType}) {
  const ctaHref = data?.ctaHref || DEFAULT_CTA_HREF

  return (
    <section className="section-padding bg-bg-mid">
      <div className="container mx-auto">
        <div className="flex justify-between items-end">
          <div className="flex flex-col space-y-4 max-w-4xl">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">
              {data?.eyebrow}
            </p>
            <h2 className=" font-heading text-4xl font-bold thext-white md:text-5xl">
              {data?.headline}
            </h2>
            <p className="">{data?.subheadline}</p>
          </div>
          <div>
            <Link href={ctaHref} className="text-accent">
              {data?.ctaLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
