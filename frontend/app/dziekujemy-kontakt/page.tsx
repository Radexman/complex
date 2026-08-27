import type { Metadata } from 'next';

import ThankYouPageContent from '@/app/components/forms/shared/ThankYouPageContent';

export const metadata: Metadata = {
  title: 'Wiadomość wysłana — Complex',
  // A confirmation page reached only after a submission; keeping it out of the
  // index also keeps crawler visits out of the conversion count.
  robots: { index: false, follow: false },
};

export default function DziekujemyKontaktPage() {
  return <ThankYouPageContent formType="kontakt" formHref="/" />;
}
