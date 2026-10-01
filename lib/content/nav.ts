import { partHref, partLabel, parts, sectionHref } from "./registry";

/** The navigation tree, reduced to what the sidebar needs and nothing
 *  more, so that it can cross into a client component cheaply. */
export type NavSection = {
  id: string;
  title: string;
  href: string;
};

export type NavPart = {
  id: string;
  /** "Part 3", or the title for front and back matter. */
  label: string;
  title: string;
  summary: string;
  href: string;
  sections: NavSection[];
};

export function navTree(): NavPart[] {
  return parts.map((part) => ({
    id: part.id,
    label: partLabel(part),
    title: part.title,
    summary: part.summary,
    href: partHref(part.id),
    sections: part.sections.map((section) => ({
      id: section.id,
      title: section.title,
      href: sectionHref(part.id, section.id),
    })),
  }));
}
