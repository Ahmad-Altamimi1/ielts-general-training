"use client";

import Link from "next/link";
import { ArrowRight, Target } from "lucide-react";

import { useStudyStats } from "@/components/study/study-context";

/**
 * Where the marks are going.
 *
 * The book is organised by question type and says every type has a rule,
 * so "you are at 40% on True/False/Not Given" is a specific instruction
 * to go and learn one rule — not a vague score. Weakest first, because
 * this is a to-do list rather than a scoreboard.
 */
export function WeakSpots({ limit = 4 }: { limit?: number }) {
  const stats = useStudyStats();
  const shown = stats.byKind.slice(0, limit);

  if (shown.length === 0) {
    return (
      <div className="panel rounded-xl px-5 py-4">
        <p className="font-heading flex items-center gap-2 text-[0.6875rem] font-bold tracking-wider text-ink-muted uppercase">
          <Target aria-hidden="true" className="size-3.5" />
          Where you lose marks
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Once you have marked a few sets, this ranks the question types by
          how many marks each is costing you, worst first.
        </p>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden rounded-xl">
      <p className="font-heading flex items-center gap-2 border-b border-layer-border px-5 py-3 text-[0.6875rem] font-bold tracking-wider text-ink-muted uppercase">
        <Target aria-hidden="true" className="size-3.5" />
        Where you lose marks
      </p>

      <ul>
        {shown.map((kind) => {
          const percent = Math.round(kind.accuracy * 100);
          const strong = kind.accuracy >= 0.8;

          return (
            <li
              key={kind.kind}
              className="border-b border-layer-border last:border-b-0"
            >
              <Link
                href={kind.href}
                className="group flex items-center gap-4 px-5 py-3 transition hover:bg-surface-hover"
              >
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium">
                    {kind.label}
                  </span>
                  <span className="mt-1.5 flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className="h-1 w-24 overflow-hidden rounded-full bg-layer-border"
                    >
                      <span
                        className={`block h-full rounded-full ${
                          strong ? "bg-mark-correct" : "bg-mark-incorrect"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </span>
                    <span className="text-xs text-ink-muted tabular-nums">
                      {kind.score}/{kind.total} · {percent}%
                    </span>
                  </span>
                </span>

                <span className="hidden shrink-0 text-xs text-ink-muted sm:block">
                  {strong ? "Solid" : "Work on this"}
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 shrink-0 text-ink-muted transition group-hover:translate-x-0.5"
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
