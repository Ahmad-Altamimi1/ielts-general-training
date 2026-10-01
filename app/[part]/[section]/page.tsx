import { notFound } from "next/navigation";

import { Blocks } from "@/components/content/block-renderer";
import { SectionHeader } from "@/components/content/section-header";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import { OnThisPage } from "@/components/nav/on-this-page";
import { SectionNav } from "@/components/nav/section-nav";
import {
  allSections,
  getSection,
  partHref,
  partLabel,
} from "@/lib/content/registry";

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
  const index = part.sections.findIndex((s) => s.id === section.id);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs
        trail={[
          { label: "Course", href: "/" },
          { label: partLabel(part), href: partHref(part.id) },
          { label: `${section.id} ${section.title}` },
        ]}
      />

      {/* Content first in the source order, contents list beside it. */}
      <div className="mt-4 gap-10 lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-start">
        <article className="min-w-0">
          <SectionHeader
            part={part}
            section={section}
            partLabel={partLabel(part)}
            position={{ index: index + 1, total: part.sections.length }}
          />

          <div className="mt-8 space-y-4">
            <Blocks blocks={section.blocks} />
          </div>

          <SectionNav partId={part.id} sectionId={section.id} />
        </article>

        <OnThisPage blocks={section.blocks} />
      </div>
    </div>
  );
}
