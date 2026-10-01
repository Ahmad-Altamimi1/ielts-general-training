"use client";

import { useState } from "react";

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
    setLocal({
      marked: false,
      responses: { ...state.responses, [n]: value },
    });
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

  const answered = exercise.questions.filter(
    (q) => (state.responses[q.n] ?? "").trim() !== "",
  ).length;

  const byNumber = new Map(result?.results.map((r) => [r.n, r]) ?? []);

  return (
    <section
      aria-labelledby={`${exercise.id}-title`}
      className="mt-10 break-inside-avoid border-t-2 border-rule-strong pt-5"
    >
      <div className="measure">
        <h4
          id={`${exercise.id}-title`}
          className="font-heading text-base font-semibold tracking-tight"
        >
          {exercise.title}
        </h4>

        <p className="passage-type mt-2">{exercise.instruction}</p>

        {exercise.timeLimitSeconds ? (
          <div className="mt-4">
            <ExerciseTimer
              limitSeconds={exercise.timeLimitSeconds}
              exerciseTitle={exercise.title}
            />
          </div>
        ) : null}

        {exercise.options && exercise.kind !== "headings" ? (
          <ul className="mt-4 space-y-1 text-[0.9375rem]">
            {exercise.options.map((option) => (
              <li key={option}>{option}</li>
            ))}
          </ul>
        ) : null}
      </div>

      <ol className="measure mt-6 space-y-7">
        {exercise.questions.map((question) => {
          const questionResult = byNumber.get(question.n);
          return (
            <li
              key={question.n}
              className="grid grid-cols-[2.25rem_1fr] gap-x-1 break-inside-avoid"
            >
              <span
                aria-hidden="true"
                className="font-heading pt-px text-sm font-semibold text-brand tabular-nums"
              >
                {question.n}.
              </span>

              <div className="min-w-0">
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

      <div className="measure print-hidden mt-8 flex flex-wrap items-center gap-3 border-t border-rule pt-4">
        {result === null ? (
          <>
            <Button type="button" onClick={check}>
              Check {exercise.questions.length} answers
            </Button>
            <p className="text-sm text-ink-muted">
              {answered} of {exercise.questions.length} answered
            </p>
          </>
        ) : (
          <>
            <p className="font-heading text-lg font-semibold">
              <span className="text-brand tabular-nums">{result.score}</span>
              <span className="text-ink-muted"> / {result.total}</span>
            </p>
            <Button type="button" variant="outline" onClick={reset}>
              Reset
            </Button>
          </>
        )}
      </div>

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
