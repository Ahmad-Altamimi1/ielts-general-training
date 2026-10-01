import { InlineMarkdown } from "@/components/content/inline-markdown";
import type { BlockOf } from "@/lib/content/schema";
import { slugify } from "@/lib/slug";

/* ===================================================================== *
 * Block renderers.
 *
 * Instructional-materials discipline throughout: structure comes from
 * rules and space, never from a filled box. The accent appears on section
 * numbers, step numbers and question numbers, and nowhere else.
 * ===================================================================== */

export function Prose({ block }: { block: BlockOf<"prose"> }) {
  return (
    <p className="measure">
      <InlineMarkdown md={block.md} />
    </p>
  );
}

/**
 * The content model numbers headings as the book does: the part is level
 * 1, the section level 2, so headings inside a section are 3 and 4. A
 * section page puts the section title in its `h1`, which moves everything
 * under it up one — and a page whose headings jump from `h1` to `h3` has
 * a broken outline for anyone reading by headings.
 */
export function Heading({ block }: { block: BlockOf<"heading"> }) {
  const id = slugify(block.text);

  return block.level === 3 ? (
    <h2
      id={id}
      className="font-heading mt-12 scroll-mt-20 text-xl font-semibold tracking-tight"
    >
      {block.text}
    </h2>
  ) : (
    <h3
      id={id}
      className="font-heading mt-8 scroll-mt-20 text-base font-semibold tracking-tight"
    >
      {block.text}
    </h3>
  );
}

export function List({ block }: { block: BlockOf<"list"> }) {
  // Ordered lists carry the accent on the number, because in this book the
  // number is the step of a method and the student counts through it.
  if (block.ordered) {
    return (
      <ol className="measure mt-4 space-y-3">
        {block.items.map((item, i) => (
          <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-x-1">
            <span
              aria-hidden="true"
              className="font-heading pt-px text-sm font-semibold text-brand tabular-nums"
            >
              {i + 1}.
            </span>
            <span>
              <InlineMarkdown md={item} />
            </span>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ul className="measure mt-4 space-y-3">
      {block.items.map((item, i) => (
        <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-x-1">
          <span aria-hidden="true" className="pt-px text-brand">
            &bull;
          </span>
          <span>
            <InlineMarkdown md={item} />
          </span>
        </li>
      ))}
    </ul>
  );
}

/** A thick accent bar on the left edge, no background fill.
 *
 *  A plain div, not an `aside`: a callout in the middle of a lesson is
 *  part of the lesson, and marking it as a complementary landmark would
 *  put a false signpost in the landmark list. */
export function Callout({ block }: { block: BlockOf<"callout"> }) {
  return (
    <div className="measure break-inside-avoid mt-6 border-l-4 border-brand pl-4 sm:pl-5">
      {block.title ? (
        <p className="font-heading text-sm font-semibold tracking-wide text-brand uppercase">
          {block.title}
        </p>
      ) : null}
      {block.body.map((paragraph, i) => (
        <p key={i} className={block.title && i === 0 ? "mt-2" : "mt-3 first:mt-0"}>
          <InlineMarkdown md={paragraph} />
        </p>
      ))}
    </div>
  );
}

/** Horizontal rules only, a bold header rule, no vertical lines, no zebra. */
export function ContentTable({ block }: { block: BlockOf<"table"> }) {
  const total = block.widths?.reduce((sum, w) => sum + w, 0);

  return (
    // A table wider than a phone scrolls sideways, so the scroll container
    // has to be reachable by keyboard: otherwise the right-hand columns
    // are unreadable without a mouse.
    <div
      role="region"
      aria-label={`${block.headers[0] || "Data"} table`}
      tabIndex={0}
      className="break-inside-avoid -mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0"
    >
      <table className="w-full min-w-xl border-collapse text-left text-[0.9375rem]">
        {block.widths && total ? (
          <colgroup>
            {block.widths.map((w, i) => (
              <col key={i} style={{ width: `${(w / total) * 100}%` }} />
            ))}
          </colgroup>
        ) : null}
        <thead>
          <tr className="border-b-2 border-rule-strong">
            {block.headers.map((header, i) => (
              <th
                key={i}
                scope="col"
                className="font-heading py-2 pr-4 align-bottom text-sm font-semibold last:pr-0"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row, r) => (
            <tr key={r} className="border-b border-rule last:border-b-0">
              {row.map((cell, c) => (
                <td key={c} className="py-2.5 pr-4 align-top last:pr-0">
                  <InlineMarkdown md={cell} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** A reading text or exam rubric: serif, because it is read under time
 *  pressure and at length. */
export function Passage({ block }: { block: BlockOf<"passage"> }) {
  return (
    <figure className="break-inside-avoid mt-6 border-y border-rule py-5">
      {block.title ? (
        <figcaption className="font-heading measure text-base font-semibold tracking-tight">
          {block.title}
        </figcaption>
      ) : null}
      <div className={block.title ? "mt-3" : undefined}>
        {block.paragraphs.map((paragraph, i) => (
          <p
            key={i}
            className={
              paragraph.label
                ? "passage-type measure grid grid-cols-[2rem_1fr] gap-x-1 first:mt-0 mt-4"
                : "passage-type measure first:mt-0 mt-4"
            }
          >
            {paragraph.label ? (
              <>
                <span className="font-heading text-sm font-semibold text-brand">
                  {paragraph.label}
                </span>
                <span>{paragraph.text}</span>
              </>
            ) : (
              paragraph.text
            )}
          </p>
        ))}
      </div>
    </figure>
  );
}

/** A question reasoned through in the open, before the student tries the
 *  same type unaided. */
export function Worked({ block }: { block: BlockOf<"worked"> }) {
  return (
    <div className="measure break-inside-avoid mt-6 border-l-4 border-rule pl-4 sm:pl-5">
      <p className="font-heading text-xs font-semibold tracking-wide text-ink-muted uppercase">
        Worked through
      </p>
      <p className="passage-type mt-2">{block.question}</p>

      <ol className="mt-4 space-y-2">
        {block.steps.map((step, i) => (
          <li key={i} className="grid grid-cols-[1.75rem_1fr] gap-x-1 text-[0.9375rem]">
            <span
              aria-hidden="true"
              className="font-heading pt-px text-sm font-semibold text-brand tabular-nums"
            >
              {i + 1}.
            </span>
            <span>
              <InlineMarkdown md={step} />
            </span>
          </li>
        ))}
      </ol>

      <p className="mt-4 border-t border-rule pt-3 text-sm">
        <span className="text-ink-muted">Answer </span>
        <span className="font-heading font-semibold text-brand">
          {block.answer}
        </span>
      </p>
    </div>
  );
}
