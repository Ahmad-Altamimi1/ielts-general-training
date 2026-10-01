"use client";

import { useState } from "react";
import { CheckCircle2, ListChecks, RotateCcw } from "lucide-react";

import { ExerciseTimer } from "@/components/exercise/exercise-timer";
import {
  PrintAnswer,
  QuestionFeedback,
} from "@/components/exercise/question-feedback";
import { QuestionInput } from "@/components/exercise/question-input";
import { Button } from "@/components/ui/button";
import { useExerciseProgress } from "@/hooks/use-progress";
import type { Exercise } from "@/lib/content/schema";
import { markExercise } from "@/lib/marking";
import { clearExercise, saveProgress } from "@/lib/progress";

type Responses = Record<number, string>;

/** What the student has done here in this sitting. Null until they touch
 *  the exercise, so that a saved attempt shows through until then. */
type Local = { responses: Responses; marked: boolean } | null;

/** How the book names each task, for the badge on the card. */
const KIND_LABEL: Record<Exercise["kind"], string> = {
  tfng: "True / False / Not Given",
  ynng: "Yes / No / Not Given",
  mcq: "Multiple choice",
  matching: "Matching",
  gapfill: "Completion",
  headings: "Matching headings",
};

export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const saved = useExerciseProgress(exercise.id);
  const [local, setLocal] = useState<Local>(null);

  // Derived rather than copied into state by an effect: on the server and
  // during hydration `saved` is null and this is the empty form, and the
  // restored attempt appears in the same commit that reads storage.
  const state = local ?? {
    responses: saved?.responses ?? {},
    marked: saved !== null,
  };

  const result = state.marked ? markExercise(exercise, state.responses) : null;

  const answer = (n: number, value: string) => {
    setLocal({ marked: false, responses: { ...state.responses, [n]: value } });
  };

  const check = () => {
    const marked = markExercise(exercise, state.responses);
    setLocal({ responses: state.responses, marked: true });
    saveProgress({
      exerciseId: exercise.id,
      responses: state.responses,
      score: marked.score,
      total: marked.total,
    });
  };

  const reset = () => {
    setLocal({ responses: {}, marked: false });
    clearExercise(exercise.id);
  };

  const count = exercise.questions.length;
  const answered = exercise.questions.filter(
    (q) => (state.responses[q.n] ?? "").trim() !== "",
  ).length;

  const full = result !== null && result.score === result.total;
  const byNumber = new Map(result?.results.map((r) => [r.n, r]) ?? []);

  return (
    <section
      aria-labelledby={`${exercise.id}-title`}
      className="mt-10 scroll-mt-20 overflow-hidden rounded-md border border-layer-border bg-layer-raised break-inside-avoid"
    >
      {/* Header strip: what this is, how many, how long. */}
      <header className="border-b border-layer-border bg-layer-strip px-4 py-3.5 sm:px-6">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1.5">
          <h3
            id={`${exercise.id}-title`}
            className="font-heading scroll-mt-20 text-base font-semibold tracking-tight"
          >
            {exercise.title}
          </h3>
          <span className="font-heading rounded-full border border-layer-border px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide text-ink-muted uppercase">
            {KIND_LABEL[exercise.kind]}
          </span>
          <span className="ml-auto flex items-center gap-1.5 text-sm text-ink-muted">
            <ListChecks aria-hidden="true" className="size-4" />
            {count} question{count === 1 ? "" : "s"}
          </span>
        </div>

        <p className="passage-type measure mt-2.5">{exercise.instruction}</p>

        {exercise.timeLimitSeconds ? (
          <div className="mt-3.5 border-t border-layer-border pt-3">
            <ExerciseTimer
              limitSeconds={exercise.timeLimitSeconds}
              exerciseTitle={exercise.title}
            />
          </div>
        ) : null}
      </header>

      {/* The option list a matching task is answered from. */}
      {exercise.options && exercise.kind !== "headings" ? (
        <div className="border-b border-layer-border px-4 py-3.5 sm:px-6">
          <h4 className="font-heading text-[0.6875rem] font-semibold tracking-wide text-ink-muted uppercase">
            Choose from
          </h4>
          <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[0.9375rem]">
            {exercise.options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <ol className="divide-y divide-layer-border">
        {exercise.questions.map((question) => {
          const questionResult = byNumber.get(question.n);
          return (
            <li
              key={question.n}
              className="grid grid-cols-[2.25rem_1fr] gap-x-1 px-4 py-5 break-inside-avoid sm:px-6"
            >
              <span
                aria-hidden="true"
                className="font-heading pt-px text-sm font-semibold text-brand tabular-nums"
              >
                {question.n}.
              </span>

              <div className="measure min-w-0">
                <p>{question.prompt}</p>

                <QuestionInput
                  exercise={exercise}
                  question={question}
                  value={state.responses[question.n] ?? ""}
                  onChange={(value) => answer(question.n, value)}
                  disabled={result !== null}
                />

                {questionResult ? (
                  <QuestionFeedback result={questionResult} />
                ) : (
                  <PrintAnswer answers={question.answers} why={question.why} />
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="print-hidden flex flex-wrap items-center gap-x-4 gap-y-3 border-t border-layer-border bg-layer-strip px-4 py-3.5 sm:px-6">
        {result === null ? (
          <>
            <Button type="button" onClick={check}>
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Check answers
            </Button>
            <p className="text-sm text-ink-muted tabular-nums">
              {answered} of {count} answered
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-2xl font-semibold tabular-nums">
              <span className={full ? "text-mark-correct" : "text-ink"}>
                {result.score}
              </span>
              <span className="text-ink-muted"> / {result.total}</span>
            </p>

            <p className="max-w-sm text-sm text-ink-muted">
              {full
                ? "Every answer right. Read the reasons anyway — they name the traps you walked past."
                : "Read the reason under every question, not only the ones you lost."}
            </p>

            <Button
              type="button"
              variant="outline"
              onClick={reset}
              className="ml-auto"
            >
              <RotateCcw aria-hidden="true" className="size-4" />
              Try again
            </Button>
          </>
        )}
      </footer>

      {/* The score reaches a screen reader as soon as marking happens,
          without moving focus away from where the student was. */}
      <p role="status" aria-live="polite" className="sr-only">
        {result
          ? `${exercise.title} marked. ${result.score} out of ${result.total} correct. Every answer now shows its explanation.`
          : ""}
      </p>
    </section>
  );
}
