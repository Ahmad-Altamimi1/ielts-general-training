/**
 * Builds machine-markable exercises out of the book.
 *
 * The book separates the two halves of an exercise: the questions sit in
 * the unit, the answers and their explanations sit in the appendix at the
 * back, so that a student does not see the key while working. Joining them
 * is this module's whole job.
 *
 * The link between the two is stated in prose in the book ("keys are in
 * Appendix B"), and the appendix headings name their targets — "B.4
 * Practice 4: True, False, Not Given" keys the set in section 3.5. That
 * correspondence is written out in KEYED_SECTION below: it is read off the
 * book, not invented, and it is the one thing to update if the book gains
 * a unit.
 */

import type { DocNode, Para, Table } from "./read-docx";
import type { Exercise, ExerciseKind, Question } from "../../lib/content/schema";

/** Appendix section id → the section whose questions it keys. */
const KEYED_SECTION: Record<string, string> = {
  "b.1": "2.3",
  "b.2": "2.4",
  "b.3": "3.4",
  "b.4": "3.5",
  "b.5": "3.13",
  "b.6": "10.1",
  "b.7": "10.2",
  "b.8": "10.3",
  "b.9": "10.4",
};

export type AnswerKey = {
  /** Every accepted form, already split out of the book's notation. */
  answers: string[];
  /** The explanation. Empty when the book prints none. */
  why: string;
};

/** section id → question number → key. */
export type KeyIndex = Map<string, Map<number, AnswerKey>>;

const WHITESPACE = /[\s   ]+/g;

function tidy(text: string): string {
  return text.replace(WHITESPACE, " ").trim();
}

function cellText(cell: Para[]): string {
  return tidy(cell.map((p) => p.text).join(" "));
}

/**
 * Expands the book's answer notation into the explicit list the schema
 * wants. The book writes alternatives two ways:
 *
 *   "FIFTEEN / 15"              two accepted answers
 *   "(A) MEDICAL CERTIFICATE"   accepted with or without the article
 *
 * A bare slash with no spaces around it is left alone, because that is a
 * date — "14/3" is one answer, not two.
 */
export function expandAnswers(raw: string): string[] {
  const parts = tidy(raw)
    .split(/\s+\/\s+/)
    .map(tidy)
    .filter((p) => p !== "");

  const out: string[] = [];
  for (const part of parts) {
    const optional = /^\((a|an|the)\)\s+(.+)$/i.exec(part);
    if (optional) {
      out.push(tidy(optional[2]));
      out.push(`${optional[1]} ${tidy(optional[2])}`);
    } else {
      out.push(part);
    }
  }

  return [...new Set(out)];
}

/** Finds a column by what its header starts with. */
function columnIndex(headers: string[], prefix: string): number {
  return headers.findIndex((h) => h.toLowerCase().startsWith(prefix));
}

function readKeyTable(table: Table, into: Map<number, AnswerKey>): void {
  const [headerRow, ...bodyRows] = table.rows;
  if (!headerRow) return;

  const headers = headerRow.map(cellText);
  const qAt = columnIndex(headers, "q");
  const keyAt = columnIndex(headers, "key");
  if (qAt === -1 || keyAt === -1) return;

  const whyAt = Math.max(
    columnIndex(headers, "why"),
    columnIndex(headers, "note"),
  );

  // B.7 prints two question/key pairs per row: Q | Key | Q | Key.
  const pairs: { q: number; key: number }[] = [];
  for (let i = 0; i < headers.length; i++) {
    if (headers[i].toLowerCase().startsWith("q")) {
      const next = headers
        .slice(i + 1)
        .findIndex((h) => h.toLowerCase().startsWith("key"));
      if (next !== -1) pairs.push({ q: i, key: i + 1 + next });
    }
  }

  for (const row of bodyRows) {
    const cells = row.map(cellText);
    for (const pair of pairs) {
      const n = Number.parseInt(cells[pair.q] ?? "", 10);
      const answer = cells[pair.key];
      if (!Number.isInteger(n) || !answer) continue;
      into.set(n, {
        answers: expandAnswers(answer),
        why: whyAt === -1 ? "" : (cells[whyAt] ?? ""),
      });
    }
  }
}

