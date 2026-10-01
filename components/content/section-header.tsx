import { Clock, FileText, ListChecks } from "lucide-react";

import type { Block, Part, Section } from "@/lib/content/schema";
import { skillFor } from "@/lib/content/tone";

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
  const skill = skillFor(part.id);
  const percent = Math.round((position.index / position.total) * 100);

  return (
    <header className="panel tone-field relative overflow-hidden rounded-2xl px-5 py-6 sm:px-8 sm:py-8">
      <span
        aria-hidden="true"
        className="absolute inset-y-0 left-0 w-1.5 bg-tone"
      />

      <div className="flex flex-wrap items-center gap-2">
        <span className="font-heading rounded-md bg-tone-wash px-2 py-0.5 text-[0.6875rem] font-bold tracking-wider text-tone uppercase">
          {partLabel}
        </span>
        <span className="font-heading text-[0.6875rem] font-semibold tracking-wider text-ink-muted uppercase">
          {skill ?? part.title}
        </span>

        <span className="ml-auto flex items-center gap-2.5 text-xs text-ink-muted">
          <span
            aria-hidden="true"
            className="hidden h-1 w-20 overflow-hidden rounded-full bg-layer-border sm:block"
          >
            <span
              className="block h-full rounded-full bg-tone"
              style={{ width: `${percent}%` }}
            />
          </span>
          <span className="tabular-nums">
            Section {position.index} of {position.total}
          </span>
        </span>
      </div>

      <h1 className="font-heading mt-4 flex flex-wrap items-baseline gap-x-3 text-3xl leading-tight font-bold tracking-tight text-balance sm:text-[2.5rem]">
        <span className="text-tone tabular-nums">{section.id}</span>
        <span>{section.title}</span>
      </h1>

      {stats.exercises > 0 || stats.passages > 0 ? (
        <ul className="mt-5 flex flex-wrap items-center gap-2">
          {stats.passages > 0 ? (
            <li className="flex items-center gap-1.5 rounded-lg border border-layer-border bg-layer-raised px-2.5 py-1.5 text-xs">
              <FileText aria-hidden="true" className="size-3.5 text-tone" />
              {stats.passages} reading text{stats.passages === 1 ? "" : "s"}
            </li>
          ) : null}
          {stats.exercises > 0 ? (
            <li className="flex items-center gap-1.5 rounded-lg border border-layer-border bg-layer-raised px-2.5 py-1.5 text-xs">
              <ListChecks aria-hidden="true" className="size-3.5 text-tone" />
              {stats.questions} marked question
              {stats.questions === 1 ? "" : "s"}
            </li>
          ) : null}
          {stats.seconds > 0 ? (
            <li className="flex items-center gap-1.5 rounded-lg border border-layer-border bg-layer-raised px-2.5 py-1.5 text-xs">
              <Clock aria-hidden="true" className="size-3.5 text-tone" />
              {Math.round(stats.seconds / 60)} min timed
            </li>
          ) : null}
        </ul>
      ) : null}
    </header>
  );
}
