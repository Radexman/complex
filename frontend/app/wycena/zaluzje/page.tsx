import type { Metadata } from 'next';

import ZaluzjeForm from '@/app/components/forms/ZaluzjeForm';
import { zaluzjeFormConfigQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';

export const metadata: Metadata = {
  title: 'Formularz Wyceny Żaluzji — Complex',
  description:
    'Wypełnij formularz wyceny żaluzji tarasowych i otrzymaj bezpłatną ofertę w ciągu 3 dni roboczych.',
};

export default async function WycenaZaluzjePage() {
  const { data: config } = await sanityFetch({ query: zaluzjeFormConfigQuery });

  return (
    <div className="bg-bg-deep">
      <section className="border-b border-graphite bg-bg-mid pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Formularze wycen
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            {config?.title || 'Formularz Wyceny Żaluzji'}
          </h1>
          <p className="mt-3 max-w-xl font-body text-base text-silver">
            {config?.description ||
              'Wypełnij poniższy formularz, a przygotujemy bezpłatną wycenę i skontaktujemy się z Tobą w ciągu 3 dni roboczych.'}
          </p>
        </div>
      </section>
      <ZaluzjeForm />
    </div>
  );
}