const APPENDIX_HEADING = /^([A-Z]\.[0-9]+)\s+(.+)$/;

/** Reads every answer-key table in the appendix, grouped by the section
 *  whose questions it keys. */
export function collectAnswerKeys(nodes: DocNode[]): KeyIndex {
  const index: KeyIndex = new Map();
  let target: string | null = null;

  for (const node of nodes) {
    if (node.type === "para") {
      if (node.style === "Heading2") {
        const match = APPENDIX_HEADING.exec(tidy(node.text));
        const appendixId = match?.[1].toLowerCase();
        target = appendixId ? (KEYED_SECTION[appendixId] ?? null) : null;
      } else if (node.style === "Heading1") {
        target = null;
      }
      continue;
    }

    if (!target) continue;
    const bucket = index.get(target) ?? new Map<number, AnswerKey>();
    readKeyTable(node, bucket);
    if (bucket.size > 0) index.set(target, bucket);
  }

  return index;
}

/* -- reading the questions out of a unit ------------------------------- */

/** The book sets a question number as its own bold run in the accent
 *  colour, which makes the start of a question unambiguous. */
const ACCENT = "1A4E8A";
const QUESTION_NUMBER = /^(\d{1,2})[.)]$/;

export function questionNumber(para: Para): number | null {
  const first = para.runs[0];
  if (!first || !first.bold) return null;
  if (first.color !== ACCENT) return null;
  const match = QUESTION_NUMBER.exec(tidy(first.text));
  return match ? Number(match[1]) : null;
}

export function isQuestion(node: DocNode): boolean {
  return node.type === "para" && questionNumber(node) !== null;
}

/** The prompt is everything after the number. */
export function draftFromParagraph(para: Para): QuestionDraft | null {
  const n = questionNumber(para);
  if (n === null) return null;
  const prompt = tidy(para.runs.slice(1).map((r) => r.text).join(""));
  return prompt === "" ? null : { n, prompt };
}

const MCQ_CHOICE = /^([A-H])[.)]?\s+(.+)$/;

/* -- reading the questions out of a panel ------------------------------ *
 * The book writes questions three ways. Numbered paragraphs are one (see
 * above). The other two live inside a bordered panel that reproduces the
 * exam page:
 *
 *   a form or set of notes   "Caller's family name:  1  .........."
 *   multiple choice          "11 The library is open until 10pm"
 *                            "A every day of the week."
 *
 * In both the number is plain text in the middle of a line, so the accent
 * colour is no help and the shape of the line has to be read instead.
 * ---------------------------------------------------------------------- */

/** A numbered gap: the question number followed by a printed rule. */
const GAP = /(?:^|\s)(\d{1,2})\s+\.{4,}/g;
const NUMBERED_LINE = /^(\d{1,2})[.)]?\s+(.+)$/;
const RUBRIC =
  /\b(complete the|choose the correct|write no more than|write the correct|write true|write yes|label the|which paragraph|answer the questions|choose from the list|there are more|match each|match the|look at the following|using words from)\b/i;

/** "Questions 6 to 10", the label the exam prints above a set. */
const SET_LABEL = /^Questions?\s+\d+\s+(?:to|[-–])\s+\d+\.?$/i;

/** A word box: the shortlist a summary-completion task is filled from. */
const BOX = /^BOX\s*:\s*(.*)$/i;

export type QuestionDraft = {
  n: number;
  prompt: string;
  choices?: { id: string; text: string }[];
};

export type PanelExercise = {
  instruction: string;
  questions: QuestionDraft[];
  /** A shared option list printed above the questions, as a matching task
   *  prints "A It is well written and needs no change.", or the word box
   *  a summary-completion task is filled from. */
  options?: string[];
  /** "Questions 6 to 10", when the exam prints that label. */
  label?: string;
};

/** The printed rule a student writes on becomes an ellipsis, so the prompt
 *  reads as a sentence with a gap in it. */
function markGaps(text: string): string {
  return tidy(text.replace(/\.{4,}/g, " …"));
}

