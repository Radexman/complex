'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type FieldError } from 'react-hook-form';
import { AlertCircle, Loader2, Send } from 'lucide-react';

import {
  contactFormSchema,
  type ContactFormData,
  type ContactFormInput,
} from '@/app/lib/validations/contactForm';
import { submitContactForm } from '@/app/lib/actions/submitContactForm';
import { markFormSubmitted } from '@/app/lib/formSubmissionSession';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormInput } from './shared/FormInput';
import { FormTextarea } from './shared/FormTextarea';

/**
 * General contact form. Deliberately has no page of its own — it is rendered
 * inside `ContactFormDialog` from the navbar, so it stays reachable from every
 * page without adding a route. On success it navigates to `/dziekujemy-kontakt`
 * (a distinct, GA-trackable URL) instead of rendering a success state inline —
 * `onSuccess` lets the dialog close itself during that navigation.
 */
export default function ContactForm({ onSuccess }: { onSuccess?: () => void } = {}) {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormInput, unknown, ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      message: '',
      consentRodo: false,
      consentMarketing: false,
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    const formData = new FormData();
    formData.append('name', data.name ?? '');
    formData.append('phone', data.phone ?? '');
    formData.append('email', data.email);
    formData.append('message', data.message);
    formData.append('consentRodo', String(data.consentRodo));
    formData.append('consentMarketing', String(data.consentMarketing));

    setSubmitError(null);
    const result = await submitContactForm(formData);

    if (result.success) {
      // Recorded before navigating so the thank-you page can confirm this
      // visitor really submitted, and echo their address back.
      markFormSubmitted('kontakt', data.email);
      setIsRedirecting(true);
      onSuccess?.();
      router.push('/dziekujemy-kontakt');
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
      {/* Name and phone are optional — the `preprocess` in the schema makes their
          RHF input type `unknown`, hence the error cast (same as DimensionInputs). */}
      <FormInput
        label="Imię i nazwisko (opcjonalnie)"
        name="name"
        register={register}
        error={errors.name as FieldError | undefined}
        autoComplete="name"
      />
      <FormInput
        label="Numer telefonu (opcjonalnie)"
        name="phone"
        type="tel"
        inputMode="tel"
        register={register}
        error={errors.phone as FieldError | undefined}
        autoComplete="tel"
      />
      <FormInput
        label="Adres e-mail"
        name="email"
        type="email"
        inputMode="email"
        register={register}
        error={errors.email}
        required
        autoComplete="email"
      />
      <FormTextarea
        label="Wiadomość"
        name="message"
        register={register}
        error={errors.message}
        rows={5}
        required
      />

      <div className="border-t border-graphite pt-4">
        <FormCheckbox
          control={control}
          name="consentRodo"
          error={errors.consentRodo}
          label={
            <>
              Zapoznałem/am się z treścią{' '}
              <Link href="/polityka-prywatnosci" className="text-accent hover:text-accent-hover">
                Polityki prywatności
              </Link>{' '}
              i wyrażam zgodę na przetwarzanie moich danych osobowych przez Complex sp. z o.o. w celu
              udzielenia odpowiedzi na moją wiadomość.
            </>
          }
        />
      </div>
      <FormCheckbox
        control={control}
        name="consentMarketing"
        label="Wyrażam zgodę na przetwarzanie moich danych w celach marketingowych i przesyłanie ofert drogą e-mailową lub telefoniczną."
      />

      {submitError && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
          <p>{submitError}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || isRedirecting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-base font-semibold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
      >
        {isSubmitting || isRedirecting ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Wysyłanie…
          </>
        ) : (
          <>
            Wyślij wiadomość <Send size={18} />
          </>
        )}
      </button>
      <p className="text-center text-xs text-silver">
        * Pola obowiązkowe. Odpowiadamy najszybciej jak to możliwe.
      </p>
    </form>
  );
}
