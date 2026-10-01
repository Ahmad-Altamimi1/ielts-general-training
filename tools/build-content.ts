/**
 * Turns the Word book into the content modules under `content/`.
 *
 *   npm run content             -- convert every part
 *   npm run content -- part-1   -- convert only the parts named
 *
 * The .docx is the source of truth. Files under `content/` are generated,
 * so fix the book and re-run rather than editing them by hand.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

import { readDocx } from "./docx/read-docx";
import { docxToParts, type DraftPart } from "./docx/to-content";
import { partSchema, type Block } from "../lib/content/schema";
import { SEARCH_INDEX_PATH, type SearchEntry } from "../lib/search/types";

const DEFAULT_DOCX = "C:\\Users\\ASUS\\Downloads\\IELTS-GT-Student-Book.docx";
const CONTENT_DIR = join(process.cwd(), "content");
const PUBLIC_DIR = join(process.cwd(), "public");

const GENERATED_HEADER = `// Generated from the Word book by \`npm run content\`. Do not edit by hand:
// change the book and re-run, or your edit is lost on the next build.
`;

function moduleName(part: DraftPart): string {
  return part.id;
}

function emitPart(part: DraftPart): string {
  return `${GENERATED_HEADER}
import type { Part } from "@/lib/content/schema";

const part: Part = ${JSON.stringify(part, null, 2)};

export default part;
`;
}

function emitIndex(parts: DraftPart[]): string {
  const imports = parts
    .map((p, i) => `import part${i} from "./${moduleName(p)}";`)
    .join("\n");
  const list = parts.map((_, i) => `  part${i},`).join("\n");

  return `${GENERATED_HEADER}
import type { Part } from "@/lib/content/schema";

${imports}

/** Every part, in the order the book prints them. */
export const parts: Part[] = [
${list}
];
`;
}

/** The searchable text of a block, in reading order. */
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

/** Keeps the index small enough to fetch on the first Cmd+K and no larger. */
const MAX_TEXT_PER_SECTION = 1200;

function buildSearchIndex(parts: DraftPart[]): SearchEntry[] {
  return parts.flatMap((part) =>
    part.sections.map((section) => ({
      href: `/${part.id}/${encodeURIComponent(section.id)}`,
      partLabel: part.number === null ? part.title : `Part ${part.number}`,
      sectionId: section.id,
      sectionTitle: section.title,
      text: section.blocks
        .flatMap(blockText)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, MAX_TEXT_PER_SECTION)
        .toLowerCase(),
    })),
  );
}

function main(): void {
  const args = process.argv.slice(2);
  const docxPath = args.find((a) => a.endsWith(".docx")) ?? DEFAULT_DOCX;
  const wanted = new Set(args.filter((a) => !a.endsWith(".docx")));

  const nodes = readDocx(docxPath);
  const { parts, warnings } = docxToParts(nodes);

  const selected =
    wanted.size > 0 ? parts.filter((p) => wanted.has(p.id)) : parts;

  if (selected.length === 0) {
    console.error(
      `No parts matched. The book contains: ${parts.map((p) => p.id).join(", ")}`,
    );
    process.exit(1);
  }

  const valid: DraftPart[] = [];
  const failures: string[] = [];

  for (const draft of selected) {
    const result = partSchema.safeParse(draft);
    if (result.success) {
      valid.push(draft);
      continue;
    }
    const issues = result.error.issues
      .map((i) => `      ${i.path.join(".") || "(root)"}: ${i.message}`)
      .join("\n");
    failures.push(`  ${draft.id}\n${issues}`);
  }

  mkdirSync(CONTENT_DIR, { recursive: true });
  for (const part of valid) {
    writeFileSync(
      join(CONTENT_DIR, `${moduleName(part)}.ts`),
      emitPart(part),
      "utf8",
    );
  }
  writeFileSync(join(CONTENT_DIR, "index.ts"), emitIndex(valid), "utf8");

  mkdirSync(PUBLIC_DIR, { recursive: true });
  const index = buildSearchIndex(valid);
  writeFileSync(
    join(PUBLIC_DIR, SEARCH_INDEX_PATH.replace(/^\//, "")),
    JSON.stringify(index),
    "utf8",
  );

  for (const part of valid) {
    const sections = part.sections.length;
    const blocks =
      (part.intro?.length ?? 0) +
      part.sections.reduce((n, s) => n + s.blocks.length, 0);
    console.log(
      `  wrote content/${moduleName(part)}.ts  ${sections} sections, ${blocks} blocks`,
    );
  }

  console.log(
    `  wrote public${SEARCH_INDEX_PATH}  ${index.length} sections indexed`,
  );

  if (warnings.length > 0) {
    console.log(`\nGaps in the book (not filled in, as instructed):`);
    for (const w of warnings) console.log(`  - ${w}`);
  }

  if (failures.length > 0) {
    console.error(`\nParts that do not satisfy the schema:\n${failures.join("\n")}`);
    console.error(
      `\n${failures.length} part(s) skipped. The content above was still written.`,
    );
    process.exit(1);
  }
}

main();
