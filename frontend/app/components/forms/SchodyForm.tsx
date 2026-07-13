'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';

import {
  SCHODY_DIMENSIONS,
  schodyFormSchema,
  type SchodyFormData,
  type SchodyFormInput,
} from '@/app/lib/validations/schodyForm';
import { submitSchodyForm } from '@/app/lib/actions/submitSchodyForm';
import type { SchodyFormConfigQueryResult } from '@/sanity.types';
import { urlForImage } from '@/sanity/lib/utils';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormFileDropzone } from './shared/FormFileDropzone';
import { FormInput } from './shared/FormInput';
import { FormNumberInput } from './shared/FormNumberInput';
import { FormRadioGroup } from './shared/FormRadioGroup';
import { FormTextarea } from './shared/FormTextarea';

const INSULATION_OPTIONS = [
  { value: 'tak', label: 'Tak' },
  { value: 'nie', label: 'Nie' },
];

interface SchodyFormProps {
  diagram: NonNullable<SchodyFormConfigQueryResult>['diagram'];
}

export default function SchodyForm({ diagram }: SchodyFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<SchodyFormInput, unknown, SchodyFormData>({
    resolver: zodResolver(schodyFormSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      notes: '',
      name: '',
      phone: '',
      email: '',
      postalCode: '',
      consentRodo: false,
      consentMarketing: false,
    },
  });

  const onSubmit = async (data: SchodyFormData) => {
    const formData = new FormData();
    formData.append('isInsulated', data.isInsulated);
    for (const dim of SCHODY_DIMENSIONS) {
      formData.append(dim.name, String(data[dim.name]));
    }
    formData.append('postalCode', data.postalCode);
    formData.append('name', data.name);
    formData.append('phone', data.phone);
    formData.append('email', data.email);
    if (data.notes) formData.append('notes', data.notes);
    formData.append('consentRodo', String(data.consentRodo));
    formData.append('consentMarketing', String(data.consentMarketing));
    for (const photo of photos) {
      formData.append('photo', photo);
    }

    setSubmitError(null);
    const result = await submitSchodyForm(formData);

    if (result.success) {
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  if (isSuccess) {
    return (
      <div className="mx-auto max-w-xl px-6 py-24 text-center">
        <CheckCircle size={48} className="mx-auto text-accent" aria-hidden="true" />
        <h2 className="mt-4 font-heading text-2xl font-bold text-white">
          Dziękujemy za zapytanie!
        </h2>
        <p className="mt-2 font-body text-base text-silver">
          Skontaktujemy się z Tobą w ciągu 24 godzin roboczych na podany adres e-mail lub numer
          telefonu.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm text-accent transition-colors hover:text-accent-hover"
        >
          Wróć na stronę główną
        </Link>
      </div>
    );
  }

  const diagramUrl = diagram?.asset
    ? urlForImage(diagram)?.width(1200).fit('max').url()
    : undefined;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-6 py-16" noValidate>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
        {/* Left column: stair diagram, insulation question, dimensions */}
        <div className="flex flex-col">
          {diagramUrl && (
            <>
              <div className="overflow-hidden rounded-xl border border-graphite bg-bg-surface">
                <Image
                  src={diagramUrl}
                  alt={diagram?.alt || 'Schemat wymiarów schodów modułowych'}
                  width={600}
                  height={450}
                  className="h-auto w-full object-contain"
                />
              </div>
              <p className="mt-2 text-center text-xs text-silver">
                Schemat wymiarów schodów (zgodnie z rysunkiem)
              </p>
            </>
          )}

          <div className={diagramUrl ? 'mt-5 border-t border-graphite pt-5' : ''}>
            <p className="mb-3 font-body text-sm font-medium text-white">Dane do wyceny</p>
            <FormRadioGroup
              label="Czy budynek jest ocieplony? (w przypadku schodów zewnętrznych)"
              name="isInsulated"
              options={INSULATION_OPTIONS}
              control={control}
              error={errors.isInsulated}
              required
            />
          </div>

          <p className="mt-5 mb-1 font-body text-sm font-medium text-white">
            Wymiary [cm] <span className="text-accent">*</span>
          </p>
          <p className="mb-4 text-xs text-silver">Podaj wymiary zgodnie z rysunkiem powyżej</p>
          <div className="flex flex-col gap-3">
            {SCHODY_DIMENSIONS.map((dim) => (
              <FormNumberInput
                key={dim.name}
                label={dim.label}
                name={dim.name}
                control={control}
                error={errors[dim.name] as FieldError | undefined}
                step={1}
                min={1}
                required
              />
            ))}
          </div>
        </div>

        {/* Right column: contact, notes, upload, consents, submit */}
        <div className="flex flex-col gap-6">
          <FormInput
            label="Imię i nazwisko"
            name="name"
            register={register}
            error={errors.name}
            required
            autoComplete="name"
          />
          <FormInput
            label="Numer telefonu"
            name="phone"
            type="tel"
            inputMode="tel"
            register={register}
            error={errors.phone}
            required
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
          <FormTextarea
            label="Uwagi"
            name="notes"
            register={register}
            error={errors.notes}
            rows={4}
          />
          <FormFileDropzone
            label="Zdjęcie lub projekt techniczny (opcjonalne)"
            helperText="Zdjęcie miejsca, w którym mają znajdować się schody lub projekt techniczny."
            onFilesChange={setPhotos}
          />

          <div className="mt-2 border-t border-graphite pt-4">
            <FormCheckbox
              control={control}
              name="consentRodo"
              error={errors.consentRodo}
              label={
                <>
                  Zapoznałem/am się z treścią{' '}
                  <Link
                    href="/polityka-prywatnosci"
                    className="text-accent hover:text-accent-hover"
                  >
                    Polityki prywatności
                  </Link>{' '}
                  i wyrażam zgodę na przetwarzanie moich danych osobowych przez Complex sp. z o.o. w
                  celu przygotowania oferty.
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
            disabled={isSubmitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-4 text-base font-semibold text-black transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
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
            * Pola obowiązkowe. Oferta zostanie przesłana w ciągu 7 dni roboczych.
          </p>
          <p className="text-center text-xs text-silver">
            Usługi montażowe wykonujemy na terenie województw śląskiego i opolskiego.
          </p>
        </div>
      </div>
    </form>
  );
}
