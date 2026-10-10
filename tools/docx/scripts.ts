/**
 * Reads the listening scripts out of Appendix A.
 *
 * The book keeps them at the back, away from the units, "so that students
 * do not see them in advance". The converter preserves that separation:
 * a script is attached to the section whose questions it belongs to, and
 * the app keeps it hidden until it is asked for.
 *
 * Appendix A is absent from the .docx as supplied. Everything here is
 * driven by the headings the book already uses for Appendix B, so adding
 * the appendix to the book is all that is needed — no code changes.
 */

import type { DocNode, Para } from "./read-docx";
import type { BlockOf } from "../../lib/content/schema";

/** Appendix A section id → the section whose questions it is read for.
 *  The same correspondence as KEYED_SECTION in exercises.ts, for the
 *  listening units only. */
export const SCRIPT_SECTION: Record<string, string> = {
  "a.1": "2.3",
  "a.2": "2.4",
  "a.3": "10.1",
  "a.4": "10.2",
  "a.5": "listening", // Practice Test 1, section 1
  "a.6": "listening",
  "a.7": "listening",
  "a.8": "listening",
};

export type ScriptBlock = BlockOf<"script">;

/** section id → the scripts read for it, in order. */
export type ScriptIndex = Map<string, ScriptBlock[]>;

const WHITESPACE = /[\s   ]+/g;

function tidy(text: string): string {
  return text.replace(WHITESPACE, " ").trim();
}

const APPENDIX_HEADING = /^(A\.[0-9]+)\s+(.+)$/i;

/** "Recording 3, a tutorial" → "Recording 3". */
const RECORDING = /\b(Recording\s+\d+)\b/i;

/** The book writes a speaker turn as "RECEPTIONIST: Good morning." or
 *  "Receptionist: Good morning." — a short name, then a colon. */
const SPEAKER = /^([A-Z][A-Za-z' -]{1,24}):\s*(.+)$/;

function lineFrom(para: Para): ScriptBlock["lines"][number] | null {
  const text = tidy(para.text);
  if (text === "") return null;

  const match = SPEAKER.exec(text);
  if (match) {
    const body = tidy(match[2]);
    if (body === "") return null;
    return { speaker: tidy(match[1]), text: body };
  }
  return { text };
}

/** Reads every script in Appendix A, grouped by the section it is for. */
export function collectScripts(nodes: DocNode[]): ScriptIndex {
  const index: ScriptIndex = new Map();

  let target: string | null = null;
  let current: ScriptBlock | null = null;

  const close = () => {
    if (target && current && current.lines.length > 0) {
      index.set(target, [...(index.get(target) ?? []), current]);
    }
    current = null;
  };

  for (const node of nodes) {
    if (node.type !== "para") {
      // A script read from a table cell still counts as script text.
      if (!current) continue;
      for (const row of node.rows) {
        for (const cell of row) {
          for (const para of cell) {
            const line = lineFrom(para);
            if (line) current.lines.push(line);
          }
        }
      }
      continue;
    }

    const text = tidy(node.text);

    if (node.style === "Heading1") {
      // Any top-level heading — the appendix's own, or the part after it —
      // ends the script that was being read.
      close();
      target = null;
      continue;
    }

    if (node.style === "Heading2") {
      close();
      const match = APPENDIX_HEADING.exec(text);
      const id = match?.[1].toLowerCase();
      target = id ? (SCRIPT_SECTION[id] ?? null) : null;
      if (target && match) {
        const title = tidy(match[2]);
        const recording = RECORDING.exec(title)?.[1];
        current = {
          kind: "script",
          title,
          ...(recording ? { recording: tidy(recording) } : {}),
          lines: [],
        };
      }
      continue;
    }

    if (!current) continue;
    if (node.style.startsWith("Heading")) continue;

    const line = lineFrom(node);
    if (line) current.lines.push(line);
  }

  close();
  return index;
}
