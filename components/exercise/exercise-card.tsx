import type { Exercise } from "@/lib/content/schema";

/**
 * Renders an exercise.
 *
 * Milestone 2 prints the rubric and the numbered questions, which is what
 * the book does. Milestone 4 adds the inputs, the marking and the timer to
 * this same card.
 */
export function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <section
      aria-labelledby={`${exercise.id}-title`}
      className="break-inside-avoid mt-8 border-t-2 border-rule-strong pt-5"
    >
      <h4
        id={`${exercise.id}-title`}
        className="font-heading text-base font-semibold tracking-tight"
      >
        {exercise.title}
      </h4>

      <p className="passage-type measure mt-2">{exercise.instruction}</p>

      {exercise.options ? (
        <ol className="measure mt-4 space-y-1.5 text-[0.9375rem]">
          {exercise.options.map((option, i) => (
            <li key={i}>{option}</li>
          ))}
        </ol>
      ) : null}

      <ol className="measure mt-5 space-y-4">
        {exercise.questions.map((question) => (
          <li
            key={question.n}
            className="grid grid-cols-[2.25rem_1fr] gap-x-1 break-inside-avoid"
          >
            <span className="font-heading pt-px text-sm font-semibold text-brand tabular-nums">
              {question.n}.
            </span>
            <div>
              <p>{question.prompt}</p>
              {question.choices ? (
                <ul className="mt-2 space-y-1 text-[0.9375rem]">
                  {question.choices.map((choice) => (
                    <li
                      key={choice.id}
                      className="grid grid-cols-[1.5rem_1fr] gap-x-1"
                    >
                      <span className="text-ink-muted">{choice.id}</span>
                      <span>{choice.text}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
