/**
 * The hue each part carries.
 *
 * A student moving between Listening and Reading should be able to tell
 * which paper they are in before reading a word, so each part is tied to
 * the skill it teaches rather than to its number. Writing's two parts
 * share a hue because they are one paper.
 *
 * The values are the keys of the `data-tone` rules in globals.css.
 */
export type Tone =
  | "slate"
  | "violet"
  | "blue"
  | "amber"
  | "rose"
  | "teal"
  | "emerald"
  | "cyan";

const BY_PART: Record<string, Tone> = {
  "part-1": "slate", // The test itself
  "part-2": "violet", // Listening
  "part-3": "blue", // Reading
  "part-4": "amber", // Writing Task 1
  "part-5": "amber", // Writing Task 2
  "part-6": "rose", // Speaking
  "part-7": "teal", // Grammar
  "part-8": "emerald", // Vocabulary
  "part-9": "slate", // Study plan
  "part-10": "cyan", // Practice bank
  "part-11": "rose", // Practice test
};

/** What the part teaches, for the badge on its card. */
const SKILL: Record<string, string> = {
  "part-2": "Listening",
  "part-3": "Reading",
  "part-4": "Writing",
  "part-5": "Writing",
  "part-6": "Speaking",
};

export function toneFor(partId: string): Tone {
  return BY_PART[partId] ?? "blue";
}

export function skillFor(partId: string): string | null {
  return SKILL[partId] ?? null;
}
