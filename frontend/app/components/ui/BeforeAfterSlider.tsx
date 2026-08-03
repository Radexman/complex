'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MoveHorizontal } from 'lucide-react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  beforeAlt: string;
  afterSrc: string;
  afterAlt: string;
  /** Shown as small pills in the top corners of each side. */
  beforeLabel?: string;
  afterLabel?: string;
  priority?: boolean;
}

/**
 * Before/after image comparison. Same idea as daisyUI's `diff` component (two
 * stacked images, one clipped by a movable divider) but built here rather than
 * pulling in the whole plugin: daisyUI would layer its own theme on top of this
 * project's Tailwind v4 tokens, and its CSS `resize` grip is awkward on touch.
 *
 * Pointer events cover mouse, touch and pen with one code path; the divider is a
 * real `role="slider"` so it also works from the keyboard.
 */
export default function BeforeAfterSlider({
  beforeSrc,
  beforeAlt,
  afterSrc,
  afterAlt,
  beforeLabel = 'Przed',
  afterLabel = 'Po',
  priority = false,
}: BeforeAfterSliderProps) {
  const container = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [dragging, setDragging] = useState(false);

  const setFromClientX = useCallback((clientX: number) => {
    const rect = container.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, ratio)));
  }, []);

  // Listeners live on the window while dragging so the pointer can leave the
  // image without the divider getting stuck mid-drag.
  useEffect(() => {
    if (!dragging) return;
    const onMove = (event: PointerEvent) => setFromClientX(event.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [dragging, setFromClientX]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const step = event.shiftKey ? 10 : 2;
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      setPosition((value) => Math.max(0, value - step));
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      setPosition((value) => Math.min(100, value + step));
    } else if (event.key === 'Home') {
      event.preventDefault();
      setPosition(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      setPosition(100);
    }
  };

  return (
    <div
      ref={container}
      onPointerDown={(event) => {
        // Clicking anywhere on the image jumps the divider there, then drags.
        setFromClientX(event.clientX);
        setDragging(true);
      }}
      className={`relative aspect-4/3 w-full touch-none overflow-hidden rounded-xl border border-graphite select-none md:aspect-video ${
        dragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      {/* „After" sits underneath, fully visible; „before" is clipped over it. */}
      <Image
        src={afterSrc}
        alt={afterAlt}
        fill
        sizes="(max-width: 768px) 100vw, 1024px"
        className="object-cover"
        priority={priority}
        draggable={false}
      />
      {/* The „before" layer keeps the container's full size and is revealed by a
          clip-path, so the image never squashes as the divider moves. */}
      <div
        className="absolute inset-0"
        style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}
      >
        <Image
          src={beforeSrc}
          alt={beforeAlt}
          fill
          sizes="(max-width: 768px) 100vw, 1024px"
          className="object-cover"
          priority={priority}
          draggable={false}
        />
      </div>

      <span className="pointer-events-none absolute top-3 left-3 rounded-full bg-black/70 px-3 py-1 font-body text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute top-3 right-3 rounded-full bg-accent/90 px-3 py-1 font-body text-xs font-semibold tracking-wide text-black uppercase">
        {afterLabel}
      </span>

      {/* Divider + handle */}
      <div
        role="slider"
        tabIndex={0}
        aria-label="Porównanie przed i po"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% zdjęcia „przed”`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.stopPropagation();
          setDragging(true);
        }}
        className="absolute inset-y-0 z-10 w-1 -translate-x-1/2 cursor-ew-resize bg-white/90 outline-none focus-visible:bg-accent"
        style={{ left: `${position}%` }}
      >
        <span className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-accent shadow-lg shadow-black/40">
          <MoveHorizontal size={20} className="text-black" aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
