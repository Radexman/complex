'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import type { FieldError } from 'react-hook-form';
import { AlertCircle, Loader2, Send } from 'lucide-react';

import {
  CANOPY_TYPES,
  EQUIPMENT_OPTIONS,
  FRAME_COLORS,
  ROOF_TYPES,
  zadaszenieFormSchema,
  type ZadaszenieFormData,
  type ZadaszenieFormInput,
} from '@/app/lib/validations/zadaszenieForm';
import { submitZadaszenieForm } from '@/app/lib/actions/submitZadaszenieForm';
import { markFormSubmitted } from '@/app/lib/formSubmissionSession';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormFileDropzone } from './shared/FormFileDropzone';
import { FormInput } from './shared/FormInput';
import { FormNumberInput } from './shared/FormNumberInput';
import { FormSelect } from './shared/FormSelect';
import { FormTextarea } from './shared/FormTextarea';

const CANOPY_TYPE_OPTIONS = CANOPY_TYPES.map((value) => ({ value, label: value }));
const ROOF_TYPE_OPTIONS = ROOF_TYPES.map((value) => ({ value, label: value }));
const FRAME_COLOR_OPTIONS = FRAME_COLORS.map((value) => ({ value, label: value }));

export default function ZadaszenieForm() {
  const router = useRouter();
  const [isRedirecting, setIsRedirecting] = useState(false);
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
      canopyType: '',
      roofType: '',
      frameColor: '',
      equipWedgePoly: false,
      equipWedgeGlass: false,
      equipLedLighting: false,
      equipPolyWallSide1: false,
      equipPolyWallSide2: false,
      equipPolyWallFront: false,
      equipFramelessDoorsSide1: false,
      equipFramelessDoorsSide2: false,
      equipFramelessDoorsFront: false,
      equipFramedDoorsSide1: false,
      equipFramedDoorsSide2: false,
      equipFramedDoorsFront: false,
      terraceBlinds: '',
      installationService: false,
      notes: '',
      name: '',
      phone: '',
      email: '',
      postalCode: '',
      consentRodo: false,
    },
  });

  const onSubmit = async (data: ZadaszenieFormData) => {
    const formData = new FormData();
    formData.append('canopyType', data.canopyType);
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
    formData.append('name', data.name ?? '');
    formData.append('phone', data.phone ?? '');
    formData.append('email', data.email);
    if (data.notes) formData.append('notes', data.notes);
    formData.append('consentRodo', String(data.consentRodo));
    for (const photo of photos) {
      formData.append('photo', photo);
    }

    setSubmitError(null);
    const result = await submitZadaszenieForm(formData);

    if (result.success) {
      // Recorded before navigating so the thank-you page can confirm this
      // visitor really submitted, and echo their address back.
      markFormSubmitted('zadaszenie', data.email);
      setIsRedirecting(true);
      router.push('/wycena/zadaszenie/przeslany-formularz');
    } else if (result.error) {
      setSubmitError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-6xl px-6 py-16" noValidate>
      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:items-start">
        {/* Left column: roof type, colour, dimensions, equipment, terrace blinds */}
        <div className="flex flex-col gap-6">
          <FormSelect
            label="Wybierz rodzaj zadaszenia"
            name="canopyType"
            options={CANOPY_TYPE_OPTIONS}
            register={register}
            error={errors.canopyType}
            required
          />
          <FormSelect
            label="Wybierz rodzaj dachu"
            name="roofType"
            options={ROOF_TYPE_OPTIONS}
            register={register}
            error={errors.roofType}
            required
          />
          <FormSelect
            label="Kolor konstrukcji aluminiowej"
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
            placeholder="np. 2.5"
            step={0.1}
            min={0.5}
            max={6}
            required
          />

          <div>
            <p className="mb-3 font-body text-sm font-medium text-white">Wyposażenie dodatkowe</p>
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
              label="Żaluzje tarasowe"
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
            helperText="Zaznacz jeśli chcesz wycenić montaż wraz z zadaszeniem"
          />
          <FormTextarea
            label="Uwagi"
            name="notes"
            register={register}
            error={errors.notes}
            rows={4}
          />
          <FormFileDropzone
            label="Zdjęcie miejsca montażu"
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
