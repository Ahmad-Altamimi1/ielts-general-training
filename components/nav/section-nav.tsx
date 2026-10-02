import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { neighbours, sectionNumber } from "@/lib/content/registry";

/** Previous and next links at the foot of a section, crossing part
 *  boundaries so the book can be read straight through. */
export function SectionNav({
  partId,
  sectionId,
}: {
  partId: string;
  sectionId: string;
}) {
  const { previous, next } = neighbours(partId, sectionId);
  if (!previous && !next) return null;

  return (
    <nav
      aria-label="Section"
      className="print-hidden mt-14 grid gap-3 border-t border-rule pt-5 sm:grid-cols-2"
    >
      {previous ? (
        <Link
          href={`/${previous.part.id}/${encodeURIComponent(previous.section.id)}`}
          className="panel group flex flex-col gap-1 rounded-xl p-4 transition hover:border-tone hover:panel-lift"
        >
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Previous
          </span>
          <span className="text-sm">
            {sectionNumber(previous.section.id) ? (
              <>
                <span className="font-heading font-bold text-tone tabular-nums">
                  {sectionNumber(previous.section.id)}
                </span>{" "}
              </>
            ) : null}
            {previous.section.title}
          </span>
        </Link>
      ) : (
        <span aria-hidden="true" className="hidden sm:block" />
      )}

      {next ? (
        <Link
          href={`/${next.part.id}/${encodeURIComponent(next.section.id)}`}
          className="panel group flex flex-col gap-1 rounded-xl p-4 transition hover:border-tone hover:panel-lift sm:items-end sm:text-right"
        >
          <span className="flex items-center gap-1.5 text-xs text-ink-muted">
            Next
            <ArrowRight aria-hidden="true" className="size-3.5" />
          </span>
          <span className="text-sm">
            {sectionNumber(next.section.id) ? (
              <>
                <span className="font-heading font-bold text-tone tabular-nums">
                  {sectionNumber(next.section.id)}
                </span>{" "}
              </>
            ) : null}
            {next.section.title}
          </span>
        </Link>
      ) : null}
    </nav>
  );
}
