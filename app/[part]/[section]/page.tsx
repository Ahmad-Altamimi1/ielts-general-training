import { notFound } from "next/navigation";

import { Blocks } from "@/components/content/block-renderer";
import { allSections, getSection } from "@/lib/content/registry";

export function generateStaticParams() {
  return allSections.map(({ part, section }) => ({
    part: part.id,
    section: section.id,
  }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[part]/[section]">) {
  const { part: partId, section: sectionId } = await params;
  const found = getSection(partId, decodeURIComponent(sectionId));
  if (!found) return {};
  return { title: `${found.section.id} ${found.section.title}` };
}

export default async function SectionPage({
  params,
}: PageProps<"/[part]/[section]">) {
  const { part: partId, section: sectionId } = await params;
  const found = getSection(partId, decodeURIComponent(sectionId));
  if (!found) notFound();

  const { part, section } = found;

  return (
    <article>
      <header>
        <p className="font-heading text-sm font-semibold tracking-wide text-ink-muted uppercase">
          {part.number === null ? part.title : `Part ${part.number}`}
        </p>
        <h1 className="font-heading mt-1 flex gap-3 text-3xl font-semibold tracking-tight">
          <span className="text-brand tabular-nums">{section.id}</span>
          <span>{section.title}</span>
        </h1>
      </header>

      <div className="mt-8 space-y-4">
        <Blocks blocks={section.blocks} />
      </div>
    </article>
  );
}
