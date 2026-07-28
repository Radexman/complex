import type { Metadata } from 'next';

import ZadaszenieForm from '@/app/components/forms/ZadaszenieForm';

export const metadata: Metadata = {
  title: 'Formularz Wyceny Zadaszenia — Complex',
  description:
    'Wypełnij formularz wyceny zadaszenia aluminiowego i otrzymaj bezpłatną ofertę w ciągu 24 godzin.',
};

export default function WycenaZadaszeniePage() {
  return (
    <div className="bg-bg-deep">
      <section className="border-b border-graphite bg-bg-mid pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-xs font-semibold tracking-widest text-accent uppercase">
            Formularze wycen
          </p>
          <h1 className="mt-2 font-heading text-4xl font-bold text-white">
            Formularz Wyceny Zadaszenia
          </h1>
          <p className="mt-3 max-w-xl font-body text-base text-silver">
            Wypełnij poniższy formularz, a my przygotujemy bezpłatną wycenę i skontaktujemy się z
            Tobą w ciągu 24 godzin roboczych.
          </p>
        </div>
      </section>

      <ZadaszenieForm />
    </div>
  );
}
