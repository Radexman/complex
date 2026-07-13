'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { Checkbox } from '@ark-ui/react/checkbox';
import { AlertCircle, Check, CheckCircle, Loader2, Send } from 'lucide-react';
import { stegaClean } from 'next-sanity';

import {
  ALL_SIDES,
  REQUIRED_SIDES,
  tarasFormSchema,
  type TarasFormData,
  type TarasFormInput,
} from '@/app/lib/validations/tarasForm';
import { submitTarasForm } from '@/app/lib/actions/submitTarasForm';
import { FormCheckbox } from './shared/FormCheckbox';
import { FormFileDropzone } from './shared/FormFileDropzone';
import { FormInput } from './shared/FormInput';
import { FormSelect } from './shared/FormSelect';
import { FormTextarea } from './shared/FormTextarea';
import { DimensionInputs } from './DimensionInputs';
import { ShapeSelector, type TarasShapeOption } from './ShapeSelector';

const MATERIAL_OPTIONS = [
  'Kompozyt Komorowy',
  'Kompozyt Pełny (Premium)',
  'Płyty Gresowe gr. 2 cm',
  'Thermo Jesion (Termojesion)',
  'Thermo Sosna (Thermososna)',
  'Świerk',
  'Bangkirai',
  'Angelim Amargoso',
].map((value) => ({ value, label: value }));

interface TarasFormProps {
  shapes: TarasShapeOption[];
}

export default function TarasForm({ shapes }: TarasFormProps) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TarasFormInput, unknown, TarasFormData>({
    resolver: zodResolver(tarasFormSchema),
    mode: 'onBlur',
    shouldUnregister: true,
    defaultValues: {
      shape: '1',
      buildingPosition: [],
      requiredSides: [],
      material: '',
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

  const selectedShape = useWatch({ control, name: 'shape' });

  // Sides for the currently selected shape — driven by the CMS-defined `sides`,
  // falling back to the canonical REQUIRED_SIDES so inputs still render if the
  // CMS data is sparse.
  const activeSides = useMemo(() => {
    if (!selectedShape) return [];
    const cmsShape = shapes.find((shape) => stegaClean(shape.shapeNumber) === selectedShape);
    const cmsSides = cmsShape?.sides?.map((side) => stegaClean(side)).filter(Boolean);
    return cmsSides && cmsSides.length > 0 ? cmsSides : (REQUIRED_SIDES[selectedShape] ?? []);
  }, [selectedShape, shapes]);

  // Keep the form's `requiredSides` in sync with the selected shape so both the
  // client resolver and the server action validate exactly the rendered inputs.
  useEffect(() => {
    setValue('requiredSides', activeSides);
  }, [activeSides, setValue]);

  const onSubmit = async (data: TarasFormData) => {
    const formData = new FormData();
    formData.append('shape', data.shape);
    for (const side of ALL_SIDES) {
      const value = data[`side${side}` as keyof TarasFormData];
      if (value != null && value !== '') {
        formData.append(`side${side}`, String(value));
      }
    }
    for (const side of activeSides) {
      formData.append('requiredSides', side);
    }
    for (const position of data.buildingPosition) {
      formData.append('buildingPosition', position);
    }
    formData.append('material', data.material);
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
    const result = await submitTarasForm(formData);

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
        <h2 className="mt-4 font-heading text-2xl font-bold text-white">Dziękujemy za zapytanie!</h2>
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
        {/* Left column: shape, dimensions, building position */}
        <div className="flex flex-col gap-8">
          <div>
            <h2 className="mb-3 font-heading text-lg font-semibold text-white">
              Kształt tarasu <span className="text-accent">*</span>
            </h2>
            <Controller
              control={control}
              name="shape"
              render={({ field }) => (
                <ShapeSelector
                  shapes={shapes}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  error={errors.shape?.message}
                />
              )}
            />
          </div>

          {activeSides.length > 0 && (
            <div>
              <h2 className="mb-3 font-heading text-lg font-semibold text-white">
                Wymiary tarasu <span className="text-accent">*</span>
              </h2>
              <DimensionInputs
                key={selectedShape}
                sides={activeSides}
                control={control}
                errors={errors}
              />
            </div>
          )}

          {activeSides.length > 0 && (
            <div>
              <p className="mb-2 font-body text-sm font-medium text-white">
                Określ położenie budynku względem tarasu <span className="text-accent">*</span>
              </p>
              <p className="mb-3 text-xs text-silver">
                Zaznacz boki, przy których przylega ściana budynku
              </p>
              <Controller
                control={control}
                name="buildingPosition"
                render={({ field }) => (
                  <div className="flex flex-wrap gap-2">
                    {activeSides.map((side) => (
                      <Checkbox.Root
                        key={side}
                        checked={Boolean(field.value?.includes(side))}
                        onCheckedChange={(details) => {
                          const current = field.value ?? [];
                          field.onChange(
                            details.checked === true
                              ? [...current, side]
                              : current.filter((value) => value !== side),
                          );
                        }}
                        className="flex cursor-pointer items-center gap-2 rounded-lg border border-graphite bg-bg-surface px-3 py-2 transition-colors data-[state=checked]:border-accent data-[state=checked]:bg-accent/5"
                      >
                        <Checkbox.Control className="flex h-4 w-4 items-center justify-center rounded border border-graphite transition-all data-[state=checked]:border-accent data-[state=checked]:bg-accent">
                          <Checkbox.Indicator>
                            <Check size={10} className="text-black" strokeWidth={3} />
                          </Checkbox.Indicator>
                        </Checkbox.Control>
                        <Checkbox.Label className="font-body text-sm text-white">
                          {side}
                        </Checkbox.Label>
                        <Checkbox.HiddenInput />
                      </Checkbox.Root>
                    ))}
                  </div>
                )}
              />
              {errors.buildingPosition && (
                <p className="mt-1 text-xs text-red-400">{errors.buildingPosition.message}</p>
              )}
            </div>
          )}
        </div>

        {/* Right column: material, contact, notes, upload, consents, submit */}
        <div className="flex flex-col gap-6">
          <FormSelect
            label="Wybierz materiał tarasowy"
            name="material"
            options={MATERIAL_OPTIONS}
            register={register}
            error={errors.material}
            required
          />
          <FormCheckbox
            label="Usługa montażu"
            name="installationService"
            control={control}
            helperText="Zaznacz jeśli chcesz wycenić montaż wraz z materiałem"
          />
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
            helperText="Określ dodatkowe wymagania: kolor, producent, nazwa produktu itp."
          />
          <FormFileDropzone
            label="Zdjęcie miejsca montażu (opcjonalne)"
            helperText="Dodaj zdjęcie ogrodu lub miejsca, gdzie ma powstać taras. Ułatwi nam przygotowanie wyceny."
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
