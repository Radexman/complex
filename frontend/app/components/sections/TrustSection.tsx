'use client'

import {useEffect, useRef, useState, type RefObject} from 'react'
import {gsap} from 'gsap'
import {ScrollTrigger} from 'gsap/ScrollTrigger'
import {useGSAP} from '@gsap/react'
import {useCountUp} from 'react-countup'
import {stegaClean} from 'next-sanity'
import {
  Award,
  CheckCircle,
  Clock,
  MapPin,
  ShieldCheck,
  Star,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import type {TrustSection as TrustSectionType} from '@/sanity.types'

gsap.registerPlugin(ScrollTrigger)

const ICON_MAP: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  clock: Clock,
  award: Award,
  users: Users,
  star: Star,
  check: CheckCircle,
  tool: Wrench,
  map: MapPin,
}

type TrustStat = NonNullable<TrustSectionType['stats']>[number]

function parseStatValue(
  raw?: string,
): {prefix: string; end: number; decimals: number; suffix: string} | null {
  const value = stegaClean(raw ?? '').trim()
  const match = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(\D*)$/)
  if (!match) return null
  const [, prefix, numStr, suffix] = match
  const decimals = /[.,]/.test(numStr) ? numStr.split(/[.,]/)[1].length : 0
  const end = parseFloat(numStr.replace(',', '.'))
  return {prefix, end, decimals, suffix}
}

function StatValue({raw, triggered}: {raw?: string; triggered: boolean}) {
  const parsed = parseStatValue(raw)
  const countUpRef = useRef<HTMLSpanElement>(null)
  const {start} = useCountUp({
    ref: countUpRef as RefObject<HTMLElement>,
    start: 0,
    end: parsed?.end ?? 0,
    duration: 2.6,
    decimals: parsed?.decimals ?? 0,
    decimal: ',',
    prefix: parsed?.prefix ?? '',
    suffix: parsed?.suffix ?? '',
    startOnMount: false,
  })

  useEffect(() => {
    if (triggered && parsed) start()
  }, [triggered])

  if (!parsed) {
    return <>{stegaClean(raw ?? '')}</>
  }

  return <span ref={countUpRef} />
}

const DEFAULT_EYEBROW = 'Dlaczego Complex?'
const DEFAULT_HEADLINE = 'Zaufali nam właściciele domów w całym regionie'
const DEFAULT_SUBHEADLINE =
  'Nasze zaangażowanie w jakość sprawiło, że staliśmy się pierwszym wyborem przy realizacji nowoczesnych przestrzeni zewnętrznych.'

const DEFAULT_STATS: TrustStat[] = [
  {
    _key: 'default-1',
    _type: 'trustStat',
    icon: 'shield',
    value: '1200+',
    label: 'Zrealizowanych montaży',
    description: 'Pergole i zadaszenia zamontowane na terenie Śląska i Opolszczyzny',
  },
  {
    _key: 'default-2',
    _type: 'trustStat',
    icon: 'clock',
    value: '15',
    label: 'Lat doświadczenia',
    description: 'Pionierskie rozwiązania w zakresie przestrzeni zewnętrznych',
  },
  {
    _key: 'default-3',
    _type: 'trustStat',
    icon: 'award',
    value: '98%',
    label: 'Zadowolonych klientów',
    description: 'Na podstawie zweryfikowanych opinii klientów',
  },
  {
    _key: 'default-4',
    _type: 'trustStat',
    icon: 'users',
    value: '50+',
    label: 'Opcji projektowych',
    description: 'Konstrukcje, materiały i wykończenia dobrane do każdego projektu',
  },
]

const DEFAULT_BADGES = [
  '10 lat gwarancji',
  'Bezpłatna konsultacja',
  'Materiały premium',
  'Realizacje na terenie Śląska i Opolszczyzny',
]

export default function TrustSection({data}: {data?: TrustSectionType}) {
  const container = useRef<HTMLElement>(null)
  const [countersTriggered, setCountersTriggered] = useState(false)

  const eyebrow = data?.eyebrow || DEFAULT_EYEBROW
  const headline = data?.headline || DEFAULT_HEADLINE
  const subheadline = data?.subheadline || DEFAULT_SUBHEADLINE
  const stats = data?.stats && data.stats.length > 0 ? data.stats : DEFAULT_STATS
  const badges = data?.badges && data.badges.length > 0 ? data.badges : DEFAULT_BADGES

  useGSAP(
    () => {
      gsap.set('[data-trust-header]', {y: 30, opacity: 0})
      gsap.set('[data-trust-card]', {y: 40, opacity: 0})
      gsap.set('[data-trust-badges]', {y: 20, opacity: 0})

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container.current,
          start: 'top 80%',
          toggleActions: 'play none none none',
        },
      })

      tl.to('[data-trust-header]', {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power3.out',
        stagger: 0.1,
      })
        .to(
          '[data-trust-card]',
          {y: 0, opacity: 1, duration: 0.6, ease: 'power3.out', stagger: 0.1},
          '-=0.4',
        )
        .add(() => setCountersTriggered(true), '<')
        .to('[data-trust-badges]', {y: 0, opacity: 1, duration: 0.5, ease: 'power3.out'}, '-=0.2')
    },
    {scope: container},
  )

  return (
    <section ref={container} className="section-padding relative overflow-hidden bg-bg-mid">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 -top-40 h-150 w-150 rounded-full bg-[radial-gradient(circle,rgba(111,207,58,0.08),transparent_70%)] blur-2xl"
      />
      <div className="relative mx-auto max-w-7xl px-6 md:px-12">
        <div className="mx-auto max-w-4xl text-center">
          <p
            data-trust-header
            className="text-xs font-semibold uppercase tracking-widest text-accent"
          >
            {eyebrow}
          </p>
          <h2
            data-trust-header
            className="mt-4 font-heading text-4xl font-bold text-white md:text-5xl"
          >
            {headline}
          </h2>
          <p
            data-trust-header
            className="mx-auto mt-4 max-w-2xl text-center font-body text-base text-silver"
          >
            {subheadline}
          </p>
        </div>
        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = ICON_MAP[stegaClean(stat.icon)] ?? ShieldCheck
            return (
              <div
                key={stat._key}
                data-trust-card
                className="group rounded-xl border border-graphite border-b-2 bg-bg-surface p-6 transition-all duration-300 hover:border-b-accent"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 p-2 transition-colors duration-300 group-hover:bg-accent/20">
                  <Icon
                    className="text-accent transition-all duration-300 group-hover:brightness-125"
                    size={20}
                    aria-hidden="true"
                  />
                </div>
                <p className="mt-4 font-heading text-5xl font-bold text-white">
                  <StatValue raw={stat.value} triggered={countersTriggered} />
                </p>
                <p className="mt-2 font-body text-sm font-semibold text-white">{stat.label}</p>
                {stat.description && (
                  <p className="mt-1 font-body text-sm text-silver">{stat.description}</p>
                )}
              </div>
            )
          })}
        </div>
        <div data-trust-badges className="mt-12 flex flex-wrap justify-center gap-6">
          {badges.map((badge, index) => (
            <span key={index} className="flex items-center text-sm text-silver">
              <span
                className="mr-2 inline-block h-2 w-2 rounded-full bg-accent"
                aria-hidden="true"
              />
              {badge}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
