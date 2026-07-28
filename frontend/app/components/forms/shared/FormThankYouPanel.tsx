'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getSubmittedEmail, type FormType } from '@/app/lib/formSubmissionSession';
import FormSuccessState, { type ProcessStepData } from './FormSuccessState';

export interface FormThankYouProps {
  formType: FormType;
  /** Where to send visitors who reach this page without submitting the form. */
  formHref: string;
  steps: ProcessStepData[];
}

/**
 * Body of a thank-you page. Client-only (mounted through `FormThankYou`, which
 * imports it with `ssr: false`) because the submitted e-mail lives in the
 * browser session — rendering it on the server would only produce a placeholder
 * to immediately replace.
 *
 * Confirms the visitor actually submitted the form in this session (see
 * `formSubmissionSession`) before rendering the confirmation. Anyone else — a
 * bookmark, a crawler, a shared link — is sent back to the form, so the pageview
 * never counts as a conversion.
 */
export default function FormThankYouPanel({ formType, formHref, steps }: FormThankYouProps) {
  const router = useRouter();
  // Read once, on mount: the record is written before the navigation that
  // brought us here, so it cannot arrive later.
  const [submittedEmail] = useState(() => getSubmittedEmail(formType));

  useEffect(() => {
    if (submittedEmail === null) router.replace(formHref);
  }, [submittedEmail, formHref, router]);

  if (submittedEmail === null) {
    // Reserve the panel's vertical space so the redirect isn't a jump.
    return <div className="min-h-[60vh]" aria-hidden="true" />;
  }

  return <FormSuccessState formType={formType} submittedEmail={submittedEmail} steps={steps} />;
}
