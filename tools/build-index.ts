/**
 * Writes the search index that Cmd+K reads.
 *
 *   npm run index
 *
 * It is built from the registry — the book's generated parts *and* the
 * parts written for the app, such as the Listening Lab — because the
 * student searching for "memory palace" does not know or care which of
 * those a section came from.
 *
 * It deliberately does not read the .docx. The index has to be rebuildable
 * from a clean checkout, and the book is not in the repository.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { partLabel, parts } from "../lib/content/registry";
import type { Block, Part } from "../lib/content/schema";
import { SEARCH_INDEX_PATH, type SearchEntry } from "../lib/search/types";

const PUBLIC_DIR = join(process.cwd(), "public");

/** Keeps the index small enough to fetch on the first Cmd+K and no larger. */
const MAX_TEXT_PER_SECTION = 1200;

/** Everything in a block that a student might search for. Answers and the
 *  explanations behind them are left out on purpose: searching should not
 *  be a way to read the key. */
function blockText(block: Block): string[] {
  switch (block.kind) {
    case "prose":
      return [block.md.replace(/[*\\]/g, "")];
    case "heading":
      return [block.text];
    case "list":
      return block.items.map((i) => i.replace(/[*\\]/g, ""));
    case "callout":
      return [block.title ?? "", ...block.body];
    case "table":
      return [...block.headers, ...block.rows.flat()];
    case "passage":
      return [block.title ?? "", ...block.paragraphs.map((p) => p.text)];
    case "script":
      return [block.title, ...block.lines.map((l) => l.text)];
    case "worked":
      return [block.question, ...block.steps];
    case "exercise":
      return [
        block.exercise.title,
        block.exercise.instruction,
        ...block.exercise.questions.map((q) => q.prompt),
      ];
  }
}

function entriesFor(part: Part): SearchEntry[] {
  return part.sections.map((section) => ({
    href: `/${part.id}/${encodeURIComponent(section.id)}`,
    partLabel: partLabel(part),
    sectionId: section.id,
    sectionTitle: section.title,
    text: section.blocks
      .flatMap(blockText)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, MAX_TEXT_PER_SECTION)
      .toLowerCase(),
  }));
}

const index = parts.flatMap(entriesFor);

mkdirSync(PUBLIC_DIR, { recursive: true });
writeFileSync(
  join(PUBLIC_DIR, SEARCH_INDEX_PATH.replace(/^\//, "")),
  JSON.stringify(index),
  "utf8",
);

const bytes = JSON.stringify(index).length;
console.log(
  `  wrote public${SEARCH_INDEX_PATH}  ${index.length} sections from ${parts.length} parts, ${(bytes / 1024).toFixed(0)} KB`,
);
