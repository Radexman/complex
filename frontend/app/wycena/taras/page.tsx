import type { Metadata } from 'next';

import TarasForm from '@/app/components/forms/TarasForm';
import { tarasFormConfigQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import { buildSeoMetadata } from '@/app/lib/buildSeoMetadata';

export async function generateMetadata(): Promise<Metadata> {
  // Metadata should never contain stega
  const { data } = await sanityFetch({ query: tarasFormConfigQuery, stega: false });

  // The root layout appends the site name via its `title.template`.
  return buildSeoMetadata(data?.seo, {
    title: 'Formularz Wyceny Tarasu',
    description:
      'Wypełnij formularz wyceny tarasu i otrzymaj bezpłatną ofertę w ciągu 3 dni roboczych.',
  });
}

export default async function WycenaTarasPage() {
  const { data: config } = await sanityFetch({ query: tarasFormConfigQuery });
  const shapes = config?.shapes ?? [];

  return (
    <div className="bg-bg-deep">
      <section className="border-b border-graphite bg-bg-mid pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Formularze wycen
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            {config?.title || 'Formularz Wyceny Tarasu'}
          </h1>
          <p className="mt-3 max-w-xl font-body text-base text-silver">
            {config?.description ||
              'Wypełnij poniższy formularz, a przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 3 dni roboczych.'}
          </p>
        </div>
      </section>

      <TarasForm shapes={shapes} />
    </div>
  );
}
