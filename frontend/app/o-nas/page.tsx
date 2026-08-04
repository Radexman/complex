import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { aboutPageQuery, processTimelineQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import AboutHero from '@/app/components/about/AboutHero';
import AboutStory from '@/app/components/about/AboutStory';
import AboutValues from '@/app/components/about/AboutValues';
import AboutCta from '@/app/components/about/AboutCta';
import ProcessTimeline from '@/app/components/sections/ProcessTimeline';

export const metadata: Metadata = {
  // The root layout appends the site name via its `title.template`.
  title: 'O nas',
  description:
    'Poznaj Complex sp. z o.o. — firmę z wieloletnim doświadczeniem w realizacji tarasów, zadaszeń i schodów modułowych na terenie Śląska i Opolszczyzny.',
};

export default async function AboutPage() {
  const [{ data: page }, { data: processTimeline }] = await Promise.all([
    sanityFetch({ query: aboutPageQuery }),
    sanityFetch({ query: processTimelineQuery }),
  ]);

  if (!page) notFound();

  return (
    <div>
      <AboutHero heroHeadline={page.heroHeadline} heroSubheadline={page.heroSubheadline} />
      <AboutStory
        storyEyebrow={page.storyEyebrow}
        storyHeadline={page.storyHeadline}
        storyBody={page.storyBody}
        storyImage={page.storyImage}
        storyStats={page.storyStats}
      />
      <AboutValues
        valuesEyebrow={page.valuesEyebrow}
        valuesHeadline={page.valuesHeadline}
        values={page.values}
      />
      {processTimeline && <ProcessTimeline data={processTimeline} />}
      <AboutCta />
    </div>
  );
}
