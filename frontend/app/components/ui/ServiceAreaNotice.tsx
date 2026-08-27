import { MapPinned } from 'lucide-react';

/**
 * Prominent notice about the regions the company actually works in. Previously
 * this only existed as small grey print at the bottom of the quotation forms;
 * the client asked for it to stand out wherever contact details are shown, so it
 * renders inside `ContactShowroom` (home page + every offer page).
 */
export default function ServiceAreaNotice({
  label,
  description,
}: {
  label?: string | null;
  description?: string | null;
}) {
  if (!label && !description) return null;

  return (
    <div className="mt-8 flex gap-4 rounded-lg border border-graphite bg-bg-surface p-5">
      <MapPinned size={24} className="mt-0.5 shrink-0 text-silver" aria-hidden="true" />
      <div>
        {label && (
          <h4 className="font-heading text-base font-bold tracking-wide text-white uppercase">
            {label}
          </h4>
        )}
        {description && (
          <p className="mt-1.5 font-body text-sm leading-relaxed text-white/90">{description}</p>
        )}
      </div>
    </div>
  );
}
