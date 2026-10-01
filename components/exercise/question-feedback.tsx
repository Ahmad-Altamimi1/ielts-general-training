import { Check, Minus, X } from "lucide-react";

import type { QuestionResult, QuestionStatus } from "@/lib/marking";

/**
 * Marking state never rests on colour.
 *
 * Each state carries an icon and a word as well, so that the score is
 * legible to a colour-blind student, in print, and to a screen reader.
 * Correct takes the accent; incorrect stays ink and is told apart by its
 * mark, its label and the struck-through response.
 */
const STATES: Record<
  QuestionStatus,
  { label: string; icon: typeof Check; className: string }
> = {
  correct: {
    label: "Correct",
    icon: Check,
    className: "text-mark-correct border-mark-correct",
  },
  incorrect: {
    label: "Incorrect",
    icon: X,
    className: "text-mark-incorrect border-mark-incorrect",
  },
  unanswered: {
    label: "Not answered",
    icon: Minus,
    className: "text-mark-unanswered border-mark-unanswered",
  },
};

export function StatusMark({ status }: { status: QuestionStatus }) {
  const state = STATES[status];
  const Icon = state.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${state.className}`}
    >
      <Icon aria-hidden="true" className="size-4 shrink-0" strokeWidth={2.5} />
      {state.label}
    </span>
  );
}

/**
 * The answer and its explanation, on paper only.
 *
 * On screen a student who has not checked yet should not see the answer.
 * On paper the sheet is no use to a teacher without it, so this is hidden
 * by default and revealed by the print stylesheet.
 */
export function PrintAnswer({
  answers,
  why,
}: {
  answers: readonly string[];
  why: string;
}) {
  const [expected, ...alsoAccepted] = answers;

  return (
    <div
      data-print-answer
      aria-hidden="true"
      className="mt-3 hidden break-inside-avoid border-l-2 border-rule pl-3 text-sm"
    >
      <p>
        <span className="text-ink-muted">Answer </span>
        <span className="font-semibold">{expected}</span>
        {alsoAccepted.length > 0 ? (
          <span className="text-ink-muted">
            {" "}
            (also accepted: {alsoAccepted.join(", ")})
          </span>
        ) : null}
      </p>
      <p className="mt-1">{why}</p>
    </div>
  );
}

export function QuestionFeedback({ result }: { result: QuestionResult }) {
  const state = STATES[result.status];

  return (
    <div
      className={`mt-3 break-inside-avoid border-l-2 pl-3 ${state.className.split(" ")[1]}`}
    >
      <StatusMark status={result.status} />

      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {result.status !== "unanswered" ? (
          <>
            <dt className="text-ink-muted">You wrote</dt>
            <dd
              className={
                result.status === "incorrect"
                  ? "text-ink-muted line-through"
                  : undefined
              }
            >
              {result.response}
            </dd>
          </>
        ) : null}

        <dt className="text-ink-muted">Answer</dt>
        <dd className="font-semibold">
          {result.expected}
          {result.alsoAccepted.length > 0 ? (
            <span className="font-normal text-ink-muted">
              {" "}
              (also accepted: {result.alsoAccepted.join(", ")})
            </span>
          ) : null}
        </dd>
      </dl>

      {/* Shown for right answers too: it names the trap that was avoided. */}
      <p className="mt-2 text-sm">{result.why}</p>
    </div>
  );
}