/**
 * Reads an exam-page panel as a set of questions.
 *
 * Returns null when the panel is not one — a callout, a passage, a worked
 * example — which is most of them.
 */
export function extractPanelExercise(paras: Para[]): PanelExercise | null {
  const instruction: string[] = [];
  const questions: QuestionDraft[] = [];
  const sharedOptions: string[] = [];
  const box: string[] = [];
  let label: string | undefined;
  let inBox = false;
  let current: QuestionDraft | null = null;

  for (const para of paras) {
    const text = tidy(para.text);
    if (text === "") continue;

    // The word box runs on over several lines until the next rubric or
    // question, and the task cannot be answered without it.
    const boxStart = BOX.exec(text);
    if (boxStart) {
      inBox = true;
      box.push(boxStart[1]);
      current = null;
      continue;
    }
    if (inBox) {
      if (RUBRIC.test(text) || NUMBERED_LINE.test(text) || SET_LABEL.test(text)) {
        inBox = false;
      } else {
        box.push(text);
        continue;
      }
    }

    if (SET_LABEL.test(text)) {
      label ??= text.replace(/\.$/, "");
      current = null;
      continue;
    }

    const choice = MCQ_CHOICE.exec(text);
    if (choice && !NUMBERED_LINE.test(text)) {
      if (current) {
        // An option line under a question belongs to that question.
        (current.choices ??= []).push({ id: choice[1], text: tidy(choice[2]) });
      } else if (questions.length === 0) {
        // An option line before any question is the shared list that a
        // matching task is answered from.
        sharedOptions.push(text);
      }
      continue;
    }

    const gaps = [...text.matchAll(GAP)];
    if (gaps.length > 0) {
      // The whole line is the prompt, so the student can see where the
      // answer goes and what sits either side of it.
      const prompt = markGaps(text.replace(GAP, " …"));
      for (const gap of gaps) {
        current = { n: Number(gap[1]), prompt };
        questions.push(current);
      }
      continue;
    }

    if (RUBRIC.test(text)) {
      instruction.push(text);
      current = null;
      continue;
    }

    const numbered = NUMBERED_LINE.exec(text);
    if (numbered) {
      current = { n: Number(numbered[1]), prompt: markGaps(numbered[2]) };
      questions.push(current);
      continue;
    }

    // A heading, a caption, or the panel's own title.
    current = null;
  }

  if (questions.length === 0 || instruction.length === 0) return null;

  const boxWords = box.join(" ").split(/\s+/).filter((w) => w !== "");
  const options =
    sharedOptions.length >= 2
      ? sharedOptions
      : boxWords.length >= 2
        ? boxWords
        : undefined;

  return {
    instruction: instruction.join(" "),
    questions,
    ...(options ? { options } : {}),
    ...(label ? { label } : {}),
  };
}

/* -- the rubric -------------------------------------------------------- */

const NUMBER_WORDS: Record<string, number> = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  eleven: 11,
  twelve: 12,
  fifteen: 15,
  twenty: 20,
  thirty: 30,
  sixty: 60,
};

/** "You have six minutes" → 360. Only what the book actually states. */
export function timeLimitFrom(instruction: string): number | undefined {
  const match = /\b(\d+|[a-z]+)\s+minutes?\b/i.exec(instruction);
  if (!match) return undefined;
  const token = match[1].toLowerCase();
  const value = /^\d+$/.test(token) ? Number(token) : NUMBER_WORDS[token];
  return value ? value * 60 : undefined;
}

export function kindFrom(
  instruction: string,
  hasChoices: boolean,
): ExerciseKind {
  const text = instruction.toLowerCase();
  if (text.includes("not given")) {
    return text.includes("yes") && text.includes("no, ") ? "ynng" : "tfng";
  }
  if (/\byes\b.*\bno\b.*not given/.test(text)) return "ynng";
  if (text.includes("list of headings") || text.includes("correct heading"))
    return "headings";
  // "Choose the correct letter, A, B or C" with the options printed under
  // each question is multiple choice; the same words with one shared set
  // of lettered sources is a matching task.
  if (/\b(choose|write) the correct letter\b/.test(text))
    return hasChoices ? "mcq" : "matching";
  if (hasChoices) return "mcq";
  if (text.includes("match") || text.includes("choose from the list"))
    return "matching";
  return "gapfill";
}

