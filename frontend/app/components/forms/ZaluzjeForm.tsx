'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { AlertCircle, Info, Loader2, Send } from 'lucide-react';

import {
  zaluzjeFormSchema,
  type ZaluzjeFormData,
  type ZaluzjeFormInput,
} from '@/app/lib/validations/zaluzjeForm';
import { submitZaluzjeForm } from '@/app/lib/actions/submitZaluzjeForm';
import { markFormSubmitted } from '@/app/lib/formSubmissionSession';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormFileDropzone } from './shared/FormFileDropzone';
import { FormInput } from './shared/FormInput';
import { FormNumberInput } from './shared/FormNumberInput';
import { FormTextarea } from './shared/FormTextarea';

export default function ZaluzjeForm() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ZaluzjeFormInput, unknown, ZaluzjeFormData>({
    resolver: zodResolver(zaluzjeFormSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      installationService: false,
      notes: '',
      name: '',
      phone: '',
      email: '',
      postalCode: '',
      consentRodo: false,
    },
  });

  const onSubmit = async (data: ZaluzjeFormData) => {
    const formData = new FormData();
    formData.append('openingHeight', String(data.openingHeight));
    formData.append('openingWidth', String(data.openingWidth));
    formData.append('installationService', String(data.installationService));
    formData.append('postalCode', data.postalCode);
    formData.append('name', data.name ?? '');
    formData.append('phone', data.phone ?? '');
    formData.append('email', data.email);
    if (data.notes) formData.append('notes', data.notes);
    formData.append('consentRodo', String(data.consentRodo));
    for (const photo of photos) {
      formData.append('photo', photo);
    }

    setSubmitError(null);
    const result = await submitZaluzjeForm(formData);

    if (result.success) {
      // Recorded before navigating so the thank-you page can confirm this
      // visitor really submitted, and echo their address back.
      markFormSubmitted('zaluzje', data.email);
      setIsRedirecting(true);
      router.push('/wycena/zaluzje/przeslany-formularz');
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-6 py-16" noValidate>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
        {/* Left column: opening dimensions + measuring guide */}
        <div className="flex flex-col">
          <p className="mb-1 font-body text-sm font-medium text-white">
            Podaj wymiary otworu do zabudowy <span className="text-accent">*</span>
          </p>
          <p className="mb-4 text-xs text-silver">
            Podaj wymiary otworu okiennego lub drzwiowego w centymetrach
          </p>
          <div className="flex flex-col gap-6 md:mt-10 mt-0">
            <FormNumberInput
              label="Wysokość [cm]"
              name="openingHeight"
              control={control}
              error={errors.openingHeight as FieldError | undefined}
              placeholder="np. 220"
              step={1}
              min={1}
              required
            />
            <FormNumberInput
              label="Szerokość [cm]"
              name="openingWidth"
              control={control}
              error={errors.openingWidth as FieldError | undefined}
              placeholder="np. 250"
              step={1}
              min={1}
              required
            />
          </div>
          <div className="glass mt-6 rounded-xl border border-graphite p-5">
            <h3 className="mb-2 flex items-center gap-2 font-heading text-sm font-semibold text-white">
              <Info size={18} className="text-accent" aria-hidden="true" />
              Jak mierzyć otwór?
            </h3>
            <p className="font-body text-xs leading-relaxed text-silver">
              Zmierz szerokość i wysokość otworu okiennego lub drzwiowego, w którym ma być
              zamontowana żaluzja. Pomiar wykonaj wewnątrz ościeżnicy.
            </p>
          </div>
        </div>

        {/* Right column: contact, install service, notes, upload, consents, submit */}
        <div className="flex flex-col gap-6">
          {/* Name and phone are optional — the `preprocess` in the schema makes their
              RHF input type `unknown`, hence the error cast. */}
          <FormInput
            label="Imię i nazwisko"
            name="name"
            register={register}
            error={errors.name as FieldError | undefined}
            autoComplete="name"
          />
          <FormInput
            label="Numer telefonu"
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
          <FormInput
            label="Kod pocztowy"
            name="postalCode"
            placeholder="00-000"
            register={register}
            error={errors.postalCode}
            required
            autoComplete="postal-code"
          />
          <FormCheckbox
            label="Usługa montażu"
            name="installationService"
            control={control}
            helperText="Zaznacz jeśli chcesz wycenić montaż wraz z żaluzjami"
          />
          <FormTextarea
            label="Uwagi"
            name="notes"
            register={register}
            error={errors.notes}
            rows={4}
            helperText="Określ dodatkowe wymagania: kolor, rodzaj sterowania (ręczne/elektryczne), ilość sztuk itp."
          />
          <FormFileDropzone
            label="Zdjęcie miejsca montażu"
            helperText="Dodaj zdjęcie okna lub miejsca montażu — pomoże nam przygotować dokładną wycenę."
            onFilesChange={setPhotos}
          />

          <div className="mt-2 border-t border-graphite pt-4">
            <FormCheckbox
              control={control}
              name="consentRodo"
              error={errors.consentRodo}
              label={
                <>
                  Zapoznałem(-am) się z{' '}
                  <Link
                    href="/polityka-prywatnosci"
                    className="text-accent hover:text-accent-hover"
                  >
                    Polityką prywatności
                  </Link>{' '}
                  oraz wyrażam zgodę na przetwarzanie moich danych osobowych w celu przygotowania
                  wyceny i kontaktu w sprawie przesłanego zapytania.{' '}
                  <span className="text-accent">*</span>
                </>
              }
            />
          </div>

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
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting || isRedirecting ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Wysyłanie…
              </>
            ) : (
              <>
                Wyślij zapytanie <Send size={18} />
              </>
            )}
          </button>
          <p className="text-center text-xs text-silver">
            * Pola obowiązkowe. Oferta zostanie przesłana w ciągu 3 dni roboczych.
          </p>
          <p className="text-center text-xs text-silver">
            Usługi montażowe wykonujemy na wybranych obszarach województw śląskiego i opolskiego.
          </p>
        </div>
      </div>
    </form>
  );
}
