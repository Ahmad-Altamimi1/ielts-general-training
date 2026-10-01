/**
 * Interprets the flat document model as course content.
 *
 * The book encodes meaning in Word styles and in table shape, so the rules
 * below are the mapping, written out once:
 *
 *   Heading1              a part, or front/back matter
 *   Heading2              a section; "3.5  Title" keeps its printed number
 *   Heading3 / Heading4   a heading block
 *   ListParagraph         runs of them collapse into one list block
 *   Normal                a prose block
 *   multi-column table    a table block, first row as headers
 *   single-cell table     a callout, a passage, or a worked example,
 *                         distinguished by shape (see classifyPanel)
 *
 * Nothing here invents content. Where the book has no value for a required
 * field, the gap is reported in `warnings` rather than filled in.
 */

import type { DocNode, Para, Run, Table } from "./read-docx";
import {
  buildExercise,
  collectAnswerKeys,
  questionNumber,
  type KeyIndex,
} from "./exercises";
import type {
  Block,
  BlockOf,
  Paragraph,
  Part,
  Section,
} from "../../lib/content/schema";

/** A part before validation: `summary` comes from the printed Contents
 *  page and the book does not give one for every part. */
export type DraftPart = Omit<Part, "summary"> & { summary?: string };

export type ConvertResult = {
  parts: DraftPart[];
  /** Contents-page summaries, keyed by part id. */
  warnings: string[];
};

/* -- text ------------------------------------------------------------- */

const WHITESPACE = /[\s   ]+/g;

function tidy(text: string): string {
  return text.replace(WHITESPACE, " ").trim();
}

/** Escapes the two characters the prose renderer treats as markup. */
function escapeInline(text: string): string {
  return text.replace(/([*_\\])/g, "\\$1");
}

/**
 * Renders runs as the restricted inline markdown the schema allows: bold
 * and emphasis only. Adjacent runs with the same formatting are merged so
 * that Word's arbitrary run splits do not produce `**a****b**`.
 */
function runsToMarkdown(runs: Run[]): string {
  const merged: Run[] = [];
  for (const run of runs) {
    const last = merged.at(-1);
    if (last && last.bold === run.bold && last.italic === run.italic) {
      last.text += run.text;
    } else {
      merged.push({ ...run });
    }
  }

  let out = "";
  for (const run of merged) {
    // Formatting must wrap visible text, so move edge whitespace outside.
    const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(run.text);
    const [, before = "", core = "", after = ""] = match ?? [];
    if (core === "") {
      out += run.text;
      continue;
    }
    let piece = escapeInline(core);
    if (run.italic) piece = `*${piece}*`;
    if (run.bold) piece = `**${piece}**`;
    out += `${before}${piece}${after}`;
  }

  return tidy(out);
}

function paraText(para: Para): string {
  return tidy(para.text);
}

function cellParas(cell: Para[]): string[] {
  return cell.map(paraText).filter((t) => t !== "");
}

function cellText(cell: Para[]): string {
  return tidy(cell.map((p) => p.text).join(" "));
}

/* -- panels: single-cell tables --------------------------------------- */

type Panel =
  | { kind: "callout"; title?: string; body: string[] }
  | { kind: "passage"; title?: string; paragraphs: Paragraph[] }
  | { kind: "worked"; question: string; steps: string[]; answer: string };

function allBold(para: Para): boolean {
  return para.runs.length > 0 && para.runs.every((r) => r.bold);
}

/** The bold text at the head of a panel, which the book uses as its title.
 *  The book writes it either as its own bold paragraph or as the bold run
 *  that opens the first paragraph. */
function leadingBoldTitle(paras: Para[]): string | undefined {
  const first = paras[0];
  if (!first) return undefined;

  if (allBold(first)) {
    // A panel that is bold throughout is emphasis, not a titled panel.
    return paras.length > 1 ? paraText(first) : undefined;
  }

  const bold: string[] = [];
  for (const run of first.runs) {
    if (!run.bold) break;
    bold.push(run.text);
  }
  const title = tidy(bold.join(""));
  return title === "" ? undefined : title;
}

