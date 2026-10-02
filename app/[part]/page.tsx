import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, ListChecks } from "lucide-react";

import { Blocks } from "@/components/content/block-renderer";
import { Breadcrumbs } from "@/components/nav/breadcrumbs";
import {
  getPart,
  partLabel,
  parts,
  sectionHref,
  sectionNumber,
} from "@/lib/content/registry";
import { skillFor, toneFor } from "@/lib/content/tone";
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
  const skill = skillFor(part.id);
  const exercises = part.sections.reduce(
    (n, section) => n + countExercises(section),
    0,
  );

  return (
    <div data-tone={toneFor(part.id)} className="mx-auto w-full max-w-6xl pb-10">
      <Breadcrumbs
        trail={[{ label: "Course", href: "/" }, { label: partLabel(part) }]}
      />

      <article className="mt-4">
        <header className="panel tone-field relative overflow-hidden rounded-2xl px-6 py-8 sm:px-10 sm:py-10">
          <span
            aria-hidden="true"
            className="absolute inset-y-0 left-0 w-1.5 bg-tone"
          />

          <div className="flex flex-wrap items-center gap-2">
            {part.number === null ? null : (
              <span className="font-heading rounded-md bg-tone-wash px-2.5 py-1 text-xs font-bold tracking-wider text-tone uppercase">
                Part {part.number}
              </span>
            )}
            {skill ? (
              <span className="font-heading text-xs font-semibold tracking-wider text-ink-muted uppercase">
                {skill}
              </span>
            ) : null}
          </div>

          <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight font-bold tracking-tight text-balance sm:text-5xl">
            {part.title}
          </h1>
          <p className="measure mt-3 text-lg text-ink-muted">{part.summary}</p>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
            {first ? (
              <Link
                href={sectionHref(part.id, first.id)}
                className="font-heading inline-flex items-center gap-2 rounded-lg bg-tone px-4 py-2.5 text-sm font-semibold text-brand-ink transition hover:opacity-90"
              >
                Start at {sectionNumber(first.id) ?? ""} {first.title}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            ) : null}

            <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-ink-muted">
              <span className="tabular-nums">
                {part.sections.length} section
                {part.sections.length === 1 ? "" : "s"}
              </span>
              {exercises > 0 ? (
                <span className="flex items-center gap-1.5 tabular-nums">
                  <ListChecks aria-hidden="true" className="size-4" />
                  {exercises} exercise{exercises === 1 ? "" : "s"}
                </span>
              ) : null}
            </p>
          </div>
        </header>

        {part.intro?.length ? (
          <div className="mt-10 space-y-4">
            <Blocks blocks={part.intro} />
          </div>
        ) : null}

        {part.sections.length > 0 ? (
          <nav aria-label={`Sections of ${partLabel(part)}`} className="mt-10">
            <h2 className="font-heading text-xs font-bold tracking-wider text-ink-muted uppercase">
              Sections
            </h2>
            <ul className="panel mt-4 overflow-hidden rounded-xl">
              {part.sections.map((section, i) => {
                const count = countExercises(section);
                return (
                  <li
                    key={section.id}
                    className="border-b border-layer-border last:border-b-0"
                  >
                    <Link
                      href={sectionHref(part.id, section.id)}
                      className="group flex items-center gap-4 px-4 py-4 transition hover:bg-tone-wash sm:px-5"
                    >
                      <span
                        aria-hidden="true"
                        className="font-heading flex size-9 shrink-0 items-center justify-center rounded-lg bg-tone-wash text-sm font-bold text-tone tabular-nums"
                      >
                        {i + 1}
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="font-heading block font-semibold">
                          {section.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-ink-muted tabular-nums">
                          {[
                            sectionNumber(section.id),
                            count > 0
                              ? `${count} exercise${count === 1 ? "" : "s"}`
                              : null,
                          ]
                            .filter(Boolean)
                            .join(" · ")}
                        </span>
                      </span>

                      <ArrowRight
                        aria-hidden="true"
                        className="size-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5 group-hover:text-tone"
                      />
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
