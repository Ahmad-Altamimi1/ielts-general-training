import { getSection } from "@/lib/content/registry";

/* ===================================================================== *
 * Raw score to band.
 *
 * Read off the book's own table in section 1.2 rather than copied here,
 * so the two can never disagree: fix the book, run `npm run content`, and
 * this follows.
 *
 * The book's point about that table is the whole reason this file exists:
 * the gap between band 5 and band 6 in Reading is seven answers. A
 * student who can see which seven, and how far away they are, has a
 * reason to do the next exercise.
 * ===================================================================== */

export type Paper = "listening" | "reading";

export type BandStep = {
  band: number;
  /** Correct answers out of 40 needed for this band. */
  listening: number;
  reading: number;
};

/** Every question in Listening and Reading is one mark out of forty. */
export const QUESTIONS_PER_PAPER = 40;

function parseScale(): BandStep[] {
  const found = getSection("part-1", "1.2");
  if (!found) return [];

  const table = found.section.blocks.find(
    (block) =>
      block.kind === "table" && block.headers[0]?.toLowerCase() === "band",
  );
  if (!table || table.kind !== "table") return [];

  const column = (prefix: string) =>
    table.headers.findIndex((h) => h.toLowerCase().startsWith(prefix));

  const listeningAt = column("listening");
  const readingAt = column("gt reading");
  if (listeningAt === -1 || readingAt === -1) return [];

  return table.rows
    .map((row) => ({
      band: Number.parseFloat(row[0]),
      listening: Number.parseInt(row[listeningAt] ?? "", 10),
      reading: Number.parseInt(row[readingAt] ?? "", 10),
    }))
    .filter(
      (step) =>
        Number.isFinite(step.band) &&
        Number.isFinite(step.listening) &&
        Number.isFinite(step.reading),
    )
    .sort((a, b) => a.band - b.band);
}

export const bandScale: readonly BandStep[] = parseScale();

function threshold(step: BandStep, paper: Paper): number {
  return paper === "listening" ? step.listening : step.reading;
}

/** The band a raw score out of 40 earns, or null below the lowest step
 *  the book prints. */
export function bandForRaw(raw: number, paper: Paper): number | null {
  let best: number | null = null;
  for (const step of bandScale) {
    if (raw >= threshold(step, paper)) best = step.band;
  }
  return best;
}

/** The raw score a band needs. */
export function rawForBand(band: number, paper: Paper): number | null {
  const step = bandScale.find((s) => s.band === band);
  return step ? threshold(step, paper) : null;
}

/**
 * What this accuracy would be worth over a whole paper.
 *
 * An estimate, and labelled as one everywhere it is shown: these are
 * practice sets, not a timed forty-question paper. It answers the only
 * question the student is actually asking.
 */
export function projectRaw(score: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((score / total) * QUESTIONS_PER_PAPER);
}

export type NextStep = {
  /** The band above the one the student is projected to hold. */
  band: number;
  /** How many more of forty they would need to get right. */
  moreAnswers: number;
};

/** The next rung up, and how far away it is in answers. */
export function nextBand(raw: number, paper: Paper): NextStep | null {
  for (const step of bandScale) {
    const needed = threshold(step, paper);
    if (raw < needed) return { band: step.band, moreAnswers: needed - raw };
  }
  return null;
}

/** The bands the book prints, lowest first — for a target picker. */
export const availableBands: readonly number[] = bandScale.map((s) => s.band);
