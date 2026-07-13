'use client';

import { useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';

import {
  EQUIPMENT_OPTIONS,
  FRAME_COLORS,
  ROOF_TYPES,
  zadaszenieFormSchema,
  type ZadaszenieFormData,
  type ZadaszenieFormInput,
} from '@/app/lib/validations/zadaszenieForm';
import { submitZadaszenieForm } from '@/app/lib/actions/submitZadaszenieForm';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormFileDropzone } from './shared/FormFileDropzone';
import { FormInput } from './shared/FormInput';
import { FormNumberInput } from './shared/FormNumberInput';
import { FormSelect } from './shared/FormSelect';
import { FormTextarea } from './shared/FormTextarea';

const ROOF_TYPE_OPTIONS = ROOF_TYPES.map((value) => ({ value, label: value }));
const FRAME_COLOR_OPTIONS = FRAME_COLORS.map((value) => ({ value, label: value }));

export default function ZadaszenieForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ZadaszenieFormInput, unknown, ZadaszenieFormData>({
    resolver: zodResolver(zadaszenieFormSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      roofType: '',
      frameColor: '',
      equipTriangleSide: false,
      equipLedLighting: false,
      equipPolyWallFixedRight: false,
      equipPolyWallFixedLeft: false,
      equipGlasslessDoorsSlidingRight: false,
      equipGlasslessDoorsSlidingLeft: false,
      equipGlasslessDoorsSlidingFront: false,
      terraceBlinds: '',
      installationService: false,
      notes: '',
      name: '',
      phone: '',
      email: '',
      postalCode: '',
      consentRodo: false,
      consentMarketing: false,
    },
  });

  const onSubmit = async (data: ZadaszenieFormData) => {
    const formData = new FormData();
    formData.append('roofType', data.roofType);
    formData.append('frameColor', data.frameColor);
    formData.append('width', String(data.width));
    formData.append('depth', String(data.depth));
    for (const option of EQUIPMENT_OPTIONS) {
      formData.append(option.name, String(data[option.name]));
    }
    if (data.terraceBlinds) formData.append('terraceBlinds', data.terraceBlinds);
    formData.append('installationService', String(data.installationService));
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
    const result = await submitZadaszenieForm(formData);

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

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-6 py-16" noValidate>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
        {/* Left column: roof type, colour, dimensions, equipment, terrace blinds */}
        <div className="flex flex-col gap-6">
          <FormSelect
            label="Wybierz rodzaj zadaszenia"
            name="roofType"
            options={ROOF_TYPE_OPTIONS}
            register={register}
            error={errors.roofType}
            required
          />
          <FormSelect
            label="Kolor konstrukcji ALUM"
            name="frameColor"
            options={FRAME_COLOR_OPTIONS}
            register={register}
            error={errors.frameColor}
            required
          />
          <FormNumberInput
            label="Szerokość zadaszenia [m]"
            name="width"
            control={control}
            error={errors.width as FieldError | undefined}
            helperText="Podaj szerokość w metrach"
            placeholder="np. 3.0"
            step={0.1}
            min={0.5}
            required
          />
          <FormNumberInput
            label="Głębokość zadaszenia (wysięg) [m]"
            name="depth"
            control={control}
            error={errors.depth as FieldError | undefined}
            helperText="Podaj głębokość/wysięg w metrach"
            placeholder="np. 2.5"
            step={0.1}
            min={0.5}
            required
          />

          <div>
            <p className="mb-1 font-body text-sm font-medium text-white">Wyposażenie dodatkowe</p>
            <p className="mb-3 text-xs text-silver">Zaznacz opcje, które Cię interesują</p>
            <div className="flex flex-col gap-2">
              {EQUIPMENT_OPTIONS.map((option) => (
                <FormCheckbox
                  key={option.name}
                  label={option.label}
                  name={option.name}
                  control={control}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 border-t border-graphite pt-4">
            <FormTextarea
              label="Żaluzje tarasowe (opcjonalne)"
              name="terraceBlinds"
              register={register}
              error={errors.terraceBlinds}
              rows={2}
              placeholder="np. 250 x 220"
              helperText="Podaj wymiary otworu do zabudowy: szerokość x wysokość [cm]"
            />
          </div>
        </div>

        {/* Right column: contact, install service, notes, upload, consents, submit */}
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
          <FormCheckbox
            label="Usługa montażu"
            name="installationService"
            control={control}
            helperText="Zaznacz jeśli chcesz wycenić montaż wraz z zadaszeniem"
          />
          <FormTextarea
            label="Uwagi"
            name="notes"
            register={register}
            error={errors.notes}
            rows={4}
            helperText="Określ dodatkowe wymagania dotyczące zadaszenia: np. niestandardowe wymiary, specjalne wykończenia itp."
          />
          <FormFileDropzone
            label="Zdjęcie miejsca montażu (opcjonalne)"
            helperText="Dodaj zdjęcie miejsca montażu — pomoże nam lepiej przygotować wycenę."
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
