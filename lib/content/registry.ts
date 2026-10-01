import { parts as generated } from "@/content";
import { partSchema, type Block, type Part, type Section } from "./schema";

/* ===================================================================== *
 * Content registry
 *
 * Validates every part against the schema the moment this module is first
 * imported. That happens while `next build` renders pages, so a part the
 * generator produced badly — or that someone hand-edited — fails the build
 * with the offending path named, rather than shipping broken.
 * ===================================================================== */

function validateAll(input: readonly unknown[]): Part[] {
  const out: Part[] = [];
  const problems: string[] = [];

  input.forEach((candidate, index) => {
    const result = partSchema.safeParse(candidate);
    if (result.success) {
      out.push(result.data);
      return;
    }

    const id =
      candidate && typeof candidate === "object" && "id" in candidate
        ? String((candidate as { id: unknown }).id)
        : `parts[${index}]`;

    for (const issue of result.error.issues) {
      problems.push(`  ${id}.${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
  });

  if (problems.length > 0) {
    throw new Error(
      `Invalid course content — ${problems.length} problem(s):\n${problems.join("\n")}\n\n` +
        `Content under content/ is generated from the Word book. Fix the book, then run \`npm run content\`.`,
    );
  }

  if (out.length === 0) {
    throw new Error(
      "No course content found. Run `npm run content` to generate it from the Word book.",
    );
  }

  return out;
}

export const parts: readonly Part[] = validateAll(generated);

/** A section together with the part that contains it. */
export type SectionRef = { part: Part; section: Section };

/** Every section in book order — the spine of navigation, search and
 *  previous/next links. */
export const allSections: readonly SectionRef[] = parts.flatMap((part) =>
  part.sections.map((section) => ({ part, section })),
);

const partsById = new Map(parts.map((part) => [part.id, part]));

export function getPart(partId: string): Part | undefined {
  return partsById.get(partId);
}

export function getSection(
  partId: string,
  sectionId: string,
): SectionRef | undefined {
  const part = partsById.get(partId);
  const section = part?.sections.find((s) => s.id === sectionId);
  return part && section ? { part, section } : undefined;
}

/** The URL of a section page. Section ids such as "3.5" are URL-safe. */
export function sectionHref(partId: string, sectionId: string): string {
  return `/${partId}/${encodeURIComponent(sectionId)}`;
}

export function partHref(partId: string): string {
  return `/${partId}`;
}

/** The sections either side of this one, crossing part boundaries so that
 *  a student can read the book straight through. */
export function neighbours(partId: string, sectionId: string): {
  previous: SectionRef | null;
  next: SectionRef | null;
} {
  const index = allSections.findIndex(
    (ref) => ref.part.id === partId && ref.section.id === sectionId,
  );
  if (index === -1) return { previous: null, next: null };
  return {
    previous: allSections[index - 1] ?? null,
    next: allSections[index + 1] ?? null,
  };
}

/** How the part is labelled in navigation: "Part 3", or the title itself
 *  for front and back matter, which carry no number. */
export function partLabel(part: Part): string {
  return part.number === null ? part.title : `Part ${part.number}`;
}

function* walkBlocks(blocks: readonly Block[]): Generator<Block> {
  for (const block of blocks) yield block;
}

/** Every exercise in the book, with the section it belongs to. */
export const allExercises: readonly {
  part: Part;
  section: Section;
  exercise: Extract<Block, { kind: "exercise" }>["exercise"];
}[] = parts.flatMap((part) =>
  part.sections.flatMap((section) =>
    [...walkBlocks(section.blocks)]
      .filter((block): block is Extract<Block, { kind: "exercise" }> =>
        block.kind === "exercise",
      )
      .map((block) => ({ part, section, exercise: block.exercise })),
  ),
);
