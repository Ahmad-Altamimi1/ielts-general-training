import type { Paper } from "@/lib/band";
import { allExercises, partLabel, sectionHref } from "@/lib/content/registry";
import { toneFor } from "@/lib/content/tone";
import type { ExerciseMeta } from "@/lib/study-stats";

/**
 * Which paper an exercise belongs to.
 *
 * Read off the book: Part 2 is Listening and Part 3 is Reading, and the
 * practice bank and the practice test name the paper in the section
 * title ("Listening practice 3", "Reading practice 5"). Anything that is
 * neither — Writing, Speaking, Grammar — has no raw-score band to project
 * and is left out of that calculation.
 */
function paperFor(
  partId: string,
  sectionId: string,
  sectionTitle: string,
): Paper | null {
  const title = sectionTitle.toLowerCase();
  if (title.includes("listening")) return "listening";
  if (title.includes("reading")) return "reading";
  if (partId === "part-2") return "listening";
  if (partId === "part-3") return "reading";
  if (sectionId === "listening") return "listening";
  if (sectionId === "reading") return "reading";
  return null;
}

/** Every exercise in book order, reduced to what the client needs. */
export function exerciseMetas(): ExerciseMeta[] {
  return allExercises.map(({ part, section, exercise }) => ({
    id: exercise.id,
    title: exercise.title,
    kind: exercise.kind,
    paper: paperFor(part.id, section.id, section.title),
    questionCount: exercise.questions.length,
    partId: part.id,
    partLabel: partLabel(part),
    sectionId: section.id,
    sectionTitle: section.title,
    href: `${sectionHref(part.id, section.id)}#${exercise.id}-title`,
    tone: toneFor(part.id),
  }));
}
