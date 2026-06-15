'use client'

import {useRef} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {gsap} from 'gsap'
import {useGSAP} from '@gsap/react'
import {stegaClean} from 'next-sanity'

import type {HeroSection as HeroSectionType} from '@/sanity.types'
import {urlForImage} from '@/sanity/lib/utils'

type HeroStat = {value: string; label: string}

/** Fallback stats used when the CMS document has none. */
const DEFAULT_STATS: HeroStat[] = [
  {value: '1200+', label: 'Realizacji'},
  {value: '15', label: 'Lat doświadczenia'},
  {value: '98%', label: 'Zadowolonych klientów'},
  {value: '50+', label: 'Opcji projektowych'},
]

/** CTA fallbacks for when the CMS fields are empty. */
const DEFAULT_PRIMARY_CTA_LABEL = 'Nasze realizacje'
const DEFAULT_PRIMARY_CTA_HREF = '/realizacje'
const DEFAULT_SECONDARY_CTA_LABEL = 'Darmowa wycena'
const DEFAULT_SECONDARY_CTA_HREF = '/wycena/zadaszenie'

/**
 * Splits the headline so the `accent` substring can be rendered in the accent
 * color. Falls back to the plain headline when the accent is absent.
 */
function renderHeadline(headline: string, accent?: string) {
  // Strings from sanityFetch carry invisible stega metadata; strip it before
  // any substring matching, otherwise the accent never matches the headline.
  const cleanHeadline = stegaClean(headline)
  const cleanAccent = accent ? stegaClean(accent) : undefined
  if (!cleanAccent || !cleanHeadline.includes(cleanAccent)) {
    return cleanHeadline
  }
  const [before, ...rest] = cleanHeadline.split(cleanAccent)
  const after = rest.join(cleanAccent)
  return (
    <>
      {before}
      <span className="text-accent">{accent}</span>
      {after}
    </>
  )
}

export default function HeroSection({data}: {data: HeroSectionType}) {
  const container = useRef<HTMLElement>(null)

  const {backgroundImage, headline, headlineAccent, subheadline, stats} = data

  const primaryCtaLabel = data.primaryCtaLabel || DEFAULT_PRIMARY_CTA_LABEL
  const primaryCtaHref = data.primaryCtaHref || DEFAULT_PRIMARY_CTA_HREF
  const secondaryCtaLabel = data.secondaryCtaLabel || DEFAULT_SECONDARY_CTA_LABEL
  const secondaryCtaHref = data.secondaryCtaHref || DEFAULT_SECONDARY_CTA_HREF

  const resolvedStats = stats && stats.length > 0 ? stats : DEFAULT_STATS

  useGSAP(
    () => {
      gsap.from('[data-hero-animate]', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.15,
      })
    },
    {scope: container},
  )

  const bgUrl = backgroundImage?.asset
    ? urlForImage(backgroundImage).width(2400).quality(80).url()
    : undefined

  return (
    <section ref={container} className="relative flex min-h-screen flex-col overflow-hidden">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt={backgroundImage?.alt || ''}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}
      <div
        className="absolute inset-0 bg-linear-to-b from-black/70 via-black/45 to-black/65"
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-size-[72px_72px] mask-[radial-gradient(ellipse_at_center,black_25%,transparent_80%)]"
      />
      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-2 pt-28 pb-16 text-center md:items-start md:px-12 md:text-left">
        <h1
          data-hero-animate
          className="max-w-5xl text-balance font-heading text-3xl font-bold leading-tight tracking-tight text-white  md:text-6xl lg:text-7xl"
        >
          {renderHeadline(headline, headlineAccent)}
        </h1>
        {subheadline && (
          <p
            data-hero-animate
            className="mt-6 max-w-150 text-pretty font-body text-base text-silver/110 sm:text-lg"
          >
            {subheadline}
          </p>
        )}
        <div
          data-hero-animate
          className="mt-10 flex w-full items-center justify-center gap-3 md:w-auto md:justify-start md:gap-4"
        >
          <Link
            href={primaryCtaHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md bg-accent px-5 py-3.5 font-heading font-medium text-sm md:text-base text-black transition-colors hover:bg-accent-hover md:flex-none md:px-7"
          >
            {primaryCtaLabel}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          <Link
            href={secondaryCtaHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-md border border-white/15 bg-white/5 px-5 py-3.5 font-heading font-medium text-sm md:text-base text-white backdrop-blur-md transition-colors hover:border-white/25 hover:bg-white/10 md:flex-none md:px-7"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M8 5v14l11-7z" />
            </svg>
            {secondaryCtaLabel}
          </Link>
        </div>
        <div data-hero-animate className="mt-16 grid grid-cols-2 gap-4 md:grid-cols-4">
          {resolvedStats.map((stat, index) => (
            <div
              key={index}
              className="glass flex flex-col items-center justify-center rounded-lg px-8 py-6 text-center"
            >
              <span className="font-heading text-4xl font-bold text-accent">{stat.value}</span>
              <span className="mt-1 text-sm text-white">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