/** Strips a leading title from the first paragraph's text. */
function withoutTitle(paras: Para[], title: string | undefined): string[] {
  const texts = cellParas(paras);
  if (!title || texts.length === 0) return texts;
  const [first, ...rest] = texts;
  const trimmed = tidy(first.slice(title.length));
  return trimmed === "" ? rest : [trimmed, ...rest];
}

const PASSAGE_MIN_CHARS = 420;
const ANSWER_MARKER = /\bAnswer:\s*(TRUE|FALSE|NOT GIVEN|YES|NO|[A-Z]|[ivx]+)\s*$/;

/**
 * A single-cell table is one of three things in this book. The shape tells
 * you which: a worked example ends in "Answer: X"; a reading passage is
 * long and carries a bold title; anything else is a callout.
 */
function classifyPanel(paras: Para[]): Panel {
  const title = leadingBoldTitle(paras);
  const body = withoutTitle(paras, title);
  const whole = cellText(paras);

  const answerMatch = ANSWER_MARKER.exec(whole);
  if (answerMatch) {
    const withoutAnswer = tidy(whole.slice(0, answerMatch.index));
    // The question is the opening sentence; the reasoning follows it.
    const sentenceEnd = /(?<=[.?])\s+/.exec(withoutAnswer);
    const question = sentenceEnd
      ? withoutAnswer.slice(0, sentenceEnd.index + 1)
      : withoutAnswer;
    const rest = sentenceEnd
      ? withoutAnswer.slice(sentenceEnd.index + sentenceEnd[0].length)
      : "";
    const steps = rest
      .split(/(?<=\.)\s+(?=The claim:|In the text:|The comparison:|Notice |If )/)
      .map(tidy)
      .filter((s) => s !== "");
    return {
      kind: "worked",
      question,
      steps: steps.length > 0 ? steps : [rest || question],
      answer: answerMatch[1],
    };
  }

  if (title && whole.length >= PASSAGE_MIN_CHARS) {
    return {
      kind: "passage",
      title,
      paragraphs: splitPassage(body),
    };
  }

  return { kind: "callout", ...(title ? { title } : {}), body };
}

const LETTERED = /^([A-H])\s{2,}(.+)$/;

/** Recovers lettered paragraphs ("A  Some text") the exam prints so that
 *  questions can refer back to them. */
function splitPassage(texts: string[]): Paragraph[] {
  return texts.map((text) => {
    const match = LETTERED.exec(text);
    return match
      ? { label: match[1], text: tidy(match[2]) }
      : { text };
  });
}

/* -- tables ------------------------------------------------------------ */

function maxCells(table: Table): number {
  return table.rows.reduce((max, row) => Math.max(max, row.length), 0);
}

function tableBlock(table: Table): Block | null {
  const [headerRow, ...bodyRows] = table.rows;
  if (!headerRow || bodyRows.length === 0) return null;

  const columns = maxCells(table);
  const pad = (row: Para[][]) => {
    const cells = row.map(cellText);
    while (cells.length < columns) cells.push("");
    return cells.slice(0, columns);
  };

  const widths =
    table.widths.length === columns && columns > 1
      ? table.widths.map((w) => Math.round((w / Math.min(...table.widths)) * 100) / 100)
      : undefined;

  return {
    kind: "table",
    headers: pad(headerRow),
    rows: bodyRows.map(pad),
    ...(widths ? { widths } : {}),
  };
}

/* -- headings ---------------------------------------------------------- */

const PART_HEADING = /^Part\s+(\d+)\s*[:.—-]\s*(.+)$/i;
const SECTION_HEADING = /^([0-9]+\.[0-9]+|[A-Z]\.[0-9]+)\s+(.+)$/;
const CONTENTS_ENTRY = /^Part\s+(\d+)\s+(.+)$/i;

