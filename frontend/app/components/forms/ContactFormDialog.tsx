'use client';

import { Dialog, Portal } from '@ark-ui/react';
import { X } from 'lucide-react';

import ContactForm from './ContactForm';

/**
 * Modal wrapper for the general contact form. The client asked for a contact
 * form that is explicitly *not* a subpage, so it opens over whatever page the
 * visitor is on. Controlled by `Navbar`, which owns the state so the mobile
 * drawer can close itself before opening this.
 *
 * `unmountOnExit` resets the form (and its success state) between openings.
 */
export default function ContactFormDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(details) => onOpenChange(details.open)}
      lazyMount
      unmountOnExit
    >
      <Portal>
        {/* Distinctly named enter/exit keyframes — Zag's presence machine unmounts
            immediately when the open and closed animation names match. */}
        <Dialog.Backdrop className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm data-[state=closed]:animate-[nav-fade-out_0.2s_ease-in] data-[state=open]:animate-[nav-fade-in_0.2s_ease-out]" />
        <Dialog.Positioner className="fixed inset-0 z-60 flex items-start justify-center overflow-y-auto p-4 sm:p-6">
          <Dialog.Content className="my-auto w-full max-w-xl rounded-xl border border-graphite bg-bg-mid p-6 shadow-2xl shadow-black/60 data-[state=closed]:animate-[nav-fade-out_0.2s_ease-in] data-[state=open]:animate-[nav-fade-in_0.2s_ease-out] sm:p-8">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold tracking-widest text-accent uppercase">
                  Napisz do nas
                </p>
                <Dialog.Title className="font-heading text-2xl font-bold text-white">
                  Formularz kontaktowy
                </Dialog.Title>
                <Dialog.Description className="mt-2 font-body text-sm text-silver">
                  Masz pytanie, które nie dotyczy konkretnej wyceny? Napisz — odpowiemy najszybciej
                  jak to możliwe.
                </Dialog.Description>
              </div>
              <Dialog.CloseTrigger
                className="shrink-0 text-silver transition-colors outline-none hover:text-white"
                aria-label="Zamknij formularz"
              >
                <X size={24} aria-hidden="true" />
              </Dialog.CloseTrigger>
            </div>
            <ContactForm />
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
}
