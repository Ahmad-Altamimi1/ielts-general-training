"use client";

import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { useAllProgress } from "@/hooks/use-progress";
import type { NavPart } from "@/lib/content/nav";
import { skillFor, toneFor } from "@/lib/content/tone";

/**
 * One part, as a card the student can see their own standing in.
 *
 * The tone is the part's skill, so the grid reads as four papers rather
 * than eleven chapters, and the ring shows how much of the part has been
 * marked without needing a separate dashboard.
 */
export function PartCard({ part }: { part: NavPart }) {
  const progress = useAllProgress();

  const total = part.exerciseIds.length;
  const done = part.exerciseIds.filter((id) => progress[id]).length;
  const complete = total > 0 && done === total;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  const skill = skillFor(part.id);

  return (
    <Link
      href={part.href}
      data-tone={toneFor(part.id)}
      className="group panel relative flex h-full flex-col overflow-hidden rounded-xl transition hover:-translate-y-0.5 hover:panel-lift focus-visible:-translate-y-0.5"
    >
      {/* The part's hue, as a spine down the left edge. */}
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1 bg-tone"
      />

      <div className="tone-field flex-1 px-5 py-5 pl-6">
        <div className="flex items-center gap-2">
          <span className="font-heading rounded-md bg-tone-wash px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
            {part.label}
          </span>
          {skill ? (
            <span className="font-heading text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase">
              {skill}
            </span>
          ) : null}
          {complete ? (
            <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-mark-correct">
              <Check aria-hidden="true" className="size-3.5" />
              Done
            </span>
          ) : null}
        </div>

        <h3 className="font-heading mt-3 text-lg leading-snug font-semibold tracking-tight">
          {part.title}
        </h3>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
          {part.summary}
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-layer-border px-5 py-3 pl-6 text-xs text-ink-muted">
        <span className="tabular-nums">
          {part.sections.length} section{part.sections.length === 1 ? "" : "s"}
        </span>

        {total > 0 ? (
          <>
            <span aria-hidden="true">·</span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-hidden="true"
                className="h-1 flex-1 overflow-hidden rounded-full bg-layer-border"
              >
                <span
                  className="block h-full rounded-full bg-tone transition-[width]"
                  style={{ width: `${percent}%` }}
                />
              </span>
              <span className="shrink-0 tabular-nums">
                {done}/{total}
              </span>
              <span className="sr-only">exercises done</span>
            </span>
          </>
        ) : (
          <span className="flex-1" />
        )}

        <ArrowRight
          aria-hidden="true"
          className="size-4 shrink-0 text-tone transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