function slug(text: string): string {
  return tidy(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/* -- conversion -------------------------------------------------------- */

type Accumulator = {
  blocks: Block[];
  list: { ordered: boolean; items: string[] } | null;
  /** Numbered question paragraphs seen since the last other node. */
  questions: Para[];
  /** Third-level headings seen in this section, newest last. */
  headings: string[];
  /** How many exercises this section has already produced. */
  exerciseCount: number;
};

function emptyAccumulator(): Accumulator {
  return {
    blocks: [],
    list: null,
    questions: [],
    headings: [],
    exerciseCount: 0,
  };
}

function flushList(acc: Accumulator): void {
  if (acc.list && acc.list.items.length > 0) {
    acc.blocks.push({
      kind: "list",
      ordered: acc.list.ordered,
      items: acc.list.items,
    });
  }
  acc.list = null;
}

/** Reads the printed Contents page for the one-line part summaries. */
function readContents(nodes: DocNode[]): Map<string, string> {
  const summaries = new Map<string, string>();
  for (const node of nodes) {
    // The Contents page is the run of plain paragraphs before the first
    // heading; stop there so body text cannot be mistaken for an entry.
    if (node.type !== "para") break;
    if (node.style.startsWith("Heading")) break;
    const match = CONTENTS_ENTRY.exec(paraText(node));
    if (!match) continue;
    const [, number, rest] = match;
    // "The Test: format, scoring, and ten rules" → the part of it after ":"
    const colon = rest.indexOf(":");
    const summary = tidy(colon === -1 ? rest : rest.slice(colon + 1));
    if (summary === "") continue;
    if (number) summaries.set(`part-${number}`, summary);
  }
  return summaries;
}

/** The exercise's name. The book heads the questions themselves "Now do
 *  these", but names the task "Practice 4" a little earlier; the latter is
 *  what a student looking at a list of exercises needs to see. */
function exerciseTitle(
  headings: string[],
  instruction: string,
  fallback: string,
): string {
  const practice = [...headings].reverse().find((h) => /^Practice\b/i.test(h));
  if (practice) return practice;

  // Where the book does not name the task it labels it in the rubric —
  // "Questions 30 to 34. …" — and that label is what the student sees on
  // the page, so it is what the exercise is called.
  const range = /^Questions?\s+\d+\s+(?:to|through|[-–])\s+\d+/i.exec(
    instruction,
  );
  if (range) return range[0];

  return headings.at(-1) ?? fallback;
}

export function docxToParts(nodes: DocNode[]): ConvertResult {
  const warnings: string[] = [];
  const summaries = readContents(nodes);
  const keyIndex: KeyIndex = collectAnswerKeys(nodes);

  const parts: DraftPart[] = [];
  let part: DraftPart | null = null;
  let section: Section | null = null;
  let acc: Accumulator = emptyAccumulator();

  /**
   * Turns a run of numbered question paragraphs into an exercise block.
   *
   * The rubric immediately precedes the questions in the book, so it is
   * taken from the prose block just pushed and removed from the flow —
   * the exercise shows it verbatim, and printing it twice would be wrong.
   */
  const flushQuestions = () => {
    if (acc.questions.length === 0) return;
    const questionParas = acc.questions;
    acc.questions = [];

    if (!section) return;

    const previous = acc.blocks.at(-1);
    let instruction = "";
    if (previous?.kind === "prose") {
      acc.blocks.pop();
      instruction = previous.md.replace(/[*\\]/g, "");
    }



    const title = exerciseTitle(acc.headings, instruction, section.title);

    if (instruction === "") {
      warnings.push(
        `${section.id}: a run of ${questionParas.length} numbered questions has no rubric before it, so it cannot be marked. Left as prose.`,
      );
      for (const para of questionParas) {
        acc.blocks.push({ kind: "prose", md: runsToMarkdown(para.runs) });
      }
      return;
    }

    const result = buildExercise({
      sectionId: section.id,
      ordinal: acc.exerciseCount,
      title,
      instruction,
      questionParas,
      keys: keyIndex.get(section.id),
    });

    if (!result.ok) {
      warnings.push(result.warning);
      acc.exerciseCount += 1;
      acc.blocks.push({ kind: "prose", md: instruction });
      for (const para of questionParas) {
        acc.blocks.push({ kind: "prose", md: runsToMarkdown(para.runs) });
      }
      return;
    }

    warnings.push(...result.warnings);
    acc.blocks.push({ kind: "exercise", exercise: result.exercise });
    acc.exerciseCount += 1;
  };

  const closeSection = () => {
    flushQuestions();
    flushList(acc);
    if (!part) return;
    if (section) {
      section.blocks = acc.blocks;
      if (section.blocks.length > 0) part.sections.push(section);
      section = null;
    } else if (acc.blocks.length > 0) {
      // Prose printed under the part title, before its first section.
      part.intro = [...(part.intro ?? []), ...acc.blocks];
    }
    acc = emptyAccumulator();
  };

  const push = (block: Block) => {
    flushQuestions();
    flushList(acc);
    acc.blocks.push(block);
  };

  /**
   * The exam prints the option list for a matching or headings task after
   * the questions, in a panel of its own ("List of headings"). The schema
   * holds it on the exercise, so it is attached to the set it belongs to
   * rather than rendered as a loose callout.
   *
   * Returns false when there is no such exercise to attach it to, in which
   * case the caller keeps the panel so no content is lost.
   */
  const attachOptions = (panel: BlockOf<"callout">): boolean => {
    if (!panel.title || !/^list of\b/i.test(panel.title)) return false;
    if (panel.body.length < 2) return false;

    flushQuestions();

    for (let i = acc.blocks.length - 1; i >= 0; i--) {
      const block = acc.blocks[i];
      if (block.kind !== "exercise") continue;
      const { exercise } = block;
      if (exercise.options) return false;
      if (exercise.kind !== "headings" && exercise.kind !== "matching")
        return false;
      exercise.options = panel.body;
      return true;
    }

    return false;
  };

  for (const node of nodes) {
    // A numbered question paragraph. These come in runs, and the run as a
    // whole becomes one exercise, so collect rather than emit.
    if (node.type === "para" && questionNumber(node) !== null) {
      flushList(acc);
      acc.questions.push(node);
      continue;
    }

    if (node.type === "table") {
      const columns = maxCells(node);
      if (columns > 1) {
        const block = tableBlock(node);
        if (block) push(block);
        continue;
      }
      // Single-column: one panel per row.
      for (const row of node.rows) {
        const cell = row[0];
        if (!cell || cellText(cell) === "") continue;

        const panel = classifyPanel(cell);
        if (panel.kind === "callout" && attachOptions(panel)) continue;
        push(panel);
      }
      continue;
    }

    const text = paraText(node);

    switch (node.style) {
      case "Heading1": {
        closeSection();
        const match = PART_HEADING.exec(text);
        const id = match ? `part-${match[1]}` : slug(text);
        part = {
          id,
          number: match ? Number(match[1]) : null,
          title: match ? tidy(match[2]) : text,
          ...(summaries.has(id) ? { summary: summaries.get(id) } : {}),
          sections: [],
        };
        if (!summaries.has(id)) {
          warnings.push(
            `${id} ("${part.title}"): the book's Contents page gives no one-line summary, and \`summary\` is required. Supply one line.`,
          );
        }
        parts.push(part);
        break;
      }

      case "Heading2": {
        if (!part) break;
        closeSection();
        const match = SECTION_HEADING.exec(text);
        section = match
          ? { id: match[1].toLowerCase(), title: tidy(match[2]), blocks: [] }
          : { id: slug(text), title: text, blocks: [] };
        break;
      }

      case "Heading3":
      case "Heading4":
        if (text === "") break;
        push({
          kind: "heading",
          level: node.style === "Heading3" ? 3 : 4,
          text,
        });
        if (node.style === "Heading3") acc.headings.push(text);
        break;

      case "ListParagraph": {
        if (text === "") break;
        if (!acc.list) acc.list = { ordered: node.numbered, items: [] };
        acc.list.items.push(runsToMarkdown(node.runs));
        break;
      }

      default: {
        if (text === "") break;
        if (!part) break; // cover and Contents page: the app builds its own

        // The book writes fourth-level headings as short, fully bold
        // paragraphs with no terminal punctuation, rather than styling
        // them as Heading4. Emphasised sentences are left as prose.
        if (allBold(node) && text.length <= 80 && !/[.?!:,;]$/.test(text)) {
          push({ kind: "heading", level: 4, text });
          break;
        }

        push({ kind: "prose", md: runsToMarkdown(node.runs) });
        break;
      }
    }
  }

  closeSection();

  return { parts, warnings };
}
