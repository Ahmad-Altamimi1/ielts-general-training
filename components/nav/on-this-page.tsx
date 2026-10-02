import type { Block } from "@/lib/content/schema";
import { slugify } from "@/lib/slug";

type Entry = { id: string; label: string; isExercise: boolean };

/** The landmarks worth jumping to: the section's own headings, and every
 *  exercise in it. */
function outline(blocks: readonly Block[]): Entry[] {
  const entries: Entry[] = [];

  for (const block of blocks) {
    if (block.kind === "heading" && block.level === 3) {
      entries.push({
        id: slugify(block.text),
        label: block.text,
        isExercise: false,
      });
    }
    if (block.kind === "exercise") {
      entries.push({
        id: `${block.exercise.id}-title`,
        label: block.exercise.title,
        isExercise: true,
      });
    }
  }

  return entries;
}

export function OnThisPage({ blocks }: { blocks: readonly Block[] }) {
  const entries = outline(blocks);
  if (entries.length < 2) return null;

  return (
    <nav
      aria-labelledby="on-this-page"
      className="print-hidden mt-10 border-t border-layer-border pt-5 lg:sticky lg:top-20 lg:mt-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-5"
    >
      <h2
        id="on-this-page"
        className="font-heading text-[0.6875rem] font-semibold tracking-wide text-ink-muted uppercase"
      >
        On this page
      </h2>
      <ul className="mt-3 space-y-0.5 lg:space-y-1.5">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a
              href={`#${entry.id}`}
              className="flex min-h-9 items-center py-1.5 text-sm text-ink-muted underline-offset-4 hover:text-ink hover:underline lg:min-h-0 lg:py-0"
            >
              {entry.isExercise ? (
                <span className="font-heading mr-1.5 text-[0.625rem] font-semibold tracking-wide text-tone uppercase">
                  Practice
                </span>
              ) : null}
              {entry.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
