export function VariantSpecs({ specs }: { specs: string[] }) {
  if (specs.length === 0) return null;

  return (
    <>
      <p className="mb-2 mt-4 font-heading text-xs font-semibold uppercase tracking-wider text-white">
        Specyfikacja
      </p>
      <ul className="flex flex-col gap-1.5">
        {specs.map((spec, index) => (
          <li key={index} className="flex items-center gap-2 font-body text-sm text-silver">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {spec}
          </li>
        ))}
      </ul>
    </>
  );
}
