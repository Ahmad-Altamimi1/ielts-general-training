"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAllProgress } from "@/hooks/use-progress";
import { useIsHydrated } from "@/hooks/use-hydrated";
import { clearAllProgress, storageAvailable } from "@/lib/progress";
import { toneFor } from "@/lib/content/tone";

export type ExerciseSummary = {
  id: string;
  title: string;
  questionCount: number;
  partId: string;
  partLabel: string;
  partTitle: string;
  sectionId: string;
  sectionTitle: string;
  href: string;
};

/** A fixed format, so the date does not differ between the server render
 *  and the browser's locale. */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function Stat({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: string;
}) {
  return (
    <div data-tone={tone} className="panel tone-field rounded-xl px-5 py-4">
      <p className="font-heading text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
        {label}
      </p>
      <p className="font-heading mt-2 text-4xl font-bold tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-sm text-ink-muted">{detail}</p>
    </div>
  );
}

export function ProgressList({ exercises }: { exercises: ExerciseSummary[] }) {
  const progress = useAllProgress();
  const hydrated = useIsHydrated();
  const [open, setOpen] = useState(false);

  const attempted = exercises.filter((e) => progress[e.id]);
  const marks = attempted.reduce(
    (totals, e) => ({
      score: totals.score + progress[e.id].score,
      total: totals.total + progress[e.id].total,
    }),
    { score: 0, total: 0 },
  );
  const accuracy =
    marks.total === 0 ? 0 : Math.round((marks.score / marks.total) * 100);

  // Checked only after hydration: on the server there is no such thing.
  const unavailable = hydrated && !storageAvailable();

  // Grouped by part, in book order, so the list reads like the course.
  const byPart = exercises.reduce<Map<string, ExerciseSummary[]>>(
    (groups, exercise) => {
      const key = `${exercise.partLabel}\u0000${exercise.partTitle}`;
      groups.set(key, [...(groups.get(key) ?? []), exercise]);
      return groups;
    },
    new Map(),
  );

  return (
    <>
      {unavailable ? (
        <p className="measure mt-6 rounded-md border-l-4 border-brand bg-layer-raised p-4">
          This browser will not let the site store anything, so no progress
          can be kept. Every exercise still works and still marks itself —
          only the record is lost when you leave the page.
        </p>
      ) : null}

      <section aria-labelledby="summary" className="mt-8">
        <h2 id="summary" className="sr-only">
          Summary
        </h2>
        <div className="grid gap-3 sm:grid-cols-3">
          <Stat
            tone="blue"
            label="Exercises done"
            value={`${attempted.length}`}
            detail={`of ${exercises.length} in the course`}
          />
          <Stat
            tone="violet"
            label="Marks"
            value={marks.total === 0 ? "—" : `${marks.score}/${marks.total}`}
            detail={
              marks.total === 0
                ? "Nothing marked yet"
                : "across everything you have done"
            }
          />
          <Stat
            tone="emerald"
            label="Accuracy"
            value={marks.total === 0 ? "—" : `${accuracy}%`}
            detail={
              marks.total === 0
                ? "Start with any exercise"
                : "of the questions you answered"
            }
          />
        </div>
      </section>

      <section aria-labelledby="exercises" className="mt-10">
        <h2
          id="exercises"
          className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Every exercise
        </h2>

        <div className="mt-3 space-y-6">
          {[...byPart].map(([key, group]) => {
            const [label, title] = key.split("\u0000");
            return (
              <div key={key} data-tone={toneFor(group[0].partId)}>
                <h3 className="font-heading flex items-baseline gap-2 text-sm font-semibold">
                  <span className="rounded-md bg-tone-wash px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
                    {label}
                  </span>
                  <span className="text-ink-muted">{title}</span>
                </h3>

                <ul className="panel mt-2.5 overflow-hidden rounded-xl">
                  {group.map((exercise) => {
                    const record = progress[exercise.id];
                    return (
                      <li
                        key={exercise.id}
                        className="border-b border-layer-border last:border-b-0"
                      >
                        <Link
                          href={exercise.href}
                          className="grid items-center gap-x-4 gap-y-1 px-4 py-3.5 transition hover:bg-tone-wash focus-visible:bg-tone-wash sm:grid-cols-[1fr_auto]"
                        >
                          <span className="min-w-0">
                            <span className="block">
                              {exercise.title}
                              <span className="text-ink-muted">
                                {" "}
                                · {exercise.questionCount} questions
                              </span>
                            </span>
                            <span className="block text-xs text-ink-muted">
                              {exercise.sectionId} {exercise.sectionTitle}
                            </span>
                          </span>

                          <span className="flex items-center gap-2 text-sm sm:justify-end">
                            {record ? (
                              <>
                                <Check
                                  aria-hidden="true"
                                  className="size-4 text-mark-correct"
                                />
                                <span className="font-heading font-semibold tabular-nums">
                                  {record.score}
                                  <span className="text-ink-muted">
                                    /{record.total}
                                  </span>
                                </span>
                                <span className="text-xs text-ink-muted">
                                  {formatDate(record.completedAt)}
                                </span>
                              </>
                            ) : (
                              <span className="text-ink-muted">
                                Not attempted
                              </span>
                            )}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {attempted.length > 0 ? (
        <div className="mt-10 border-t border-layer-border pt-5">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
                <RotateCcw aria-hidden="true" className="size-4" />
                Reset all progress
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  Delete every saved answer and score?
                </AlertDialogTitle>
                <AlertDialogDescription>
                  This clears all {attempted.length} attempt
                  {attempted.length === 1 ? "" : "s"} stored in this browser.
                  It cannot be undone, and nothing is kept anywhere else.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep my progress</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    clearAllProgress();
                    setOpen(false);
                  }}
                >
                  Delete everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      ) : null}

      <p role="status" aria-live="polite" className="sr-only">
        {attempted.length === 0
          ? "No exercises attempted yet."
          : `${attempted.length} exercises attempted, ${marks.score} marks out of ${marks.total}, ${accuracy} per cent.`}
      </p>
    </>
  );
}
