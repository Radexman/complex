import type { Metadata } from 'next';

import SchodyForm from '@/app/components/forms/SchodyForm';
import { schodyFormConfigQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';

export const metadata: Metadata = {
  title: 'Formularz Wyceny Schodów — Complex',
  description:
    'Wypełnij formularz wyceny schodów modułowych i otrzymaj bezpłatną ofertę w ciągu 24 godzin.',
};

export default async function WycenaSchodyPage() {
  const { data: config } = await sanityFetch({ query: schodyFormConfigQuery });

  return (
    <div className="bg-bg-deep">
      <section className="border-b border-graphite bg-bg-mid pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Formularze wycen
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            Formularz Wyceny Schodów
          </h1>
          <p className="mt-3 max-w-xl font-body text-base text-silver">
            Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z
            Tobą w ciągu 24 godzin roboczych.
          </p>
        </div>
      </section>

      <SchodyForm diagram={config?.diagram ?? null} />
    </div>
  );
}
