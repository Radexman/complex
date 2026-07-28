import { processTimelineQuery } from '@/sanity/lib/queries';
import { sanityFetch } from '@/sanity/lib/live';
import type { FormType } from '@/app/lib/formSubmissionSession';
import FormThankYou from './FormThankYou';

interface ThankYouPageContentProps {
  formType: FormType;
  /** The form this page confirms — visitors who didn't submit are sent back here. */
  formHref: string;
}

/**
 * Shared body of the four `/wycena/[type]/przeslany-formularz` pages: fetches the
 * process timeline the confirmation recaps and hands it to the client-side guard.
 */
export default async function ThankYouPageContent({
  formType,
  formHref,
}: ThankYouPageContentProps) {
  const { data: processTimeline } = await sanityFetch({ query: processTimelineQuery });

  return (
    <div className="bg-bg-deep pt-28">
      <FormThankYou formType={formType} formHref={formHref} steps={processTimeline?.steps ?? []} />
    </div>
  );
}
