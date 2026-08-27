import type { LegalPageQueryResult } from '@/sanity.types';

type LegalPage = NonNullable<LegalPageQueryResult>;
type Section = NonNullable<LegalPage['sections']>[number];

/**
 * Blank-line-separated paragraphs, the `aboutPage.storyBody` convention. Empty
 * blocks are dropped so a stray extra newline in the CMS cannot render a gap.
 */
function paragraphs(text: string | undefined) {
  if (!text) return [];
  return text
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);
}

function Paragraphs({ text }: { text: string | undefined }) {
  return paragraphs(text).map((block, index) => (
    <p key={index} className="mt-4 font-body text-base leading-relaxed text-silver first:mt-0">
      {block}
    </p>
  ));
}

function LegalSectionBlock({ section }: { section: Section }) {
  const bullets = (section.bullets ?? []).filter(Boolean);

  return (
    <section className="mt-12 first:mt-0">
      {section.heading && (
        <h2 className="mb-4 font-heading text-2xl font-bold text-white">{section.heading}</h2>
      )}
      <Paragraphs text={section.body} />
      {bullets.length > 0 && (
        <ul className="mt-4 flex flex-col gap-2">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex gap-3 font-body text-base leading-relaxed text-silver">
              <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
      {section.footnote && (
        <p className="mt-4 font-body text-sm leading-relaxed text-silver/80 italic">
          {section.footnote}
        </p>
      )}
    </section>
  );
}

export default function LegalDocument({ page }: { page: LegalPage }) {
  const sections = page.sections ?? [];
  // The CMS stores a plain date (YYYY-MM-DD); render it the Polish way.
  const updated = page.lastUpdated
    ? new Date(page.lastUpdated).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : undefined;

  return (
    <div className="bg-bg-deep pt-28 pb-24">
      <div className="mx-auto max-w-3xl px-6">
        <h1 className="font-heading text-4xl font-bold text-white md:text-5xl">{page.title}</h1>
        {updated && (
          <p className="mt-3 font-body text-sm text-silver">Ostatnia aktualizacja: {updated}</p>
        )}
        <div className="mt-10 border-t border-graphite pt-10">
          <Paragraphs text={page.intro} />
          {sections.map((section) => (
            <LegalSectionBlock key={section._key} section={section} />
          ))}
        </div>
      </div>
    </div>
  );
}
