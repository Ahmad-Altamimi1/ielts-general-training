/**
 * Reads a .docx into a flat, ordered document model.
 *
 * Deliberately dumb: it extracts what Word actually stored — paragraph
 * style, run formatting, table grid — and makes no decisions about what
 * any of it means. Interpretation belongs in `to-content.ts`, so that the
 * two concerns can be debugged separately.
 */

import { readFileSync } from "node:fs";
import { unzipSync, strFromU8 } from "fflate";
import { DOMParser } from "@xmldom/xmldom";

export type Run = {
  text: string;
  bold: boolean;
  italic: boolean;
  /** Upper-case hex, no "#". The book colours question numbers `1A4E8A`. */
  color: string | null;
};

export type Para = {
  /** Word's style id: "Heading1", "ListParagraph", "Normal". */
  style: string;
  /** True when the paragraph carries Word list numbering. */
  numbered: boolean;
  runs: Run[];
  /** All run text concatenated, with whitespace left intact. */
  text: string;
};

export type Table = {
  type: "table";
  /** Row → cell → the paragraphs in that cell. */
  rows: Para[][][];
  /** Relative column widths from `w:tblGrid`, in twips. */
  widths: number[];
};

export type DocNode = ({ type: "para" } & Para) | Table;

const ELEMENT_NODE = 1;

function children(node: Node): Element[] {
  const out: Element[] = [];
  for (let i = 0; i < node.childNodes.length; i++) {
    const child = node.childNodes[i];
    if (child.nodeType === ELEMENT_NODE) out.push(child as Element);
  }
  return out;
}

function firstChild(node: Element, tag: string): Element | null {
  return children(node).find((c) => c.nodeName === tag) ?? null;
}

function descendant(node: Element, tag: string): Element | null {
  const found = node.getElementsByTagName(tag);
  return found.length > 0 ? (found[0] as Element) : null;
}

/** OOXML toggle properties are on when present unless explicitly `w:val="0"`. */
function toggleOn(props: Element | null, tag: string): boolean {
  if (!props) return false;
  const el = firstChild(props, tag);
  if (!el) return false;
  const val = el.getAttribute("w:val");
  return val === null || !["0", "false", "off"].includes(val);
}

function readRun(r: Element): Run[] {
  const props = firstChild(r, "w:rPr");
  const bold = toggleOn(props, "w:b");
  const italic = toggleOn(props, "w:i");
  const colorEl = props ? firstChild(props, "w:color") : null;
  const rawColor = colorEl?.getAttribute("w:val") ?? null;
  const color =
    rawColor && rawColor !== "auto" ? rawColor.toUpperCase() : null;

  const pieces: string[] = [];
  for (const node of children(r)) {
    switch (node.nodeName) {
      case "w:t":
        pieces.push(node.textContent ?? "");
        break;
      case "w:tab":
        pieces.push("\t");
        break;
      case "w:br":
        pieces.push("\n");
        break;
      case "w:sym": {
        // A bullet or dingbat stored as a Symbol-font codepoint.
        const hex = node.getAttribute("w:char");
        if (hex) {
          const code = Number.parseInt(hex, 16);
          // Symbol F0B7 is a bullet; map the private-use range onto it.
          pieces.push(code >= 0xf000 ? "•" : String.fromCodePoint(code));
        }
        break;
      }
      default:
        break;
    }
  }

  const text = pieces.join("");
  return text === "" ? [] : [{ text, bold, italic, color }];
}

function readPara(p: Element): Para {
  const props = firstChild(p, "w:pPr");
  const styleEl = props ? firstChild(props, "w:pStyle") : null;
  const style = styleEl?.getAttribute("w:val") ?? "Normal";
  const numbered = props ? firstChild(props, "w:numPr") !== null : false;

  const runs: Run[] = [];
  const collect = (parent: Element) => {
    for (const node of children(parent)) {
      if (node.nodeName === "w:r") runs.push(...readRun(node));
      else if (node.nodeName === "w:hyperlink" || node.nodeName === "w:smartTag")
        collect(node);
    }
  };
  collect(p);

  return { style, numbered, runs, text: runs.map((r) => r.text).join("") };
}

function readTable(tbl: Element): Table {
  const rows: Para[][][] = [];
  for (const tr of children(tbl)) {
    if (tr.nodeName !== "w:tr") continue;
    const cells: Para[][] = [];
    for (const tc of children(tr)) {
      if (tc.nodeName !== "w:tc") continue;
      cells.push(
        children(tc)
          .filter((c) => c.nodeName === "w:p")
          .map(readPara),
      );
    }
    rows.push(cells);
  }

  const grid = firstChild(tbl, "w:tblGrid");
  const widths = grid
    ? children(grid)
        .filter((c) => c.nodeName === "w:gridCol")
        .map((c) => Number.parseInt(c.getAttribute("w:w") ?? "0", 10))
        .filter((w) => Number.isFinite(w) && w > 0)
    : [];

  return { type: "table", rows, widths };
}

/** Reads a .docx and returns its body as an ordered list of nodes. */
export function readDocx(path: string): DocNode[] {
  const zip = unzipSync(new Uint8Array(readFileSync(path)));
  const entry = zip["word/document.xml"];
  if (!entry) {
    throw new Error(`${path} has no word/document.xml — is it a .docx?`);
  }

  const doc = new DOMParser().parseFromString(strFromU8(entry), "text/xml");
  const body = descendant(doc.documentElement as unknown as Element, "w:body");
  if (!body) throw new Error(`${path}: no w:body element`);

  const out: DocNode[] = [];
  const walk = (parent: Element) => {
    for (const node of children(parent)) {
      switch (node.nodeName) {
        case "w:p":
          out.push({ type: "para", ...readPara(node) });
          break;
        case "w:tbl":
          out.push(readTable(node));
          break;
        case "w:sdt": {
          // Structured-document tags wrap content; descend into it.
          const content = firstChild(node, "w:sdtContent");
          if (content) walk(content);
          break;
        }
        default:
          break;
      }
    }
  };
  walk(body);

  return out;
}
