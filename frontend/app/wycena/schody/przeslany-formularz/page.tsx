import type { Metadata } from 'next';

import ThankYouPageContent from '@/app/components/forms/shared/ThankYouPageContent';

export const metadata: Metadata = {
  title: 'Zapytanie wysłane — Formularz Wyceny Schodów',
  // A confirmation page reached only after a submission; keeping it out of the
  // index also keeps crawler visits out of the conversion count.
  robots: { index: false, follow: false },
};

export default function WycenaSchodyThankYouPage() {
  return <ThankYouPageContent formType="schody" formHref="/wycena/schody" />;
}
