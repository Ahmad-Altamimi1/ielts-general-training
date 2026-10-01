import Link from "next/link";
import { notFound } from "next/navigation";

import { Blocks } from "@/components/content/block-renderer";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import {
  getPart,
  partLabel,
  parts,
  sectionHref,
} from "@/lib/content/registry";

export function generateStaticParams() {
  return parts.map((part) => ({ part: part.id }));
}

export async function generateMetadata({ params }: PageProps<"/[part]">) {
  const part = getPart((await params).part);
  if (!part) return {};
  return { title: part.title, description: part.summary };
}

export default async function PartPage({ params }: PageProps<"/[part]">) {
  const part = getPart((await params).part);
  if (!part) notFound();

  return (
    <article>
      <Breadcrumbs
        trail={[{ label: "Course", href: "/" }, { label: partLabel(part) }]}
      />

      <header className="mt-4">
        {part.number === null ? null : (
          <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
            Part {part.number}
          </p>
        )}
        <h1 className="font-heading mt-1 text-3xl font-semibold tracking-tight">
          {part.title}
        </h1>
        <p className="measure mt-2 text-ink-muted">{part.summary}</p>
      </header>

      {part.intro?.length ? (
        <div className="mt-6 space-y-4">
          <Blocks blocks={part.intro} />
        </div>
      ) : null}

      {part.sections.length > 0 ? (
        <nav aria-label={`Sections of ${partLabel(part)}`} className="mt-10">
          <h2 className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
            Sections
          </h2>
          <ul className="measure mt-3 border-t border-rule">
            {part.sections.map((section) => (
              <li key={section.id} className="border-b border-rule">
                <Link
                  href={sectionHref(part.id, section.id)}
                  className="grid grid-cols-[3.5rem_1fr] gap-x-2 py-3 hover:bg-surface-hover focus-visible:bg-surface-hover"
                >
                  <span className="font-heading text-sm font-semibold text-brand tabular-nums">
                    {section.id}
                  </span>
                  <span>{section.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </article>
  );
}
