import { Check, Minus, X } from "lucide-react";

import type { QuestionResult, QuestionStatus } from "@/lib/marking";

/**
 * Marking state never rests on colour.
 *
 * Green and red carry the result at a glance, which is what a student
 * scanning their own paper actually uses. Each state also carries an icon
 * and a word, so a colour-blind student, a printed page and a screen
 * reader all give the same answer. Both colours meet WCAG AA against the
 * page in both themes; the washes sit behind nothing but the feedback
 * block itself, never behind running text.
 */
const STATES: Record<
  QuestionStatus,
  {
    label: string;
    icon: typeof Check;
    text: string;
    border: string;
    wash: string;
  }
> = {
  correct: {
    label: "Correct",
    icon: Check,
    text: "text-mark-correct",
    border: "border-mark-correct",
    wash: "bg-mark-correct-wash",
  },
  incorrect: {
    label: "Incorrect",
    icon: X,
    text: "text-mark-incorrect",
    border: "border-mark-incorrect",
    wash: "bg-mark-incorrect-wash",
  },
  unanswered: {
    label: "Not answered",
    icon: Minus,
    text: "text-mark-unanswered",
    border: "border-mark-unanswered",
    wash: "bg-transparent",
  },
};

export function StatusMark({
  status,
  className,
}: {
  status: QuestionStatus;
  className?: string;
}) {
  const state = STATES[status];
  const Icon = state.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-sm font-semibold ${state.text} ${className ?? ""}`}
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
      className={`mt-3 break-inside-avoid rounded-sm border-l-2 ${state.border} ${state.wash} px-3.5 py-3`}
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
      <p className="mt-2 border-t border-rule/60 pt-2 text-sm">{result.why}</p>
    </div>
  );
}
