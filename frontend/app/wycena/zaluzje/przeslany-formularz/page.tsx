import type { Metadata } from 'next';

import ThankYouPageContent from '@/app/components/forms/shared/ThankYouPageContent';

export const metadata: Metadata = {
  title: 'Zapytanie wysłane — Formularz Wyceny Żaluzji',
  // A confirmation page reached only after a submission; keeping it out of the
  // index also keeps crawler visits out of the conversion count.
  robots: { index: false, follow: false },
};

export default function WycenaZaluzjeThankYouPage() {
  return <ThankYouPageContent formType="zaluzje" formHref="/wycena/zaluzje" />;
}
