import type { Metadata } from 'next';

import ZaluzjeForm from '@/app/components/forms/ZaluzjeForm';

export const metadata: Metadata = {
  title: 'Formularz Wyceny Żaluzji — Complex',
  description:
    'Wypełnij formularz wyceny żaluzji tarasowych i otrzymaj bezpłatną ofertę w ciągu 24 godzin.',
};

export default function WycenaZaluzjePage() {
  return (
    <div className="bg-bg-deep">
      <section className="border-b border-graphite bg-bg-mid pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Formularze wycen
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            Formularz Wyceny Żaluzji
          </h1>
          <p className="mt-3 max-w-xl font-body text-base text-silver">
            Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z
            Tobą w ciągu 24 godzin roboczych.
          </p>
        </div>
      </section>
      <ZaluzjeForm />
    </div>
  );
}
