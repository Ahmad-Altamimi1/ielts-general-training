"use client";

import { TrendingUp } from "lucide-react";

import { useStudyStats } from "@/components/study/study-context";
import { QUESTIONS_PER_PAPER } from "@/lib/band";

const PAPER_LABEL = { reading: "Reading", listening: "Listening" } as const;
const PAPER_TONE = { reading: "blue", listening: "violet" } as const;

/**
 * The number the student actually cares about.
 *
 * The book's own point is that the gap between band 5 and band 6 in
 * Reading is seven answers — a distance small enough to work at. This
 * turns a pile of practice scores into that distance.
 *
 * It is an estimate and says so: these are practice sets, not a timed
 * forty-question paper. Overstating it would be the one thing that makes
 * the whole feature worthless.
 */
export function BandPanel() {
  const stats = useStudyStats();

  if (stats.papers.length === 0) {
    return (
      <div className="panel rounded-xl px-5 py-4">
        <p className="font-heading flex items-center gap-2 text-[0.6875rem] font-bold tracking-wider text-ink-muted uppercase">
          <TrendingUp aria-hidden="true" className="size-3.5" />
          Where you are
        </p>
        <p className="mt-2 text-sm text-ink-muted">
          Mark any Reading or Listening set and your projected band appears
          here, with the number of answers between you and the next one.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {stats.papers.map((paper) => {
        const percent = Math.round(
          (paper.projected / QUESTIONS_PER_PAPER) * 100,
        );

        return (
          <div
            key={paper.paper}
            data-tone={PAPER_TONE[paper.paper]}
            className="panel tone-field rounded-xl px-5 py-4"
          >
            <p className="font-heading text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
              {PAPER_LABEL[paper.paper]}
            </p>

            <p className="mt-2 flex items-baseline gap-2">
              <span className="font-heading text-4xl font-bold tabular-nums">
                {paper.band === null ? "—" : `Band ${paper.band}`}
              </span>
            </p>

            <p className="mt-1 text-sm text-ink-muted">
              on this pace: {paper.projected} of {QUESTIONS_PER_PAPER} right
            </p>

            <span
              aria-hidden="true"
              className="mt-3 block h-1.5 overflow-hidden rounded-full bg-layer-border"
            >
              <span
                className="block h-full rounded-full bg-tone transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </span>

            {paper.next ? (
              <p className="mt-3 border-t border-layer-border pt-3 text-sm">
                <span className="font-heading font-bold text-tone tabular-nums">
                  {paper.next.moreAnswers} more
                </span>{" "}
                <span className="text-ink-muted">
                  correct answers in forty and you are at band{" "}
                  {paper.next.band}.
                </span>
              </p>
            ) : (
              <p className="mt-3 border-t border-layer-border pt-3 text-sm text-ink-muted">
                Top of the table the book prints. Keep the accuracy and work
                on timing.
              </p>
            )}

            <p className="mt-2 text-xs text-ink-muted">
              An estimate from {paper.score}/{paper.total} marked here, not a
              real test score.
            </p>
          </div>
        );
      })}
    </div>
  );
}
