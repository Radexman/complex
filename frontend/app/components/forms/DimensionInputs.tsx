'use client';

import { useRef } from 'react';
import { gsap } from 'gsap';
import { useGSAP } from '@gsap/react';
import type { Control, FieldError, FieldErrors, Path } from 'react-hook-form';

import { FormNumberInput } from './shared/FormNumberInput';
import type { TarasFormInput } from '@/app/lib/validations/tarasForm';

interface DimensionInputsProps {
  sides: string[];
  control: Control<TarasFormInput>;
  errors: FieldErrors<TarasFormInput>;
}

export function DimensionInputs({ sides, control, errors }: DimensionInputsProps) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      gsap.fromTo(
        container.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' },
      );
    },
    { scope: container },
  );

  return (
    <div ref={container} className="grid grid-cols-2 gap-3">
      {sides.map((side) => {
        const name = `side${side}` as Path<TarasFormInput>;
        return (
          <FormNumberInput
            key={side}
            label={`Długość boku ${side} [m]`}
            name={name}
            control={control}
            error={errors[name as keyof typeof errors] as FieldError | undefined}
            step={0.01}
            min={0}
            placeholder="np. 3.5"
          />
        );
      })}
    </div>
  );
}
