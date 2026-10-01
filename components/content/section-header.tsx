import { Clock, FileText, ListChecks } from "lucide-react";

import type { Block, Part, Section } from "@/lib/content/schema";

/** What this section contains, counted off the blocks so it can never
 *  disagree with the page below it. */
function summarise(blocks: readonly Block[]) {
  let exercises = 0;
  let questions = 0;
  let seconds = 0;
  let passages = 0;

  for (const block of blocks) {
    if (block.kind === "passage") passages += 1;
    if (block.kind !== "exercise") continue;
    exercises += 1;
    questions += block.exercise.questions.length;
    seconds += block.exercise.timeLimitSeconds ?? 0;
  }

  return { exercises, questions, seconds, passages };
}

function minutes(seconds: number): string {
  const whole = Math.round(seconds / 60);
  return `${whole} min`;
}

export function SectionHeader({
  part,
  section,
  partLabel,
  position,
}: {
  part: Part;
  section: Section;
  partLabel: string;
  /** "4 of 13", so a student knows where they are in the part. */
  position: { index: number; total: number };
}) {
  const stats = summarise(section.blocks);

  return (
    <header className="border-b border-layer-border pb-6">
      <p className="font-heading flex flex-wrap items-center gap-x-2 text-xs font-semibold tracking-wide uppercase">
        <span className="text-brand">{partLabel}</span>
        <span aria-hidden="true" className="text-layer-border">
          /
        </span>
        <span className="text-ink-muted">{part.title}</span>
        <span className="ml-auto font-normal tracking-normal text-ink-muted normal-case">
          Section {position.index} of {position.total}
        </span>
      </p>

      <h1 className="font-heading mt-3 flex flex-wrap items-baseline gap-x-3 text-3xl font-semibold tracking-tight sm:text-[2.125rem]">
        <span className="text-brand tabular-nums">{section.id}</span>
        <span>{section.title}</span>
      </h1>

      {stats.exercises > 0 || stats.passages > 0 ? (
        <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink-muted">
          {stats.passages > 0 ? (
            <li className="flex items-center gap-1.5">
              <FileText aria-hidden="true" className="size-4" />
              {stats.passages} reading text{stats.passages === 1 ? "" : "s"}
            </li>
          ) : null}
          {stats.exercises > 0 ? (
            <li className="flex items-center gap-1.5">
              <ListChecks aria-hidden="true" className="size-4" />
              {stats.questions} marked question
              {stats.questions === 1 ? "" : "s"}
              {stats.exercises > 1 ? ` in ${stats.exercises} sets` : ""}
            </li>
          ) : null}
          {stats.seconds > 0 ? (
            <li className="flex items-center gap-1.5">
              <Clock aria-hidden="true" className="size-4" />
              {minutes(stats.seconds)} of timed practice
            </li>
          ) : null}
        </ul>
      ) : null}
    </header>
  );
}
