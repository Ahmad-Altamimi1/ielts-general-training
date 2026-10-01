import { partHref, partLabel, parts, sectionHref } from "./registry";
import type { Block, Section } from "./schema";

/** The navigation tree, reduced to what the sidebar needs and nothing
 *  more, so that it can cross into a client component cheaply. */
export type NavSection = {
  id: string;
  title: string;
  href: string;
  /** Exercise ids in this section, so the sidebar can show what is done
   *  without the content itself crossing into the client. */
  exerciseIds: string[];
};

export type NavPart = {
  id: string;
  /** The printed part number, or null for front and back matter. */
  number: number | null;
  /** "Part 3", or the title for front and back matter. */
  label: string;
  title: string;
  summary: string;
  href: string;
  sections: NavSection[];
  exerciseIds: string[];
};

function exerciseIdsIn(section: Section): string[] {
  return section.blocks
    .filter((block): block is Extract<Block, { kind: "exercise" }> =>
      block.kind === "exercise",
    )
    .map((block) => block.exercise.id);
}

export function navTree(): NavPart[] {
  return parts.map((part) => {
    const sections = part.sections.map((section) => ({
      id: section.id,
      title: section.title,
      href: sectionHref(part.id, section.id),
      exerciseIds: exerciseIdsIn(section),
    }));

    return {
      id: part.id,
      number: part.number,
      label: partLabel(part),
      title: part.title,
      summary: part.summary,
      href: partHref(part.id),
      sections,
      exerciseIds: sections.flatMap((s) => s.exerciseIds),
    };
  });
}
