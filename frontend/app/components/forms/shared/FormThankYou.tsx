'use client';

import dynamic from 'next/dynamic';

import type { FormThankYouProps } from './FormThankYouPanel';

// The panel's content depends on `sessionStorage`, so there is nothing useful to
// render on the server. Mounting it client-only keeps the markup honest instead
// of shipping a placeholder that hydration immediately replaces.
const FormThankYouPanel = dynamic(() => import('./FormThankYouPanel'), {
  ssr: false,
  loading: () => <div className="min-h-[60vh]" aria-hidden="true" />,
});

export default function FormThankYou(props: FormThankYouProps) {
  return <FormThankYouPanel {...props} />;
}
