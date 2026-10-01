"use client";

import Link from "next/link";
import { useState } from "react";

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

export type ExerciseSummary = {
  id: string;
  title: string;
  questionCount: number;
  partLabel: string;
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

export function ProgressList({
  exercises,
}: {
  exercises: ExerciseSummary[];
}) {
  const progress = useAllProgress();
  const hydrated = useIsHydrated();
  const [open, setOpen] = useState(false);

  const attempted = exercises.filter((e) => progress[e.id]);
  const marks = attempted.reduce(
    (totals, e) => {
      const record = progress[e.id];
      return {
        score: totals.score + record.score,
        total: totals.total + record.total,
      };
    },
    { score: 0, total: 0 },
  );

  // Checked only after hydration: on the server there is no such thing.
  const unavailable = hydrated && !storageAvailable();

  return (
    <>
      {unavailable ? (
        <p className="measure mt-6 border-l-4 border-brand pl-4">
          This browser will not let the site store anything, so no progress
          can be kept. Every exercise still works and still marks itself —
          only the record is lost when you leave the page.
        </p>
      ) : null}

      <section className="mt-8" aria-labelledby="summary">
        <h2
          id="summary"
          className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Summary
        </h2>
        <p className="mt-2 text-lg">
          {attempted.length === 0 ? (
            <span className="text-ink-muted">
              Nothing attempted yet. Start with any exercise and your score
              will appear here.
            </span>
          ) : (
            <>
              <span className="font-heading font-semibold text-brand tabular-nums">
                {marks.score}
              </span>
              <span className="text-ink-muted"> / {marks.total} </span>
              <span className="text-ink-muted">
                across {attempted.length} of {exercises.length} exercises
              </span>
            </>
          )}
        </p>
      </section>

      <section className="mt-10" aria-labelledby="exercises">
        <h2
          id="exercises"
          className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase"
        >
          Exercises
        </h2>

        <ul className="mt-3 border-t border-rule">
          {exercises.map((exercise) => {
            const record = progress[exercise.id];
            return (
              <li key={exercise.id} className="border-b border-rule">
                <Link
                  href={exercise.href}
                  className="grid items-baseline gap-x-4 gap-y-1 py-3.5 hover:bg-surface-hover focus-visible:bg-surface-hover sm:grid-cols-[1fr_auto]"
                >
                  <span className="min-w-0">
                    <span className="block text-xs text-ink-muted">
                      {exercise.partLabel} · {exercise.sectionId}{" "}
                      {exercise.sectionTitle}
                    </span>
                    <span className="block">
                      {exercise.title}
                      <span className="text-ink-muted">
                        {" "}
                        · {exercise.questionCount} questions
                      </span>
                    </span>
                  </span>

                  <span className="text-sm sm:text-right">
                    {record ? (
                      <>
                        <span className="font-heading font-semibold">
                          <span className="text-brand tabular-nums">
                            {record.score}
                          </span>
                          <span className="text-ink-muted">
                            {" "}
                            / {record.total}
                          </span>
                        </span>
                        <span className="block text-xs text-ink-muted">
                          {formatDate(record.completedAt)}
                        </span>
                      </>
                    ) : (
                      <span className="text-ink-muted">Not attempted</span>
                    )}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {attempted.length > 0 ? (
        <div className="mt-10 border-t border-rule pt-5">
          <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger asChild>
              <Button type="button" variant="outline">
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
          : `${attempted.length} exercises attempted, ${marks.score} marks out of ${marks.total}.`}
      </p>
    </>
  );
}
