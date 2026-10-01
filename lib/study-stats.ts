import { bandForRaw, nextBand, projectRaw, type Paper } from "@/lib/band";
import type { ExerciseKind } from "@/lib/content/schema";
import type { ProgressMap } from "@/lib/progress";

/* ===================================================================== *
 * What the student's record adds up to.
 *
 * Pure functions over the progress map and a flat list of exercise
 * metadata, so the whole of it is testable without a browser and none of
 * it needs the content tree on the client.
 * ===================================================================== */

/** One exercise, reduced to what the statistics need. */
export type ExerciseMeta = {
  id: string;
  title: string;
  kind: ExerciseKind;
  /** Which paper it belongs to; null for the ones that are neither. */
  paper: Paper | null;
  questionCount: number;
  partId: string;
  partLabel: string;
  sectionId: string;
  sectionTitle: string;
  href: string;
  tone: string;
};

export const KIND_LABEL: Record<ExerciseKind, string> = {
  tfng: "True / False / Not Given",
  ynng: "Yes / No / Not Given",
  mcq: "Multiple choice",
  matching: "Matching",
  gapfill: "Completion",
  headings: "Matching headings",
};

export type KindStat = {
  kind: ExerciseKind;
  label: string;
  score: number;
  total: number;
  accuracy: number;
  /** Where to go to work on it. */
  href: string;
};

export type PaperStat = {
  paper: Paper;
  score: number;
  total: number;
  /** The raw score out of 40 this accuracy projects to. */
  projected: number;
  band: number | null;
  next: { band: number; moreAnswers: number } | null;
};

export type StudyStats = {
  attempted: number;
  totalExercises: number;
  score: number;
  total: number;
  accuracy: number;
  /** Weakest question type first; only types actually attempted. */
  byKind: KindStat[];
  papers: PaperStat[];
  /** Consecutive days of practice ending today or yesterday. */
  streak: number;
  practisedToday: boolean;
  /** The next exercise with no record, or null when all are done. */
  next: ExerciseMeta | null;
};

/** The UTC day an ISO timestamp falls on, as "2026-10-02". */
function dayOf(iso: string): string | null {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toISOString().slice(0, 10);
}

function addDays(day: string, delta: number): string {
  const date = new Date(`${day}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + delta);
  return date.toISOString().slice(0, 10);
}

/**
 * Days practised in an unbroken run.
 *
 * Counted back from today, and from yesterday if nothing has been done
 * today yet — so the streak a student built does not appear to vanish
 * the moment they open the page in the morning.
 */
export function streakFrom(days: Set<string>, today: string): number {
  let cursor = days.has(today) ? today : addDays(today, -1);
  if (!days.has(cursor)) return 0;

  let count = 0;
  while (days.has(cursor)) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

export function computeStats(
  exercises: readonly ExerciseMeta[],
  progress: ProgressMap,
  now: Date = new Date(),
): StudyStats {
  const today = now.toISOString().slice(0, 10);

  let score = 0;
  let total = 0;
  let attempted = 0;
  const days = new Set<string>();

  const kinds = new Map<ExerciseKind, { score: number; total: number; href: string }>();
  const papers = new Map<Paper, { score: number; total: number }>();

  for (const exercise of exercises) {
    const record = progress[exercise.id];
    if (!record) continue;

    attempted += 1;
    score += record.score;
    total += record.total;

    const day = dayOf(record.completedAt);
    if (day) days.add(day);

    const kind = kinds.get(exercise.kind) ?? {
      score: 0,
      total: 0,
      href: exercise.href,
    };
    kind.score += record.score;
    kind.total += record.total;
    kinds.set(exercise.kind, kind);

    if (exercise.paper) {
      const paper = papers.get(exercise.paper) ?? { score: 0, total: 0 };
      paper.score += record.score;
      paper.total += record.total;
      papers.set(exercise.paper, paper);
    }
  }

  const byKind: KindStat[] = [...kinds]
    .map(([kind, stat]) => ({
      kind,
      label: KIND_LABEL[kind],
      score: stat.score,
      total: stat.total,
      accuracy: stat.total === 0 ? 0 : stat.score / stat.total,
      href: stat.href,
    }))
    // Weakest first: this list is a to-do list, not a scoreboard.
    .sort((a, b) => a.accuracy - b.accuracy);

  const paperStats: PaperStat[] = [...papers].map(([paper, stat]) => {
    const projected = projectRaw(stat.score, stat.total);
    return {
      paper,
      score: stat.score,
      total: stat.total,
      projected,
      band: bandForRaw(projected, paper),
      next: nextBand(projected, paper),
    };
  });

  return {
    attempted,
    totalExercises: exercises.length,
    score,
    total,
    accuracy: total === 0 ? 0 : score / total,
    byKind,
    papers: paperStats,
    streak: streakFrom(days, today),
    practisedToday: days.has(today),
    next: exercises.find((e) => !progress[e.id]) ?? null,
  };
}