/**
 * Recovers the option set from a rubric that names it inline, as in
 * "Write the correct letter, A, B, C or D". The exam does not always
 * print a separate list, and the schema needs one for a matching task.
 */
export function optionsFromInstruction(instruction: string): string[] | undefined {
  const match =
    /\bletter,?\s+([A-H](?:\s*,\s*[A-H])*(?:\s*,?\s*or\s+[A-H])?)\b/i.exec(
      instruction,
    );
  if (!match) return undefined;
  const letters = match[1].toUpperCase().match(/[A-H]/g) ?? [];
  return letters.length >= 2 ? [...new Set(letters)] : undefined;
}

/* -- assembling an exercise -------------------------------------------- */

export type BuildInput = {
  /** The section the questions appear in, e.g. "3.5". */
  sectionId: string;
  /** A stable, unique suffix when a section holds more than one set. */
  ordinal: number;
  title: string;
  instruction: string;
  /** Questions already read out of whichever shape the book used. */
  drafts: QuestionDraft[];
  options?: string[];
  keys: Map<number, AnswerKey> | undefined;
};

export type BuildResult =
  | { ok: true; exercise: Exercise; warnings: string[] }
  | { ok: false; warning: string };

export function buildExercise(input: BuildInput): BuildResult {
  const { sectionId, ordinal, title, instruction, drafts, keys } = input;

  const id = ordinal === 0 ? `ex-${sectionId}` : `ex-${sectionId}-${ordinal + 1}`;

  if (!keys || keys.size === 0) {
    return {
      ok: false,
      warning: `${id} ("${title}"): the book prints no answer key for section ${sectionId}, so the set cannot be marked. Questions left as prose.`,
    };
  }

  const questions: Question[] = [];
  const missing: number[] = [];
  const unexplained: number[] = [];

  for (const draft of drafts) {
    const key = keys.get(draft.n);
    if (!key) {
      missing.push(draft.n);
      continue;
    }
    // `why` is the point of the whole exercise and is never invented, so
    // a question the appendix does not explain is left out of the set.
    if (key.why.trim() === "") {
      unexplained.push(draft.n);
      continue;
    }
    if (draft.prompt === "") continue;

    questions.push({
      n: draft.n,
      prompt: draft.prompt,
      answers: key.answers,
      why: key.why,
      ...(draft.choices && draft.choices.length >= 2
        ? { choices: draft.choices }
        : {}),
    });
  }

  if (questions.length === 0) {
    const reason =
      unexplained.length > 0
        ? `the appendix prints keys but no explanations for question(s) ${unexplained.join(", ")}, and \`why\` is required`
        : `no question could be paired with a key`;
    return {
      ok: false,
      warning: `${id} ("${title}"): ${reason}. Questions left as prose.`,
    };
  }

  const warnings: string[] = [];
  if (missing.length > 0) {
    warnings.push(
      `${id}: the appendix has no key for question(s) ${missing.join(", ")}; they are left out of the marked set.`,
    );
  }
  if (unexplained.length > 0) {
    warnings.push(
      `${id}: the appendix gives no explanation for question(s) ${unexplained.join(", ")}. \`why\` is required and was not invented, so they are left out of the marked set.`,
    );
  }

  const kind = kindFrom(
    instruction,
    questions.some((q) => q.choices !== undefined),
  );
  const timeLimitSeconds = timeLimitFrom(instruction);
  const options =
    input.options ??
    (kind === "matching" ? optionsFromInstruction(instruction) : undefined);

  const exercise: Exercise = {
    id,
    title,
    instruction,
    kind,
    ...(timeLimitSeconds ? { timeLimitSeconds } : {}),
    ...(options ? { options } : {}),
    questions,
  };

  return { ok: true, exercise, warnings };
}

export { MCQ_CHOICE, KEYED_SECTION };
