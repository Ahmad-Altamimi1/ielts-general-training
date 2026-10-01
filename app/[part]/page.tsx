import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Blocks } from "@/components/content/block-renderer";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import {
  getPart,
  partLabel,
  parts,
  sectionHref,
} from "@/lib/content/registry";
import type { Section } from "@/lib/content/schema";

export function generateStaticParams() {
  return parts.map((part) => ({ part: part.id }));
}

export async function generateMetadata({ params }: PageProps<"/[part]">) {
  const part = getPart((await params).part);
  if (!part) return {};
  return { title: part.title, description: part.summary };
}

function countExercises(section: Section): number {
  return section.blocks.filter((block) => block.kind === "exercise").length;
}

export default async function PartPage({ params }: PageProps<"/[part]">) {
  const part = getPart((await params).part);
  if (!part) notFound();

  const first = part.sections[0];

  return (
    <div className="mx-auto w-full max-w-6xl">
      <Breadcrumbs
        trail={[{ label: "Course", href: "/" }, { label: partLabel(part) }]}
      />

      <article className="mt-4">
        <header className="border-b border-layer-border pb-8">
          {part.number === null ? null : (
            <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
              Part {part.number}
            </p>
          )}
          <h1 className="font-heading mt-2 text-4xl font-semibold tracking-tight">
            {part.title}
          </h1>
          <p className="measure mt-3 text-lg text-ink-muted">{part.summary}</p>

          {first ? (
            <p className="mt-6">
              <Link
                href={sectionHref(part.id, first.id)}
                className="font-heading inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2.5 text-sm font-semibold text-brand-ink hover:opacity-90"
              >
                Start at {first.id} {first.title}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </p>
          ) : null}
        </header>

        {part.intro?.length ? (
          <div className="mt-8 space-y-4">
            <Blocks blocks={part.intro} />
          </div>
        ) : null}

        {part.sections.length > 0 ? (
          <nav aria-label={`Sections of ${partLabel(part)}`} className="mt-10">
            <h2 className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
              Sections
            </h2>
            <ul className="mt-3 overflow-hidden rounded-md border border-layer-border bg-layer-raised">
              {part.sections.map((section) => {
                const exercises = countExercises(section);
                return (
                  <li
                    key={section.id}
                    className="border-b border-layer-border last:border-b-0"
                  >
                    <Link
                      href={sectionHref(part.id, section.id)}
                      className="grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-x-3 px-4 py-3.5 hover:bg-surface-hover focus-visible:bg-surface-hover"
                    >
                      <span className="font-heading text-sm font-semibold text-brand tabular-nums">
                        {section.id}
                      </span>
                      <span className="min-w-0">{section.title}</span>
                      {exercises > 0 ? (
                        <span className="text-xs text-ink-muted tabular-nums">
                          {exercises} exercise{exercises === 1 ? "" : "s"}
                        </span>
                      ) : (
                        <span />
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        ) : null}
      </article>
    </div>
  );
}
