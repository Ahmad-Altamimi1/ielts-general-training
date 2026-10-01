import type { ReactNode } from "react";

/* ===================================================================== *
 * The restricted inline markdown the schema allows: bold and emphasis.
 *
 * Hand-written rather than pulled from a library because the grammar is
 * two rules wide, and because parsing to React nodes keeps the content out
 * of `dangerouslySetInnerHTML` entirely.
 * ===================================================================== */

const TOKEN = /\\([\s\S])|\*\*([\s\S]+?)\*\*|\*([\s\S]+?)\*/g;

function parse(src: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let cursor = 0;
  let index = 0;

  for (const match of src.matchAll(TOKEN)) {
    const at = match.index;
    if (at > cursor) out.push(src.slice(cursor, at));

    const [whole, escaped, bold, emphasis] = match;
    const key = `${keyPrefix}-${index++}`;

    if (escaped !== undefined) {
      out.push(escaped);
    } else if (bold !== undefined) {
      out.push(
        <strong key={key} className="font-semibold">
          {parse(bold, key)}
        </strong>,
      );
    } else if (emphasis !== undefined) {
      out.push(<em key={key}>{parse(emphasis, key)}</em>);
    }

    cursor = at + whole.length;
  }

  if (cursor < src.length) out.push(src.slice(cursor));
  return out;
}

/** Renders bold and emphasis in a content string. Nothing else is markup. */
export function InlineMarkdown({ md }: { md: string }) {
  return <>{parse(md, "md")}</>;
}
